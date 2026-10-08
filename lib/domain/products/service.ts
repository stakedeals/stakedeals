import { db, schema } from "@/lib/db";
import { eq, and, sql, desc, asc, ilike, gte, lte, or } from "drizzle-orm";
import {
  CreateProductInput,
  UpdateProductInput,
  ModerateProductInput,
  ProductSdpRuleInput,
  ProductSdcRuleInput,
  UpdateInventoryInput,
} from "@/lib/validations/catalog";
import { recordAuditEvent } from "@/lib/domain/audit/service";
import { hasPermission } from "@/lib/domain/permissions/service";
import { SYSTEM_PERMISSIONS } from "@/lib/domain/permissions/constants";

export interface ProductQueryFilters {
  categoryId?: string;
  childCategoryId?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sellerId?: string;
  status?: string;
  purchaseContext?: string;
  isPublicOnly?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Creates a product for an APPROVED Partner or authorized Admin.
 * Enforces:
 * - Partner ownership attached server-side
 * - Slug uniqueness
 * - SKU uniqueness
 * - Child category belongs to category
 * - Inventory initialization in `inventory` table
 * - Listing moderation status: default DRAFT / PENDING_APPROVAL
 */
export async function createProduct(
  sellerId: string,
  input: CreateProductInput,
  options?: { autoApprove?: boolean; actorId?: string }
) {
  // 1. Verify seller is an APPROVED Partner
  const [seller] = await db
    .select({
      id: schema.users.id,
      partnerStatus: schema.users.partnerStatus,
      status: schema.users.status,
    })
    .from(schema.users)
    .where(eq(schema.users.id, sellerId))
    .limit(1);

  if (!seller) {
    throw new Error("Seller not found.");
  }

  if (seller.partnerStatus !== "APPROVED") {
    throw new Error("Only approved SD Partners can create product listings.");
  }

  if (seller.status !== "ACTIVE") {
    throw new Error("Seller account is suspended or inactive.");
  }

  // 2. Verify slug uniqueness
  const [existingSlug] = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.slug, input.slug))
    .limit(1);

  if (existingSlug) {
    throw new Error(`Product slug "${input.slug}" is already in use.`);
  }

  // 3. Verify SKU uniqueness
  const [existingSku] = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.sku, input.sku))
    .limit(1);

  if (existingSku) {
    throw new Error(`Product SKU "${input.sku}" is already in use.`);
  }

  // 4. Verify category existence
  const [category] = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.id, input.categoryId))
    .limit(1);

  if (!category) {
    throw new Error("Category does not exist.");
  }

  // 5. Verify child category if provided
  if (input.childCategoryId) {
    const [childCat] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, input.childCategoryId))
      .limit(1);

    if (!childCat) {
      throw new Error("Child category does not exist.");
    }
    if (childCat.parentId !== input.categoryId) {
      throw new Error("Child category does not belong to the selected parent category.");
    }
  }

  const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const initialStatus = options?.autoApprove ? "APPROVED" : "PENDING_APPROVAL";

  const productRecord = {
    id: productId,
    title: input.title,
    slug: input.slug,
    description: input.description,
    categoryId: input.categoryId,
    childCategoryId: input.childCategoryId || null,
    sellerId, // Enforced server-side
    sku: input.sku,
    pricePkr: input.pricePkr,
    sdcPrice: input.sdcPrice || null,
    stock: input.initialStock,
    purchaseContext: input.purchaseContext,
    isReturnable: input.isReturnable,
    returnWindowDays: input.returnWindowDays,
    status: initialStatus,
    moderatedBy: options?.autoApprove ? (options.actorId || sellerId) : null,
    moderatedAt: options?.autoApprove ? new Date() : null,
    rejectionReason: null,
    sdcRuleId: null,
    sdpRuleId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(schema.products).values(productRecord);

  // 6. Initialize Inventory record in PostgreSQL
  const inventoryId = `inv_${productId}`;
  await db.insert(schema.inventory).values({
    id: inventoryId,
    productId,
    quantityAvailable: input.initialStock,
    quantityReserved: 0,
    lowStockThreshold: 5,
    sku: input.sku,
    updatedAt: new Date(),
  });

  // 7. Add product images if provided
  if (input.images && input.images.length > 0) {
    for (let i = 0; i < input.images.length; i++) {
      const img = input.images[i];
      await db.insert(schema.productImages).values({
        id: `pimg_${productId}_${i}`,
        productId,
        url: img.url,
        displayOrder: img.displayOrder || i,
        isPrimary: img.isPrimary || i === 0,
        altText: img.altText || input.title,
        createdAt: new Date(),
      });
    }
  }

  await recordAuditEvent({
    actorId: options?.actorId || sellerId,
    action: "product.create",
    entityType: "product",
    entityId: productId,
    afterState: productRecord,
  });

  return productRecord;
}

/**
 * Updates a product. Verifies ownership if caller is a Partner, or RBAC if caller is Admin.
 */
export async function updateProduct(
  productId: string,
  callerId: string,
  input: UpdateProductInput
) {
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error("Product not found.");
  }

  const isAdmin = await hasPermission(callerId, SYSTEM_PERMISSIONS.PRODUCTS_EDIT);

  // IDOR check: If not admin, must be the owner
  if (!isAdmin && product.sellerId !== callerId) {
    throw new Error("Unauthorized: You do not own this product.");
  }

  // If partner is suspended, cannot edit
  const [caller] = await db
    .select({ status: schema.users.status, partnerStatus: schema.users.partnerStatus })
    .from(schema.users)
    .where(eq(schema.users.id, callerId))
    .limit(1);

  if (!isAdmin && caller?.partnerStatus !== "APPROVED") {
    throw new Error("Unauthorized: Active approved Partner status required.");
  }

  // Check slug conflict if updating slug
  if (input.slug && input.slug !== product.slug) {
    const [conflict] = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, input.slug))
      .limit(1);

    if (conflict && conflict.id !== productId) {
      throw new Error(`Product slug "${input.slug}" is already in use.`);
    }
  }

  // Check child category relationship if updating categories
  const categoryId = input.categoryId ?? product.categoryId;
  const childCategoryId = input.childCategoryId !== undefined ? input.childCategoryId : product.childCategoryId;

  if (childCategoryId) {
    const [childCat] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, childCategoryId))
      .limit(1);

    if (!childCat || childCat.parentId !== categoryId) {
      throw new Error("Child category does not belong to the selected category.");
    }
  }

  const updateData: Partial<typeof schema.products.$inferInsert> = {
    title: input.title ?? product.title,
    slug: input.slug ?? product.slug,
    description: input.description ?? product.description,
    categoryId,
    childCategoryId: childCategoryId || null,
    pricePkr: input.pricePkr ?? product.pricePkr,
    sdcPrice: input.sdcPrice !== undefined ? input.sdcPrice : product.sdcPrice,
    purchaseContext: input.purchaseContext ?? product.purchaseContext,
    isReturnable: input.isReturnable ?? product.isReturnable,
    returnWindowDays: input.returnWindowDays ?? product.returnWindowDays,
    updatedAt: new Date(),
  };

  // Partners cannot self-approve; edits by partner reset to PENDING_APPROVAL unless Admin edits
  if (!isAdmin && product.status === "APPROVED") {
    updateData.status = "PENDING_APPROVAL";
  }

  await db
    .update(schema.products)
    .set(updateData)
    .where(eq(schema.products.id, productId));

  await recordAuditEvent({
    actorId: callerId,
    action: "product.update",
    entityType: "product",
    entityId: productId,
    beforeState: product,
    afterState: updateData,
  });

  return { ...product, ...updateData };
}

/**
 * Moderates a product (APPROVE / REJECT / SUSPEND). Requires PRODUCTS_APPROVE permission.
 */
export async function moderateProduct(
  adminId: string,
  productId: string,
  input: ModerateProductInput
) {
  const canModerate = await hasPermission(adminId, SYSTEM_PERMISSIONS.PRODUCTS_APPROVE);
  if (!canModerate) {
    throw new Error("Unauthorized: Insufficient permissions to moderate product listings.");
  }

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error("Product not found.");
  }

  const updateData = {
    status: input.status,
    moderatedBy: adminId,
    moderatedAt: new Date(),
    rejectionReason: input.status === "REJECTED" ? (input.rejectionReason || "Listing rejected by moderation.") : null,
    updatedAt: new Date(),
  };

  await db
    .update(schema.products)
    .set(updateData)
    .where(eq(schema.products.id, productId));

  await recordAuditEvent({
    actorId: adminId,
    action: `product.moderate.${input.status.toLowerCase()}`,
    entityType: "product",
    entityId: productId,
    beforeState: { status: product.status },
    afterState: updateData,
  });

  return { ...product, ...updateData };
}

/**
 * Configures product-specific SDP reward rule. Server-authorized by REWARDS_MANAGE permission.
 * DOES NOT credit wallet or calculate rewards!
 */
export async function configureProductSdpRule(
  adminId: string,
  productId: string,
  input: ProductSdpRuleInput
) {
  const canManage = await hasPermission(adminId, SYSTEM_PERMISSIONS.REWARDS_MANAGE);
  if (!canManage) {
    throw new Error("Unauthorized: Admin REWARDS_MANAGE permission required.");
  }

  const ruleId = `psdp_${productId}`;
  const ruleRecord = {
    id: ruleId,
    productId,
    sdpAmount: input.sdpAmount,
    isActive: input.isActive ?? true,
    createdAt: new Date(),
  };

  await db
    .insert(schema.productSdpRules)
    .values(ruleRecord)
    .onConflictDoUpdate({
      target: schema.productSdpRules.productId,
      set: {
        sdpAmount: input.sdpAmount,
        isActive: input.isActive ?? true,
      },
    });

  await db
    .update(schema.products)
    .set({ sdpRuleId: ruleId, updatedAt: new Date() })
    .where(eq(schema.products.id, productId));

  await recordAuditEvent({
    actorId: adminId,
    action: "product.sdp_rule.configure",
    entityType: "product_sdp_rule",
    entityId: ruleId,
    afterState: ruleRecord,
  });

  return ruleRecord;
}

/**
 * Configures product-specific SDC reward rule. Server-authorized by REWARDS_MANAGE permission.
 * DOES NOT trigger tree distribution, pools, or wallet credits!
 */
export async function configureProductSdcRule(
  adminId: string,
  productId: string,
  input: ProductSdcRuleInput
) {
  const canManage = await hasPermission(adminId, SYSTEM_PERMISSIONS.REWARDS_MANAGE);
  if (!canManage) {
    throw new Error("Unauthorized: Admin REWARDS_MANAGE permission required.");
  }

  const ruleId = `psdc_${productId}`;
  const ruleRecord = {
    id: ruleId,
    productId,
    sdcLevels: input.sdcLevels,
    isActive: input.isActive ?? true,
    createdAt: new Date(),
  };

  await db
    .insert(schema.productSdcRules)
    .values(ruleRecord)
    .onConflictDoUpdate({
      target: schema.productSdcRules.productId,
      set: {
        sdcLevels: input.sdcLevels,
        isActive: input.isActive ?? true,
      },
    });

  await db
    .update(schema.products)
    .set({ sdcRuleId: ruleId, updatedAt: new Date() })
    .where(eq(schema.products.id, productId));

  await recordAuditEvent({
    actorId: adminId,
    action: "product.sdc_rule.configure",
    entityType: "product_sdc_rule",
    entityId: ruleId,
    afterState: ruleRecord,
  });

  return ruleRecord;
}

/**
 * Updates inventory for a product. Verifies partner ownership or Admin privilege.
 */
export async function updateInventory(
  callerId: string,
  productId: string,
  input: UpdateInventoryInput
) {
  const [product] = await db
    .select({ sellerId: schema.products.sellerId })
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error("Product not found.");
  }

  const isAdmin = await hasPermission(callerId, SYSTEM_PERMISSIONS.PRODUCTS_EDIT);
  if (!isAdmin && product.sellerId !== callerId) {
    throw new Error("Unauthorized: Cannot modify inventory of another seller's product.");
  }

  await db
    .update(schema.inventory)
    .set({
      quantityAvailable: input.quantityAvailable,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      updatedAt: new Date(),
    })
    .where(eq(schema.inventory.productId, productId));

  // Sync available stock count on product table
  await db
    .update(schema.products)
    .set({ stock: input.quantityAvailable, updatedAt: new Date() })
    .where(eq(schema.products.id, productId));

  await recordAuditEvent({
    actorId: callerId,
    action: "inventory.update",
    entityType: "inventory",
    entityId: productId,
    afterState: input,
  });

  return { productId, ...input };
}

/**
 * Manages product images. Enforces seller ownership.
 */
export async function addProductImage(
  callerId: string,
  productId: string,
  image: { url: string; displayOrder?: number; isPrimary?: boolean; altText?: string }
) {
  const [product] = await db
    .select({ sellerId: schema.products.sellerId })
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) throw new Error("Product not found.");

  const isAdmin = await hasPermission(callerId, SYSTEM_PERMISSIONS.PRODUCTS_EDIT);
  if (!isAdmin && product.sellerId !== callerId) {
    throw new Error("Unauthorized: Cannot add image to another seller's product.");
  }

  const id = `pimg_${productId}_${Date.now()}`;
  const record = {
    id,
    productId,
    url: image.url,
    displayOrder: image.displayOrder ?? 0,
    isPrimary: image.isPrimary ?? false,
    altText: image.altText || null,
    createdAt: new Date(),
  };

  await db.insert(schema.productImages).values(record);
  return record;
}

export async function deleteProductImage(callerId: string, imageId: string) {
  const [img] = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.id, imageId))
    .limit(1);

  if (!img) throw new Error("Image not found.");

  const [product] = await db
    .select({ sellerId: schema.products.sellerId })
    .from(schema.products)
    .where(eq(schema.products.id, img.productId))
    .limit(1);

  const isAdmin = await hasPermission(callerId, SYSTEM_PERMISSIONS.PRODUCTS_EDIT);
  if (!isAdmin && product?.sellerId !== callerId) {
    throw new Error("Unauthorized to delete this image.");
  }

  await db.delete(schema.productImages).where(eq(schema.productImages.id, imageId));
  return { success: true };
}

/**
 * Queries public catalog products.
 * Strict public filtering:
 * - Only status = 'APPROVED'
 * - Active seller check
 * - Parameterized filters and pagination
 */
export async function queryProducts(filters: ProductQueryFilters) {
  const page = Math.max(filters.page || 1, 1);
  const limit = Math.min(Math.max(filters.limit || 12, 1), 50);
  const offset = (page - 1) * limit;

  const conditions = [];

  // Public catalog constraint
  if (filters.isPublicOnly !== false) {
    conditions.push(eq(schema.products.status, "APPROVED"));
  } else if (filters.status) {
    conditions.push(eq(schema.products.status, filters.status));
  }

  if (filters.sellerId) {
    conditions.push(eq(schema.products.sellerId, filters.sellerId));
  }

  if (filters.categoryId) {
    conditions.push(eq(schema.products.categoryId, filters.categoryId));
  }

  if (filters.childCategoryId) {
    conditions.push(eq(schema.products.childCategoryId, filters.childCategoryId));
  }

  if (filters.purchaseContext) {
    conditions.push(
      or(
        eq(schema.products.purchaseContext, filters.purchaseContext),
        eq(schema.products.purchaseContext, "BOTH")
      )
    );
  }

  if (filters.minPrice) {
    conditions.push(gte(schema.products.pricePkr, filters.minPrice));
  }

  if (filters.maxPrice) {
    conditions.push(lte(schema.products.pricePkr, filters.maxPrice));
  }

  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(schema.products.title, term),
        ilike(schema.products.slug, term),
        ilike(schema.products.description, term),
        ilike(schema.products.sku, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.products)
    .where(whereClause);

  const total = Number(countResult?.count || 0);

  const productRows = await db
    .select({
      id: schema.products.id,
      title: schema.products.title,
      slug: schema.products.slug,
      description: schema.products.description,
      categoryId: schema.products.categoryId,
      childCategoryId: schema.products.childCategoryId,
      sellerId: schema.products.sellerId,
      sku: schema.products.sku,
      pricePkr: schema.products.pricePkr,
      sdcPrice: schema.products.sdcPrice,
      stock: schema.products.stock,
      purchaseContext: schema.products.purchaseContext,
      isReturnable: schema.products.isReturnable,
      returnWindowDays: schema.products.returnWindowDays,
      status: schema.products.status,
      createdAt: schema.products.createdAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      sellerName: schema.userProfiles.businessName,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .leftJoin(schema.userProfiles, eq(schema.products.sellerId, schema.userProfiles.userId))
    .where(whereClause)
    .orderBy(desc(schema.products.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch primary images for each product in batch
  const productIds = productRows.map((p) => p.id);
  const images = productIds.length > 0
    ? await db
        .select()
        .from(schema.productImages)
        .where(sql`${schema.productImages.productId} IN ${productIds}`)
        .orderBy(asc(schema.productImages.displayOrder))
    : [];

  const items = productRows.map((p) => ({
    ...p,
    images: images.filter((img) => img.productId === p.id),
  }));

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Gets a single product by slug for public viewing.
 */
export async function getProductBySlug(slug: string, options?: { allowNonPublic?: boolean }) {
  const [product] = await db
    .select({
      id: schema.products.id,
      title: schema.products.title,
      slug: schema.products.slug,
      description: schema.products.description,
      categoryId: schema.products.categoryId,
      childCategoryId: schema.products.childCategoryId,
      sellerId: schema.products.sellerId,
      sku: schema.products.sku,
      pricePkr: schema.products.pricePkr,
      sdcPrice: schema.products.sdcPrice,
      stock: schema.products.stock,
      purchaseContext: schema.products.purchaseContext,
      isReturnable: schema.products.isReturnable,
      returnWindowDays: schema.products.returnWindowDays,
      status: schema.products.status,
      sdpRuleId: schema.products.sdpRuleId,
      sdcRuleId: schema.products.sdcRuleId,
      createdAt: schema.products.createdAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      sellerBusinessName: schema.userProfiles.businessName,
      sellerCity: schema.userProfiles.city,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .leftJoin(schema.userProfiles, eq(schema.products.sellerId, schema.userProfiles.userId))
    .where(eq(schema.products.slug, slug))
    .limit(1);

  if (!product) return null;

  if (!options?.allowNonPublic && product.status !== "APPROVED") {
    return null; // Public cannot view unapproved products
  }

  // Load images
  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, product.id))
    .orderBy(asc(schema.productImages.displayOrder));

  // Load inventory
  const [inv] = await db
    .select()
    .from(schema.inventory)
    .where(eq(schema.inventory.productId, product.id))
    .limit(1);

  return {
    ...product,
    images,
    inventory: inv || null,
  };
}

/**
 * Gets product details by ID for seller or admin management.
 */
export async function getProductById(productId: string) {
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product) return null;

  const images = await db
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, productId))
    .orderBy(asc(schema.productImages.displayOrder));

  const [inv] = await db
    .select()
    .from(schema.inventory)
    .where(eq(schema.inventory.productId, productId))
    .limit(1);

  const [sdpRule] = await db
    .select()
    .from(schema.productSdpRules)
    .where(eq(schema.productSdpRules.productId, productId))
    .limit(1);

  const [sdcRule] = await db
    .select()
    .from(schema.productSdcRules)
    .where(eq(schema.productSdcRules.productId, productId))
    .limit(1);

  return {
    ...product,
    images,
    inventory: inv || null,
    sdpRule: sdpRule || null,
    sdcRule: sdcRule || null,
  };
}
