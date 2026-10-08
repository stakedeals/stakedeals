export const SYSTEM_ROLES = {
  OWNER: "owner",
  PRODUCT_MANAGER: "product_manager",
  CASH_MANAGER: "cash_manager",
  PARTNER_MANAGER: "partner_manager",
  SD_PATRON_MANAGER: "sd_patron_manager",
  PATRON: "patron",
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

export const ROLE_DEFINITIONS = [
  {
    slug: SYSTEM_ROLES.OWNER,
    name: "Owner",
    description: "Super Administrator with complete platform authority and all administrative capabilities.",
    isSystemRole: true,
  },
  {
    slug: SYSTEM_ROLES.PRODUCT_MANAGER,
    name: "Product Manager",
    description: "Responsible for reviewing products, approving listings, categories, and moderation.",
    isSystemRole: true,
  },
  {
    slug: SYSTEM_ROLES.CASH_MANAGER,
    name: "Cash Manager",
    description: "Responsible for withdrawal review, external manual payout execution, and TRX entry.",
    isSystemRole: true,
  },
  {
    slug: SYSTEM_ROLES.PARTNER_MANAGER,
    name: "Partner Manager",
    description: "Responsible for reviewing and approving SD Partner applications and status.",
    isSystemRole: true,
  },
  {
    slug: SYSTEM_ROLES.SD_PATRON_MANAGER,
    name: "SD Patron Manager",
    description: "Responsible for reviewing applicable Patron memberships and approvals.",
    isSystemRole: true,
  },
  {
    slug: SYSTEM_ROLES.PATRON,
    name: "SD Patron",
    description: "Default standard member account with purchasing, referral, and wallet capabilities.",
    isSystemRole: true,
  },
];

export const SYSTEM_PERMISSIONS = {
  // Users & Members
  USERS_VIEW: "users.view",
  USERS_EDIT: "users.edit",
  USERS_APPROVE: "users.approve",
  
  // Products & Services
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_APPROVE: "products.approve",
  PRODUCTS_EDIT: "products.edit",
  SERVICES_CREATE: "services.create",
  SERVICES_APPROVE: "services.approve",
  SERVICES_EDIT: "services.edit",
  
  // Orders & Marketplace
  ORDERS_VIEW: "orders.view",
  ORDERS_UPDATE_STATUS: "orders.update_status",
  
  // Rewards & Genealogy
  REWARDS_VIEW: "rewards.view",
  REWARDS_MANAGE: "rewards.manage",
  
  // Wallets & Financials
  WALLETS_VIEW: "wallets.view",
  WALLETS_MANAGE: "wallets.manage",
  SDC_ISSUE: "sdc.issue",
  SDC_TRANSFER: "sdc.transfer",
  
  // Pools & Ranks
  POOLS_CREATE: "pools.create",
  POOLS_SETTLE: "pools.settle",
  RANKS_MANAGE: "ranks.manage",
  
  // Withdrawals & Payouts
  WITHDRAWALS_VIEW: "withdrawals.view",
  WITHDRAWALS_PROCESS: "withdrawals.process",
  
  // Partners
  PARTNERS_APPROVE: "partners.approve",
  PARTNERS_MANAGE_AGREEMENT: "partners.manage_agreement",
  
  // Platform & Audit
  PLATFORM_SETTINGS_MANAGE: "platform-settings.manage",
  AUDIT_VIEW: "audit.view",
} as const;

export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

export const PERMISSION_DEFINITIONS = [
  { slug: SYSTEM_PERMISSIONS.USERS_VIEW, name: "View Users", category: "users" },
  { slug: SYSTEM_PERMISSIONS.USERS_EDIT, name: "Edit Users", category: "users" },
  { slug: SYSTEM_PERMISSIONS.USERS_APPROVE, name: "Approve Users", category: "users" },

  { slug: SYSTEM_PERMISSIONS.PRODUCTS_CREATE, name: "Create Products", category: "products" },
  { slug: SYSTEM_PERMISSIONS.PRODUCTS_APPROVE, name: "Approve Products", category: "products" },
  { slug: SYSTEM_PERMISSIONS.PRODUCTS_EDIT, name: "Edit Products", category: "products" },
  { slug: SYSTEM_PERMISSIONS.SERVICES_CREATE, name: "Create Services", category: "services" },
  { slug: SYSTEM_PERMISSIONS.SERVICES_APPROVE, name: "Approve Services", category: "services" },
  { slug: SYSTEM_PERMISSIONS.SERVICES_EDIT, name: "Edit Services", category: "services" },

  { slug: SYSTEM_PERMISSIONS.ORDERS_VIEW, name: "View Orders", category: "orders" },
  { slug: SYSTEM_PERMISSIONS.ORDERS_UPDATE_STATUS, name: "Update Order Status", category: "orders" },

  { slug: SYSTEM_PERMISSIONS.REWARDS_VIEW, name: "View Rewards", category: "rewards" },
  { slug: SYSTEM_PERMISSIONS.REWARDS_MANAGE, name: "Manage Rewards", category: "rewards" },

  { slug: SYSTEM_PERMISSIONS.WALLETS_VIEW, name: "View Wallets", category: "wallets" },
  { slug: SYSTEM_PERMISSIONS.WALLETS_MANAGE, name: "Manage Wallets", category: "wallets" },
  { slug: SYSTEM_PERMISSIONS.SDC_ISSUE, name: "Issue SDC against Cash", category: "wallets" },
  { slug: SYSTEM_PERMISSIONS.SDC_TRANSFER, name: "Transfer SDC", category: "wallets" },

  { slug: SYSTEM_PERMISSIONS.POOLS_CREATE, name: "Create SDC Pools", category: "pools" },
  { slug: SYSTEM_PERMISSIONS.POOLS_SETTLE, name: "Settle SDC Pools", category: "pools" },
  { slug: SYSTEM_PERMISSIONS.RANKS_MANAGE, name: "Manage Rank Definitions", category: "ranks" },

  { slug: SYSTEM_PERMISSIONS.WITHDRAWALS_VIEW, name: "View Withdrawals", category: "withdrawals" },
  { slug: SYSTEM_PERMISSIONS.WITHDRAWALS_PROCESS, name: "Process Cash Withdrawals", category: "withdrawals" },

  { slug: SYSTEM_PERMISSIONS.PARTNERS_APPROVE, name: "Approve Partner Applications", category: "partners" },
  { slug: SYSTEM_PERMISSIONS.PARTNERS_MANAGE_AGREEMENT, name: "Manage Partner Agreements", category: "partners" },

  { slug: SYSTEM_PERMISSIONS.PLATFORM_SETTINGS_MANAGE, name: "Manage Platform Settings", category: "settings" },
  { slug: SYSTEM_PERMISSIONS.AUDIT_VIEW, name: "View System Audit Logs", category: "audit" },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, SystemPermission[]> = {
  [SYSTEM_ROLES.OWNER]: Object.values(SYSTEM_PERMISSIONS), // Owner has ALL permissions
  [SYSTEM_ROLES.PRODUCT_MANAGER]: [
    SYSTEM_PERMISSIONS.PRODUCTS_CREATE,
    SYSTEM_PERMISSIONS.PRODUCTS_APPROVE,
    SYSTEM_PERMISSIONS.PRODUCTS_EDIT,
    SYSTEM_PERMISSIONS.SERVICES_CREATE,
    SYSTEM_PERMISSIONS.SERVICES_APPROVE,
    SYSTEM_PERMISSIONS.SERVICES_EDIT,
    SYSTEM_PERMISSIONS.ORDERS_VIEW,
  ],
  [SYSTEM_ROLES.CASH_MANAGER]: [
    SYSTEM_PERMISSIONS.WITHDRAWALS_VIEW,
    SYSTEM_PERMISSIONS.WITHDRAWALS_PROCESS,
    SYSTEM_PERMISSIONS.WALLETS_VIEW,
    SYSTEM_PERMISSIONS.ORDERS_VIEW,
  ],
  [SYSTEM_ROLES.PARTNER_MANAGER]: [
    SYSTEM_PERMISSIONS.PARTNERS_APPROVE,
    SYSTEM_PERMISSIONS.PARTNERS_MANAGE_AGREEMENT,
    SYSTEM_PERMISSIONS.USERS_VIEW,
  ],
  [SYSTEM_ROLES.SD_PATRON_MANAGER]: [
    SYSTEM_PERMISSIONS.USERS_VIEW,
    SYSTEM_PERMISSIONS.USERS_APPROVE,
  ],
  [SYSTEM_ROLES.PATRON]: [
    // Ordinary member actions are protected at the resource-ownership level
  ],
};
