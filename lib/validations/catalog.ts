import { z } from "zod";

// ==========================================
// CATEGORY VALIDATIONS
// ==========================================

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(128).trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(128)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .trim(),
  description: z.string().max(1000).optional().nullable(),
  parentId: z.string().max(64).optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ==========================================
// PRODUCT VALIDATIONS
// ==========================================

export const productStatusSchema = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);

export const purchaseContextSchema = z.enum(["NORMAL", "SIGNUP", "BOTH"]);

export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255).trim(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .trim(),
  description: z.string().min(10, "Description must be at least 10 characters").trim(),
  categoryId: z.string().min(1, "Category is required"),
  childCategoryId: z.string().optional().nullable(),
  sku: z.string().min(3, "SKU must be at least 3 characters").max(64).trim().toUpperCase(),
  pricePkr: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "Price in PKR must be a valid numeric amount")
    .refine((v) => parseFloat(v) > 0, "Price must be greater than zero"),
  sdcPrice: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "SDC price must be a valid numeric amount")
    .optional()
    .nullable(),
  initialStock: z.number().int().min(0, "Stock cannot be negative").default(0),
  purchaseContext: purchaseContextSchema.default("NORMAL"),
  isReturnable: z.boolean().default(true),
  returnWindowDays: z.number().int().min(0).max(30).default(10),
  images: z
    .array(
      z.object({
        url: z.string().url("Valid image URL required"),
        displayOrder: z.number().int().default(0),
        isPrimary: z.boolean().default(false),
        altText: z.string().max(255).optional(),
      })
    )
    .default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  status: productStatusSchema.optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ==========================================
// REWARD RULE VALIDATIONS (FOUNDATION CONFIG)
// ==========================================

export const productSdpRuleSchema = z.object({
  sdpAmount: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, "SDP amount must be a valid numeric amount")
    .refine((v) => parseFloat(v) >= 0, "SDP amount cannot be negative"),
  isActive: z.boolean().default(true),
});

export type ProductSdpRuleInput = z.infer<typeof productSdpRuleSchema>;

export const productSdcRuleSchema = z.object({
  sdcLevels: z.record(
    z.string(),
    z
      .string()
      .regex(/^\d+(\.\d{1,4})?$/, "Level amount must be a valid numeric string")
      .refine((v) => parseFloat(v) >= 0, "Amount cannot be negative")
  ),
  isActive: z.boolean().default(true),
});

export type ProductSdcRuleInput = z.infer<typeof productSdcRuleSchema>;

// ==========================================
// INVENTORY UPDATE VALIDATION
// ==========================================

export const updateInventorySchema = z.object({
  quantityAvailable: z.number().int().min(0, "Inventory quantity cannot be negative"),
  lowStockThreshold: z.number().int().min(0).default(5),
});

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

// ==========================================
// MODERATION ACTION VALIDATION
// ==========================================

export const moderateProductSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
  rejectionReason: z.string().max(1000).optional().nullable(),
});

export type ModerateProductInput = z.infer<typeof moderateProductSchema>;
