import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. IDENTITY & RBAC FOUNDATION
// ==========================================

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 64 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"), // ACTIVE, SUSPENDED, PENDING_VERIFICATION
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    
    // Single User Model: every member is an SD Patron, Partner is a capability on the SAME user
    partnerStatus: varchar("partner_status", { length: 32 }).notNull().default("NONE"), // NONE, PENDING, APPROVED, REJECTED, SUSPENDED
    
    referralCode: varchar("referral_code", { length: 32 }).notNull().unique(),
    sponsorId: varchar("sponsor_id", { length: 64 }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_username_idx").on(table.username),
    uniqueIndex("users_referral_idx").on(table.referralCode),
    index("users_sponsor_idx").on(table.sponsorId),
  ]
);

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 64 }),
  addressLine: text("address_line"),
  city: varchar("city", { length: 128 }),
  country: varchar("country", { length: 64 }).default("Pakistan"),
  avatarUrl: text("avatar_url"),
  
  // Partner specific fields (enabled on partner approval on the SAME user)
  businessName: varchar("business_name", { length: 255 }),
  businessAddress: text("business_address"),
  businessPhone: varchar("business_phone", { length: 64 }),
  taxNumber: varchar("tax_number", { length: 64 }),
  
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roles = pgTable("roles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // owner, product_manager, cash_manager, partner_manager, sd_patron_manager, patron
  description: text("description"),
  isSystemRole: boolean("is_system_role").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(), // e.g. users.view, sdc.issue
  category: varchar("category", { length: 64 }).notNull(), // users, products, rewards, etc.
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 64 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    assignedBy: varchar("assigned_by", { length: 64 }),
  },
  (table) => [
    uniqueIndex("user_roles_unique_idx").on(table.userId, table.roleId),
    index("user_roles_user_idx").on(table.userId),
    index("user_roles_role_idx").on(table.roleId),
  ]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    roleId: varchar("role_id", { length: 64 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: varchar("permission_id", { length: 64 }).notNull().references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("role_permissions_unique_idx").on(table.roleId, table.permissionId),
    index("role_permissions_role_idx").on(table.roleId),
    index("role_permissions_perm_idx").on(table.permissionId),
  ]
);

// ==========================================
// 2. SPONSOR & GENEALOGY FOUNDATION
// ==========================================

export const sponsorRelationships = pgTable(
  "sponsor_relationships",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
    sponsorId: varchar("sponsor_id", { length: 64 }).notNull().references(() => users.id),
    depth: integer("depth").notNull().default(1),
    isCurrent: boolean("is_current").notNull().default(true),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    establishedAt: timestamp("established_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sponsor_rel_user_idx").on(table.userId),
    index("sponsor_rel_sponsor_idx").on(table.sponsorId),
    index("sponsor_rel_current_idx").on(table.userId, table.isCurrent),
  ]
);

export const genealogy = pgTable(
  "genealogy",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id).unique(),
    sponsorId: varchar("sponsor_id", { length: 64 }).references(() => users.id),
    
    // Explicit 10-level upline resolution
    level1Id: varchar("level1_id", { length: 64 }).references(() => users.id),
    level2Id: varchar("level2_id", { length: 64 }).references(() => users.id),
    level3Id: varchar("level3_id", { length: 64 }).references(() => users.id),
    level4Id: varchar("level4_id", { length: 64 }).references(() => users.id),
    level5Id: varchar("level5_id", { length: 64 }).references(() => users.id),
    level6Id: varchar("level6_id", { length: 64 }).references(() => users.id),
    level7Id: varchar("level7_id", { length: 64 }).references(() => users.id),
    level8Id: varchar("level8_id", { length: 64 }).references(() => users.id),
    level9Id: varchar("level9_id", { length: 64 }).references(() => users.id),
    level10Id: varchar("level10_id", { length: 64 }).references(() => users.id),
    
    path: text("path"), // Lineage path e.g. /1/4/9/
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("genealogy_user_idx").on(table.userId),
    index("genealogy_sponsor_idx").on(table.sponsorId),
    index("genealogy_l1_idx").on(table.level1Id),
  ]
);

// ==========================================
// 3. PLATFORM SETTINGS & AUDIT LOGS
// ==========================================

export const platformSettings = pgTable("platform_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by", { length: 64 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    actorId: varchar("actor_id", { length: 64 }),
    action: varchar("action", { length: 128 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }).notNull(),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_actor_idx").on(table.actorId),
    index("audit_action_idx").on(table.action),
    index("audit_entity_idx").on(table.entityType, table.entityId),
  ]
);

// ==========================================
// 4. WALLET & FINANCIAL ARCHITECTURE (NUMERIC)
// ==========================================

export const wallets = pgTable(
  "wallets",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    walletType: varchar("wallet_type", { length: 16 }).notNull(), // SDP or SDC
    balance: numeric("balance", { precision: 20, scale: 4 }).notNull().default("0.0000"),
    pendingBalance: numeric("pending_balance", { precision: 20, scale: 4 }).notNull().default("0.0000"),
    maturedBalance: numeric("matured_balance", { precision: 20, scale: 4 }).notNull().default("0.0000"),
    withdrawnTotal: numeric("withdrawn_total", { precision: 20, scale: 4 }).notNull().default("0.0000"),
    spentTotal: numeric("spent_total", { precision: 20, scale: 4 }).notNull().default("0.0000"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_wallet_type_idx").on(table.userId, table.walletType),
    index("wallets_user_idx").on(table.userId),
  ]
);

export const walletLedgerEntries = pgTable(
  "wallet_ledger_entries",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    walletId: varchar("wallet_id", { length: 64 }).notNull().references(() => wallets.id),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
    assetType: varchar("asset_type", { length: 16 }).notNull(), // SDP or SDC
    entryType: varchar("entry_type", { length: 16 }).notNull(), // CREDIT or DEBIT
    amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
    balanceAfter: numeric("balance_after", { precision: 20, scale: 4 }).notNull(),
    sourceType: varchar("source_type", { length: 64 }).notNull(), // QUALIFYING_SALE, MLM_TREE, ADMIN_ISSUANCE, POOL_DISTRIBUTION, TRANSFER_SEND, TRANSFER_RECEIVE, WITHDRAWAL, REVERSAL
    sourceId: varchar("source_id", { length: 64 }).notNull(),
    reference: text("reference"),
    reversalOfId: varchar("reversal_of_id", { length: 64 }),
    status: varchar("status", { length: 32 }).notNull().default("CONFIRMED"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ledger_wallet_idx").on(table.walletId),
    index("ledger_user_idx").on(table.userId),
    index("ledger_source_idx").on(table.sourceType, table.sourceId),
  ]
);

// Rank Qualification Ledger: HISTORICAL metric, separate from current wallet balance!
export const rankQualificationLedger = pgTable(
  "rank_qualification_ledger",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
    qualifyingSdcAmount: numeric("qualifying_sdc_amount", { precision: 20, scale: 4 }).notNull(),
    sourceType: varchar("source_type", { length: 64 }).notNull(), // QUALIFYING_PURCHASE, TREE_REWARD
    sourceTransactionId: varchar("source_transaction_id", { length: 64 }).notNull(),
    orderItemId: varchar("order_item_id", { length: 64 }),
    qualificationDate: timestamp("qualification_date", { withTimezone: true }).notNull(),
    evaluationPeriod: varchar("evaluation_period", { length: 16 }).notNull(), // YYYY-MM
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("rank_qual_user_idx").on(table.userId),
    index("rank_qual_period_idx").on(table.evaluationPeriod),
  ]
);

// ==========================================
// 5. PARTNER SYSTEM FOUNDATION
// ==========================================

export const partnerApplications = pgTable(
  "partner_applications",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    businessAddress: text("business_address").notNull(),
    businessPhone: varchar("business_phone", { length: 64 }).notNull(),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 64 }),
    status: varchar("status", { length: 32 }).notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, SUSPENDED
    reviewedBy: varchar("reviewed_by", { length: 64 }).references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("partner_apps_user_idx").on(table.userId),
    index("partner_apps_status_idx").on(table.status),
    index("partner_apps_reviewer_idx").on(table.reviewedBy),
  ]
);

export const partnerAgreements = pgTable(
  "partner_agreements",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    partnerId: varchar("partner_id", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    platformFeeSdc: numeric("platform_fee_sdc", { precision: 20, scale: 4 }).notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    version: varchar("version", { length: 32 }).notNull().default("1.0"),
    feeRecipientUserId: varchar("fee_recipient_user_id", { length: 64 }).notNull().references(() => users.id),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("partner_agreements_partner_idx").on(table.partnerId),
    index("partner_agreements_recipient_idx").on(table.feeRecipientUserId),
    index("partner_agreements_status_idx").on(table.status),
  ]
);

// ==========================================
// 6. MARKETPLACE (PRODUCTS, SERVICES, ORDERS)
// ==========================================

export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    description: text("description"),
    parentId: varchar("parent_id", { length: 64 }),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
    index("categories_active_idx").on(table.isActive),
  ]
);

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    categoryId: varchar("category_id", { length: 64 }).notNull().references(() => categories.id),
    childCategoryId: varchar("child_category_id", { length: 64 }).references(() => categories.id),
    sellerId: varchar("seller_id", { length: 64 }).notNull().references(() => users.id),
    sku: varchar("sku", { length: 64 }).notNull().unique(),
    pricePkr: numeric("price_pkr", { precision: 20, scale: 4 }).notNull(),
    sdcPrice: numeric("sdc_price", { precision: 20, scale: 4 }),
    stock: integer("stock").notNull().default(0),
    purchaseContext: varchar("purchase_context", { length: 32 }).notNull().default("NORMAL"), // NORMAL, SIGNUP, BOTH
    isReturnable: boolean("is_returnable").notNull().default(true),
    returnWindowDays: integer("return_window_days").notNull().default(10),
    status: varchar("status", { length: 32 }).notNull().default("DRAFT"), // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
    moderatedBy: varchar("moderated_by", { length: 64 }).references(() => users.id),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    sdcRuleId: varchar("sdc_rule_id", { length: 64 }),
    sdpRuleId: varchar("sdp_rule_id", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_sku_idx").on(table.sku),
    index("products_seller_idx").on(table.sellerId),
    index("products_category_idx").on(table.categoryId),
    index("products_child_category_idx").on(table.childCategoryId),
    index("products_status_idx").on(table.status),
    index("products_purchase_context_idx").on(table.purchaseContext),
  ]
);

export const services = pgTable("services", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  images: jsonb("images").notNull().default([]),
  categoryId: varchar("category_id", { length: 64 }).notNull().references(() => categories.id),
  providerId: varchar("provider_id", { length: 64 }).notNull().references(() => users.id),
  pricePkr: numeric("price_pkr", { precision: 20, scale: 4 }).notNull(),
  sdcPrice: numeric("sdc_price", { precision: 20, scale: 4 }),
  status: varchar("status", { length: 32 }).notNull().default("PENDING_APPROVAL"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    orderNumber: varchar("order_number", { length: 64 }).notNull().unique(),
    buyerId: varchar("buyer_id", { length: 64 }).notNull().references(() => users.id),
    grossAmountPkr: numeric("gross_amount_pkr", { precision: 20, scale: 4 }).notNull(),
    grossAmountSdc: numeric("gross_amount_sdc", { precision: 20, scale: 4 }).default("0.0000"),
    paymentMethod: varchar("payment_method", { length: 64 }).notNull(), // MANUAL_TRANSFER, SDC, etc.
    paymentStatus: varchar("payment_status", { length: 32 }).notNull().default("PENDING"), // PENDING, CONFIRMED, FAILED
    fulfillmentStatus: varchar("fulfillment_status", { length: 32 }).notNull().default("ORDER_PLACED"), // ORDER_PLACED, PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED, CANCELLED
    shippingDate: timestamp("shipping_date", { withTimezone: true }),
    trackingNumber: varchar("tracking_number", { length: 128 }),
    carrier: varchar("carrier", { length: 64 }),
    verifiedBy: varchar("verified_by", { length: 64 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    index("orders_buyer_idx").on(table.buyerId),
  ]
);

export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 64 }).notNull().references(() => products.id),
  sellerId: varchar("seller_id", { length: 64 }).notNull().references(() => users.id),
  quantity: integer("quantity").notNull().default(1),
  unitPricePkr: numeric("unit_price_pkr", { precision: 20, scale: 4 }).notNull(),
  unitPriceSdc: numeric("unit_price_sdc", { precision: 20, scale: 4 }).default("0.0000"),
  purchaseContext: varchar("purchase_context", { length: 32 }).notNull(),
  rewardSnapshot: jsonb("reward_snapshot"),
  shippingDate: timestamp("shipping_date", { withTimezone: true }),
  returnDeadline: timestamp("return_deadline", { withTimezone: true }),
  returnStatus: varchar("return_status", { length: 32 }).default("NONE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  previousStatus: varchar("previous_status", { length: 32 }),
  newStatus: varchar("new_status", { length: 32 }).notNull(),
  changedBy: varchar("changed_by", { length: 64 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 7. REWARD ENGINE & MATURITY
// ==========================================

export const rewardRules = pgTable("reward_rules", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  sdpAmount: numeric("sdp_amount", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  sdcLevels: jsonb("sdc_levels").notNull(), // { L1: 10, L2: 5, ..., L10: 1 } fixed amounts
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdpRewards = pgTable("sdp_rewards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id),
  recipientId: varchar("recipient_id", { length: 64 }).notNull().references(() => users.id),
  amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"), // PENDING, MATURED, REVERSED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcRewards = pgTable("sdc_rewards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id),
  originatingMemberId: varchar("originating_member_id", { length: 64 }).notNull().references(() => users.id),
  totalAmount: numeric("total_amount", { precision: 20, scale: 4 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("WAITING"), // WAITING, MATURED, REVERSED
  maturityStartDate: timestamp("maturity_start_date", { withTimezone: true }),
  maturityEndDate: timestamp("maturity_end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcTreeDistributions = pgTable("sdc_tree_distributions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sdcRewardId: varchar("sdc_reward_id", { length: 64 }).notNull().references(() => sdcRewards.id),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id),
  originatingMemberId: varchar("originating_member_id", { length: 64 }).notNull().references(() => users.id),
  recipientId: varchar("recipient_id", { length: 64 }).notNull().references(() => users.id),
  level: integer("level").notNull(), // 1 to 10
  amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
  isFallback: boolean("is_fallback").notNull().default(false),
  status: varchar("status", { length: 32 }).notNull().default("WAITING"), // WAITING, MATURED, REVERSED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 8. SDC ISSUANCE, TRANSFERS, POOLS, RANKS & WITHDRAWALS
// ==========================================

export const sdcIssuances = pgTable("sdc_issuances", {
  id: varchar("id", { length: 64 }).primaryKey(),
  recipientId: varchar("recipient_id", { length: 64 }).notNull().references(() => users.id),
  issuedBy: varchar("issued_by", { length: 64 }).notNull().references(() => users.id),
  sdcAmount: numeric("sdc_amount", { precision: 20, scale: 4 }).notNull(),
  cashPkrReceived: numeric("cash_pkr_received", { precision: 20, scale: 4 }).notNull(),
  sdcPkrRate: numeric("sdc_pkr_rate", { precision: 20, scale: 4 }).notNull(),
  paymentReference: text("payment_reference").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("CONFIRMED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcTransfers = pgTable("sdc_transfers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  senderId: varchar("sender_id", { length: 64 }).notNull().references(() => users.id),
  recipientId: varchar("recipient_id", { length: 64 }).notNull().references(() => users.id),
  amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("COMPLETED"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcPools = pgTable("sdc_pools", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"), // ACTIVE, ENDED_WAITING, SETTLED
  participatingRanks: jsonb("participating_ranks").notNull(), // array of rank IDs
  undistributedRecipientId: varchar("undistributed_recipient_id", { length: 64 }).notNull(),
  totalCollected: numeric("total_collected", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  totalDistributed: numeric("total_distributed", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcPoolContributions = pgTable("sdc_pool_contributions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  poolId: varchar("pool_id", { length: 64 }).notNull().references(() => sdcPools.id),
  sdcRewardId: varchar("sdc_reward_id", { length: 64 }).notNull().references(() => sdcRewards.id),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id),
  originatingUserId: varchar("originating_user_id", { length: 64 }).notNull().references(() => users.id),
  amount: numeric("amount", { precision: 20, scale: 4 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("WAITING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rankDefinitions = pgTable("rank_definitions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  rankOrder: integer("rank_order").notNull().unique(), // 1, 2, 3...
  requiredSdp: numeric("required_sdp", { precision: 20, scale: 4 }).notNull(),
  requiredSdc: numeric("required_sdc", { precision: 20, scale: 4 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberRankHistory = pgTable("member_rank_history", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  previousRankId: varchar("previous_rank_id", { length: 64 }),
  newRankId: varchar("new_rank_id", { length: 64 }).notNull(),
  evaluationPeriod: varchar("evaluation_period", { length: 16 }).notNull(), // YYYY-MM
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  sdpAmount: numeric("sdp_amount", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  sdcAmount: numeric("sdc_amount", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  pkrAmount: numeric("pkr_amount", { precision: 20, scale: 4 }).notNull(),
  sdpRateSnapshot: numeric("sdp_rate_snapshot", { precision: 20, scale: 4 }).notNull(),
  sdcRateSnapshot: numeric("sdc_rate_snapshot", { precision: 20, scale: 4 }).notNull(),
  payoutMethod: varchar("payout_method", { length: 32 }).notNull(), // BANK, JAZZCASH, EASYPAISA
  destinationSnapshot: jsonb("destination_snapshot").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("REQUESTED"), // REQUESTED, PROCESSING, PAID, REJECTED
  trxId: varchar("trx_id", { length: 128 }),
  processedBy: varchar("processed_by", { length: 64 }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const returns = pgTable("returns", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  quantity: integer("quantity").notNull().default(1),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("REQUESTED"), // REQUESTED, APPROVED, REJECTED, RETURNED, REFUNDED
  processedBy: varchar("processed_by", { length: 64 }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 9. REFINED MARKETPLACE, LOGISTICS & PAYMENT ENGINE
// ==========================================

export const productImages = pgTable("product_images", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  altText: varchar("alt_text", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productSdcRules = pgTable("product_sdc_rules", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull().references(() => products.id, { onDelete: "cascade" }).unique(),
  sdcLevels: jsonb("sdc_levels").notNull(), // { L1: "10.0000", L2: "5.0000", ..., L10: "1.0000" } fixed amounts
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productSdpRules = pgTable("product_sdp_rules", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull().references(() => products.id, { onDelete: "cascade" }).unique(),
  sdpAmount: numeric("sdp_amount", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull().references(() => products.id, { onDelete: "cascade" }).unique(),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  quantityReserved: integer("quantity_reserved").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  sku: varchar("sku", { length: 128 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shipments = pgTable("shipments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  carrier: varchar("carrier", { length: 64 }).notNull(),
  trackingNumber: varchar("tracking_number", { length: 128 }).notNull(),
  shippingDate: timestamp("shipping_date", { withTimezone: true }).notNull(), // Day 1 for 10-day maturity
  estimatedDeliveryDate: timestamp("estimated_delivery_date", { withTimezone: true }),
  actualDeliveryDate: timestamp("actual_delivery_date", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull().default("SHIPPED"), // PREPARING, SHIPPED, IN_TRANSIT, DELIVERED
  shippingNotes: text("shipping_notes"),
  createdBy: varchar("created_by", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shipmentTracking = pgTable("shipment_tracking", {
  id: varchar("id", { length: 64 }).primaryKey(),
  shipmentId: varchar("shipment_id", { length: 64 }).notNull().references(() => shipments.id, { onDelete: "cascade" }),
  checkpointStatus: varchar("checkpoint_status", { length: 64 }).notNull(),
  location: varchar("location", { length: 255 }),
  notes: text("notes"),
  checkpointTime: timestamp("checkpoint_time", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("order_id", { length: 64 }).notNull().references(() => orders.id),
  paymentMethod: varchar("payment_method", { length: 32 }).notNull(), // MANUAL, BANK, JAZZCASH, EASYPAISA, STRIPE, PAYPAL
  amountPkr: numeric("amount_pkr", { precision: 20, scale: 4 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"), // PENDING, CONFIRMED, REJECTED
  transactionReference: varchar("transaction_reference", { length: 128 }),
  verifiedBy: varchar("verified_by", { length: 64 }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentEvents = pgTable("payment_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  paymentId: varchar("payment_id", { length: 64 }).notNull().references(() => payments.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 64 }).notNull(), // PAYMENT_SUBMITTED, PAYMENT_CONFIRMED, PAYMENT_REJECTED
  payloadSnapshot: jsonb("payload_snapshot"),
  actorId: varchar("actor_id", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rewardRuleSnapshots = pgTable("reward_rule_snapshots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id).unique(),
  ruleType: varchar("rule_type", { length: 32 }).notNull(), // PRODUCT_OVERRIDE, SYSTEM_DEFAULT
  sdpAmountSnapshot: numeric("sdp_amount_snapshot", { precision: 20, scale: 4 }).notNull(),
  sdcLevelsSnapshot: jsonb("sdc_levels_snapshot").notNull(),
  snapshottedAt: timestamp("snapshotted_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 10. PAYOUT, REVERSAL, RANK & POOL REFINEMENTS
// ==========================================

export const withdrawalPayoutSnapshots = pgTable("withdrawal_payout_snapshots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  withdrawalId: varchar("withdrawal_id", { length: 64 }).notNull().references(() => withdrawals.id).unique(),
  destinationSnapshot: jsonb("destination_snapshot").notNull(),
  rateSnapshotPkrPerSdp: numeric("rate_snapshot_pkr_per_sdp", { precision: 20, scale: 4 }),
  rateSnapshotPkrPerSdc: numeric("rate_snapshot_pkr_per_sdc", { precision: 20, scale: 4 }),
  snapshottedAt: timestamp("snapshotted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payoutTransactions = pgTable("payout_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  withdrawalId: varchar("withdrawal_id", { length: 64 }).notNull().references(() => withdrawals.id),
  payoutMethod: varchar("payout_method", { length: 32 }).notNull(),
  trxId: varchar("trx_id", { length: 128 }).notNull().unique(),
  amountPkr: numeric("amount_pkr", { precision: 20, scale: 4 }).notNull(),
  processedBy: varchar("processed_by", { length: 64 }).notNull().references(() => users.id),
  status: varchar("status", { length: 32 }).notNull().default("COMPLETED"), // INITIATED, COMPLETED, FAILED
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const returnItems = pgTable("return_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  returnId: varchar("return_id", { length: 64 }).notNull().references(() => returns.id),
  orderItemId: varchar("order_item_id", { length: 64 }).notNull().references(() => orderItems.id),
  quantity: integer("quantity").notNull().default(1),
  condition: varchar("condition", { length: 64 }).default("RETURNED_UNOPENED"),
  refundAmountPkr: numeric("refund_amount_pkr", { precision: 20, scale: 4 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rewardReversals = pgTable("reward_reversals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  returnId: varchar("return_id", { length: 64 }).notNull().references(() => returns.id),
  rewardType: varchar("reward_type", { length: 32 }).notNull(), // SDP, SDC_TREE, SDC_POOL
  originalRewardId: varchar("original_reward_id", { length: 64 }).notNull(),
  reversedAmount: numeric("reversed_amount", { precision: 20, scale: 4 }).notNull(),
  ledgerReferenceId: varchar("ledger_reference_id", { length: 64 }),
  reason: text("reason").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rankRequirements = pgTable("rank_requirements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  rankId: varchar("rank_id", { length: 64 }).notNull().references(() => rankDefinitions.id),
  requirementType: varchar("requirement_type", { length: 32 }).notNull(), // SDP, SDC, QUALIFYING_ACTIVITY
  requiredThreshold: numeric("required_threshold", { precision: 20, scale: 4 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const monthlyRankEvaluations = pgTable("monthly_rank_evaluations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  evaluationPeriod: varchar("evaluation_period", { length: 16 }).notNull(), // YYYY-MM
  qualifyingSdpSnapshot: numeric("qualifying_sdp_snapshot", { precision: 20, scale: 4 }).notNull(),
  qualifyingHistoricalSdcSnapshot: numeric("qualifying_historical_sdc_snapshot", { precision: 20, scale: 4 }).notNull(),
  previousRankId: varchar("previous_rank_id", { length: 64 }),
  evaluatedRankId: varchar("evaluated_rank_id", { length: 64 }).notNull(),
  actionTaken: varchar("action_taken", { length: 32 }).notNull(), // PROMOTED, MAINTAINED, DEMOTED_ONE_RANK
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 32 }).notNull().default("SYSTEM"), // SYSTEM, ORDER, REWARD, RANK, WITHDRAWAL
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcPoolSnapshots = pgTable("sdc_pool_snapshots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  poolId: varchar("pool_id", { length: 64 }).notNull().references(() => sdcPools.id),
  participatingRanks: jsonb("participating_ranks").notNull(),
  totalEligibleMembersCount: integer("total_eligible_members_count").notNull(),
  snapshottedAt: timestamp("snapshotted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcPoolRankMembers = pgTable("sdc_pool_rank_members", {
  id: varchar("id", { length: 64 }).primaryKey(),
  poolId: varchar("pool_id", { length: 64 }).notNull().references(() => sdcPools.id),
  rankId: varchar("rank_id", { length: 64 }).notNull(),
  memberUserId: varchar("member_user_id", { length: 64 }).notNull().references(() => users.id),
  snapshottedAt: timestamp("snapshotted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcPoolRankDistributions = pgTable("sdc_pool_rank_distributions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  poolId: varchar("pool_id", { length: 64 }).notNull().references(() => sdcPools.id),
  rankId: varchar("rank_id", { length: 64 }).notNull(),
  rankShareAmount: numeric("rank_share_amount", { precision: 20, scale: 4 }).notNull(),
  eligibleMembersCount: integer("eligible_members_count").notNull(),
  perMemberShareAmount: numeric("per_member_share_amount", { precision: 20, scale: 4 }).notNull(),
  undistributedAmount: numeric("undistributed_amount", { precision: 20, scale: 4 }).notNull().default("0.0000"),
  undistributedRecipientId: varchar("undistributed_recipient_id", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sdcPoolMemberDistributions = pgTable("sdc_pool_member_distributions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  poolId: varchar("pool_id", { length: 64 }).notNull().references(() => sdcPools.id),
  rankId: varchar("rank_id", { length: 64 }).notNull(),
  memberUserId: varchar("member_user_id", { length: 64 }).notNull().references(() => users.id),
  distributedAmount: numeric("distributed_amount", { precision: 20, scale: 4 }).notNull(),
  walletLedgerId: varchar("wallet_ledger_id", { length: 64 }),
  status: varchar("status", { length: 32 }).notNull().default("SETTLED"),
  distributedAt: timestamp("distributed_at", { withTimezone: true }).notNull().defaultNow(),
});
