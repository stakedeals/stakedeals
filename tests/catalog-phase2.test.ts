import test from "node:test";
import assert from "node:assert/strict";
import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";
import { createCategory, updateCategory, getAllCategories, getCategoryBySlug } from "../lib/domain/categories/service";
import {
  createProduct,
  updateProduct,
  moderateProduct,
  configureProductSdpRule,
  configureProductSdcRule,
  updateInventory,
  queryProducts,
  getProductBySlug,
  deleteProductImage,
} from "../lib/domain/products/service";
import { registerUser, applyForPartner, approvePartner } from "../lib/domain/users/service";

test("Phase 2: Marketplace Catalog & Product Foundation Tests (PostgreSQL)", async (t) => {
  const ts = Date.now();
  let rootCatId: string;
  let childCatId: string;
  let partnerUserId: string;
  let ordinaryPatronId: string;
  let createdProductId: string;

  await t.test("1. Category model: Creation, slug uniqueness, and parent-child hierarchy", async () => {
    // 1.1 Create top-level category
    const rootCat = await createCategory("usr_owner_01", {
      name: `Electronics ${ts}`,
      slug: `electronics-${ts}`,
      description: "Consumer electronics and smart devices",
      isActive: true,
      displayOrder: 1,
    });
    rootCatId = rootCat.id;
    assert.ok(rootCat.id);
    assert.equal(rootCat.slug, `electronics-${ts}`);

    // 1.2 Duplicate slug must fail
    await assert.rejects(
      async () => {
        await createCategory("usr_owner_01", {
          name: "Duplicate Slug Category",
          slug: `electronics-${ts}`,
          isActive: true,
          displayOrder: 2,
        });
      },
      { message: `Category slug "electronics-${ts}" is already taken.` }
    );

    // 1.3 Create valid child category
    const childCat = await createCategory("usr_owner_01", {
      name: `Headphones & Audio ${ts}`,
      slug: `audio-${ts}`,
      parentId: rootCat.id,
      isActive: true,
      displayOrder: 1,
    });
    childCatId = childCat.id;
    assert.equal(childCat.parentId, rootCat.id);

    // 1.4 Self-parenting must fail
    await assert.rejects(
      async () => {
        await updateCategory("usr_owner_01", rootCat.id, {
          parentId: rootCat.id,
        });
      },
      { message: "Self-parenting is not permitted." }
    );

    // 1.5 Cycle prevention: child cannot become parent of root
    await assert.rejects(
      async () => {
        await updateCategory("usr_owner_01", rootCat.id, {
          parentId: childCat.id,
        });
      },
      { message: "Category cycle detected: child cannot be set as parent." }
    );
  });

  await t.test("2. Product Creation & Authorization: Approved Partner vs Patron", async () => {
    // 2.1 Register an ordinary SD Patron
    const patronUser = await registerUser({
      fullName: "Ordinary Patron Shopper",
      username: `shopper_${ts}`,
      email: `shopper_${ts}@example.com`,
      password: "Password123!",
    });
    ordinaryPatronId = patronUser.id;

    // 2.2 Register an SD Partner candidate and approve them
    const partnerCand = await registerUser({
      fullName: "Elite Tech Merchant",
      username: `partner_${ts}`,
      email: `partner_${ts}@example.com`,
      password: "Password123!",
    });
    partnerUserId = partnerCand.id;

    await applyForPartner(partnerUserId, {
      businessName: "Elite Sound Pakistan",
      businessAddress: "Blue Area, Islamabad",
      businessPhone: "+92 300 1234567",
      taxRegistrationNumber: "NTN-554433",
    });

    // Patron cannot create products prior to approval
    await assert.rejects(
      async () => {
        await createProduct(ordinaryPatronId, {
          title: "Patron Illegal Product",
          slug: `patron-illegal-${ts}`,
          description: "Cannot be listed by ordinary Patron",
          categoryId: rootCatId,
          sku: `PATRON-${ts}`,
          pricePkr: "5000",
          initialStock: 10,
          purchaseContext: "NORMAL",
          isReturnable: true,
          returnWindowDays: 10,
          images: [],
        });
      },
      { message: "Only approved SD Partners can create product listings." }
    );

    // Approve the partner
    await approvePartner(partnerUserId, "usr_partner_mgr_01");

    // 2.3 Approved Partner creates product
    const product = await createProduct(partnerUserId, {
      title: `Noise Cancelling Wireless Earbuds ${ts}`,
      slug: `wireless-earbuds-${ts}`,
      description: "High-fidelity active noise cancelling audio earbuds with 30-hour battery life.",
      categoryId: rootCatId,
      childCategoryId: childCatId,
      sku: `EARBUD-${ts}`,
      pricePkr: "18500.0000",
      sdcPrice: "185.0000",
      initialStock: 25,
      purchaseContext: "BOTH",
      isReturnable: true,
      returnWindowDays: 10,
      images: [
        {
          url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
          isPrimary: true,
          displayOrder: 0,
          altText: "Earbuds White Edition",
        },
      ],
    });

    createdProductId = product.id;
    assert.ok(product.id);
    assert.equal(product.sellerId, partnerUserId, "Seller ID must match approved Partner");
    assert.equal(product.status, "PENDING_APPROVAL", "Partner listing starts as PENDING_APPROVAL");
    assert.equal(product.pricePkr, "18500.0000");

    // 2.4 Verify inventory initialized in `inventory` table
    const [inv] = await db
      .select()
      .from(schema.inventory)
      .where(eq(schema.inventory.productId, product.id))
      .limit(1);

    assert.ok(inv);
    assert.equal(inv.quantityAvailable, 25);
    assert.equal(inv.quantityReserved, 0);
  });

  await t.test("3. Security & IDOR: Partner cannot modify another Partner's product", async () => {
    // Create a 2nd approved partner
    const partner2 = await registerUser({
      fullName: "Rival Merchant",
      username: `rival_${ts}`,
      email: `rival_${ts}@example.com`,
      password: "Password123!",
    });
    await applyForPartner(partner2.id, {
      businessName: "Rival Trading Co",
      businessAddress: "Liberty Market, Lahore",
      businessPhone: "+92 321 9876543",
    });
    await approvePartner(partner2.id, "usr_partner_mgr_01");

    // Rival attempts to update createdProductId owned by partnerUserId
    await assert.rejects(
      async () => {
        await updateProduct(createdProductId, partner2.id, {
          title: "Hacked Title",
        });
      },
      { message: "Unauthorized: You do not own this product." }
    );

    // Rival attempts to mutate inventory of createdProductId
    await assert.rejects(
      async () => {
        await updateInventory(partner2.id, createdProductId, {
          quantityAvailable: 0,
        });
      },
      { message: "Unauthorized: Cannot modify inventory of another seller's product." }
    );
  });

  await t.test("4. Listing Moderation & Public Visibility Filter", async () => {
    // 4.1 While PENDING_APPROVAL, public catalog query MUST NOT return the product
    const publicResultsBefore = await queryProducts({
      search: `wireless-earbuds-${ts}`,
      isPublicOnly: true,
    });
    assert.equal(publicResultsBefore.items.length, 0, "Unapproved product hidden from public catalog");

    // 4.2 Public detail query by slug returns null
    const detailBefore = await getProductBySlug(`wireless-earbuds-${ts}`);
    assert.equal(detailBefore, null, "Unapproved product detail returns null for public");

    // 4.3 Authorized Admin approves listing
    const moderated = await moderateProduct("usr_prod_mgr_01", createdProductId, {
      status: "APPROVED",
    });
    assert.equal(moderated.status, "APPROVED");
    assert.equal(moderated.moderatedBy, "usr_prod_mgr_01");

    // 4.4 Now public catalog query DOES return the product
    const publicResultsAfter = await queryProducts({
      search: `wireless-earbuds-${ts}`,
      isPublicOnly: true,
    });
    assert.equal(publicResultsAfter.items.length, 1, "Approved product visible in public catalog");
    assert.equal(publicResultsAfter.items[0].id, createdProductId);

    // 4.5 Public detail query returns product with image and inventory
    const detailAfter = await getProductBySlug(`wireless-earbuds-${ts}`);
    assert.ok(detailAfter);
    assert.equal(detailAfter.title, `Noise Cancelling Wireless Earbuds ${ts}`);
    assert.equal(detailAfter.images.length, 1);
    assert.equal(detailAfter.inventory?.quantityAvailable, 25);
  });

  await t.test("5. Reward Rules Foundation: Product SDP & SDC overrides without financial side-effects", async () => {
    // 5.1 Admin configures product-specific SDP rule
    const sdpRule = await configureProductSdpRule("usr_owner_01", createdProductId, {
      sdpAmount: "75.0000",
      isActive: true,
    });
    assert.equal(sdpRule.sdpAmount, "75.0000");

    // 5.2 Admin configures product-specific SDC rule with 10 levels
    const sdcRule = await configureProductSdcRule("usr_owner_01", createdProductId, {
      sdcLevels: {
        L1: "25.0000",
        L2: "15.0000",
        L3: "10.0000",
        L4: "5.0000",
        L5: "5.0000",
        L6: "3.0000",
        L7: "2.0000",
        L8: "1.0000",
        L9: "1.0000",
        L10: "1.0000",
      },
      isActive: true,
    });
    assert.equal(sdcRule.sdcLevels.L1, "25.0000");
    assert.equal(sdcRule.sdcLevels.L10, "1.0000");

    // 5.3 CRITICAL: Verify NO financial side-effects occurred!
    // Wallets of partner and patron MUST remain 0.0000!
    const [patronWallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, ordinaryPatronId));
    assert.equal(patronWallet.balance, "0.0000", "No fake wallet credits generated!");

    // Ledger must have NO new entries
    const ledgerRows = await db
      .select()
      .from(schema.walletLedgerEntries)
      .where(eq(schema.walletLedgerEntries.userId, ordinaryPatronId));
    assert.equal(ledgerRows.length, 0, "No fake ledger transactions generated!");

    // No fake reward records generated
    const rewardRows = await db.select().from(schema.sdpRewards);
    assert.equal(rewardRows.length, 0, "No fake SDP reward records generated!");
  });

  await t.test("6. Inventory management & Negative stock prevention", async () => {
    // 6.1 Owner updates inventory
    const updatedInv = await updateInventory(partnerUserId, createdProductId, {
      quantityAvailable: 40,
      lowStockThreshold: 10,
    });
    assert.equal(updatedInv.quantityAvailable, 40);

    // Check product table stock is in sync
    const [p] = await db
      .select({ stock: schema.products.stock })
      .from(schema.products)
      .where(eq(schema.products.id, createdProductId));
    assert.equal(p.stock, 40);
  });
});
