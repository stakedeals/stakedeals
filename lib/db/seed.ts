import { db, schema } from "@/lib/db";
import {
  ROLE_DEFINITIONS,
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_ROLES,
} from "@/lib/domain/permissions/constants";
import { SETTING_KEYS } from "@/lib/domain/settings/service";
import { hashPassword } from "@/lib/auth/session";

export const DEV_DEFAULT_PASSWORD = "Password123!";

export async function runSeed() {
  console.log("🌱 [StakeDeals] Initializing database seed with structural production data...");

  // 1. Seed Roles
  for (const roleDef of ROLE_DEFINITIONS) {
    const roleId = `role_${roleDef.slug}`;
    await db
      .insert(schema.roles)
      .values({
        id: roleId,
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        isSystemRole: roleDef.isSystemRole,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // 2. Seed Permissions
  for (const permDef of PERMISSION_DEFINITIONS) {
    const permId = `perm_${permDef.slug}`;
    await db
      .insert(schema.permissions)
      .values({
        id: permId,
        name: permDef.name,
        slug: permDef.slug,
        category: permDef.category,
        description: permDef.name,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // 3. Seed Role-Permissions
  for (const [roleSlug, permSlugs] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const roleId = `role_${roleSlug}`;

    for (const permSlug of permSlugs) {
      const permId = `perm_${permSlug}`;
      const rpId = `rp_${roleId}_${permId}`.slice(0, 64);

      await db
        .insert(schema.rolePermissions)
        .values({
          id: rpId,
          roleId,
          permissionId: permId,
        })
        .onConflictDoNothing();
    }
  }

  const hashedPassword = await hashPassword(DEV_DEFAULT_PASSWORD);

  // 4. Seed Development Users (Single User Model)
  const seedUsers = [
    {
      id: "usr_owner_01",
      email: "owner@stakedeals.com",
      username: "owner",
      fullName: "StakeDeals Super Admin",
      role: SYSTEM_ROLES.OWNER,
      referralCode: "OWNER001",
      partnerStatus: "NONE",
      sponsorId: null,
    },
    {
      id: "usr_prod_mgr_01",
      email: "productmgr@stakedeals.com",
      username: "productmgr",
      fullName: "Alex Product Manager",
      role: SYSTEM_ROLES.PRODUCT_MANAGER,
      referralCode: "PROD001",
      partnerStatus: "NONE",
      sponsorId: "usr_owner_01",
    },
    {
      id: "usr_cash_mgr_01",
      email: "cashmgr@stakedeals.com",
      username: "cashmgr",
      fullName: "Catherine Cash Manager",
      role: SYSTEM_ROLES.CASH_MANAGER,
      referralCode: "CASH001",
      partnerStatus: "NONE",
      sponsorId: "usr_owner_01",
    },
    {
      id: "usr_partner_mgr_01",
      email: "partnermgr@stakedeals.com",
      username: "partnermgr",
      fullName: "Peter Partner Manager",
      role: SYSTEM_ROLES.PARTNER_MANAGER,
      referralCode: "PRTM001",
      partnerStatus: "NONE",
      sponsorId: "usr_owner_01",
    },
    {
      id: "usr_patron_mgr_01",
      email: "patronmgr@stakedeals.com",
      username: "patronmgr",
      fullName: "Sarah Patron Manager",
      role: SYSTEM_ROLES.SD_PATRON_MANAGER,
      referralCode: "PTNM001",
      partnerStatus: "NONE",
      sponsorId: "usr_owner_01",
    },
    {
      id: "usr_patron_01",
      email: "patron1@stakedeals.com",
      username: "patron1",
      fullName: "Tariq SD Patron",
      role: SYSTEM_ROLES.PATRON,
      referralCode: "SDPATRON1",
      partnerStatus: "NONE",
      sponsorId: "usr_owner_01",
    },
    {
      id: "usr_patron_02",
      email: "patron2@stakedeals.com",
      username: "patron2",
      fullName: "Bilal SD Patron Downline",
      role: SYSTEM_ROLES.PATRON,
      referralCode: "SDPATRON2",
      partnerStatus: "NONE",
      sponsorId: "usr_patron_01",
    },
    {
      // Single User Model: SD Partner uses the exact SAME user ID
      id: "usr_partner_01",
      email: "partner@stakedeals.com",
      username: "partner1",
      fullName: "Zain Approved Partner",
      role: SYSTEM_ROLES.PATRON,
      referralCode: "SDPARTNER1",
      partnerStatus: "APPROVED",
      sponsorId: "usr_owner_01",
      businessName: "Zain Electronics & Mobile Hub",
      businessAddress: "Shop 12, Gulberg III, Lahore",
      businessPhone: "+92 300 1234567",
      taxNumber: "TRN-987654321",
    },
  ];

  for (const u of seedUsers) {
    const userRecord = {
      id: u.id,
      email: u.email,
      username: u.username,
      passwordHash: hashedPassword,
      status: "ACTIVE",
      isEmailVerified: true,
      partnerStatus: u.partnerStatus,
      referralCode: u.referralCode,
      sponsorId: u.sponsorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const profileRecord = {
      id: `prof_${u.id}`,
      userId: u.id,
      fullName: u.fullName,
      phoneNumber: "+92 300 0000000",
      addressLine: "Main Boulevard",
      city: "Lahore",
      country: "Pakistan",
      avatarUrl: null,
      businessName: (u as Record<string, unknown>).businessName ? String((u as Record<string, unknown>).businessName) : null,
      businessAddress: (u as Record<string, unknown>).businessAddress ? String((u as Record<string, unknown>).businessAddress) : null,
      businessPhone: (u as Record<string, unknown>).businessPhone ? String((u as Record<string, unknown>).businessPhone) : null,
      taxNumber: (u as Record<string, unknown>).taxNumber ? String((u as Record<string, unknown>).taxNumber) : null,
      updatedAt: new Date(),
    };

    const roleId = `role_${u.role}`;
    const urId = `ur_${u.id}_${u.role}`.slice(0, 64);
    const userRoleRecord = {
      id: urId,
      userId: u.id,
      roleId,
      assignedAt: new Date(),
      assignedBy: "seed",
    };

    // Directive 4: Default balances must be ZERO (0.0000). All changes originate from immutable ledger.
    const sdpWalletId = `w_sdp_${u.id}`;
    const sdpWalletRecord = {
      id: sdpWalletId,
      userId: u.id,
      walletType: "SDP",
      balance: "0.0000",
      pendingBalance: "0.0000",
      maturedBalance: "0.0000",
      withdrawnTotal: "0.0000",
      spentTotal: "0.0000",
      updatedAt: new Date(),
    };

    const sdcWalletId = `w_sdc_${u.id}`;
    const sdcWalletRecord = {
      id: sdcWalletId,
      userId: u.id,
      walletType: "SDC",
      balance: "0.0000",
      pendingBalance: "0.0000",
      maturedBalance: "0.0000",
      withdrawnTotal: "0.0000",
      spentTotal: "0.0000",
      updatedAt: new Date(),
    };

    await db.insert(schema.users).values(userRecord).onConflictDoNothing();
    await db.insert(schema.userProfiles).values(profileRecord).onConflictDoNothing();
    await db.insert(schema.userRoles).values(userRoleRecord).onConflictDoNothing();

    // Ensure wallet balances are strictly zero in the database
    await db
      .insert(schema.wallets)
      .values(sdpWalletRecord)
      .onConflictDoUpdate({
        target: schema.wallets.id,
        set: { balance: "0.0000", pendingBalance: "0.0000", maturedBalance: "0.0000" },
      });

    await db
      .insert(schema.wallets)
      .values(sdcWalletRecord)
      .onConflictDoUpdate({
        target: schema.wallets.id,
        set: { balance: "0.0000", pendingBalance: "0.0000", maturedBalance: "0.0000" },
      });

    if (u.sponsorId) {
      await db
        .insert(schema.sponsorRelationships)
        .values({
          id: `sr_${u.id}`,
          userId: u.id,
          sponsorId: u.sponsorId,
          depth: 1,
          establishedAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }

  // 5. Seed Platform Settings without invented conversion rates
  const settingsEntries = [
    {
      key: SETTING_KEYS.DEFAULT_SPONSOR_USER_ID,
      value: "usr_owner_01",
      description: "Admin-configured default sponsor user ID for members registering without a referral code",
    },
    {
      key: SETTING_KEYS.SDC_FALLBACK_RECIPIENT_USER_ID,
      value: "usr_owner_01",
      description: "Admin-configured recipient user ID for missing upline levels and undistributed pool shares",
    },
    {
      key: SETTING_KEYS.SDP_PKR_RATE,
      value: "[UNCONFIGURED]",
      description: "Admin-configurable PKR conversion rate for 1 SDP (must be configured by Admin prior to use)",
    },
    {
      key: SETTING_KEYS.SDC_PKR_RATE,
      value: "[UNCONFIGURED]",
      description: "Admin-configurable PKR conversion rate for 1 SDC (must be configured by Admin prior to use)",
    },
    {
      key: SETTING_KEYS.ALLOW_MEMBER_SDC_TRANSFER,
      value: "false",
      description: "Admin feature toggle permitting member-to-member SDC transfers",
    },
  ];

  for (const s of settingsEntries) {
    await db
      .insert(schema.platformSettings)
      .values({
        key: s.key,
        value: s.value,
        description: s.description,
        updatedBy: "usr_owner_01",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.platformSettings.key,
        set: {
          value: s.value,
          description: s.description,
          updatedBy: "usr_owner_01",
          updatedAt: new Date(),
        },
      });
  }

  console.log("✅ [StakeDeals] Seed completed successfully with zero balances and strict PostgreSQL persistence!");
}

// Execute seed if run directly
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Seed Error]", err);
      process.exit(1);
    });
}
