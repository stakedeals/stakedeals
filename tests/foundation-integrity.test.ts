import test from "node:test";
import assert from "node:assert/strict";
import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";
import { registerUser, applyForPartner, approvePartner } from "../lib/domain/users/service";
import { hasRole, hasPermission, assignRole } from "../lib/domain/permissions/service";
import { SYSTEM_ROLES, SYSTEM_PERMISSIONS } from "../lib/domain/permissions/constants";
import { createPartnerAgreement, getActivePartnerAgreement } from "../lib/domain/partners/service";
import { getSetting, updateSetting, SETTING_KEYS } from "../lib/domain/settings/service";
import { recordAuditEvent, getAuditLogs } from "../lib/domain/audit/service";

test("Foundation Schema & Integrity Verification Tests (PostgreSQL)", async (t) => {
  await t.test("Checkpoint D & E: Single User Model, Patron default, profile, zero balances", async () => {
    const timestamp = Date.now();
    const username = `found_usr_${timestamp}`;
    const user = await registerUser({
      fullName: "Foundation Patron",
      username,
      email: `${username}@example.com`,
      password: "StrongPassword123!",
    });

    // 1. Verify user created as SD Patron
    assert.equal(user.partnerStatus, "NONE", "Default status must be NONE (SD Patron)");
    assert.ok(user.referralCode, "Referral code generated safely");

    // 2. Verify Patron cannot self-assign Admin roles
    const isOwner = await hasRole(user.id, SYSTEM_ROLES.OWNER);
    const isCashMgr = await hasRole(user.id, SYSTEM_ROLES.CASH_MANAGER);
    assert.equal(isOwner, false, "Registered member must not have Owner role");
    assert.equal(isCashMgr, false, "Registered member must not have Cash Manager role");

    // 3. Verify wallets created in PostgreSQL with ZERO balances
    const wallets = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, user.id));

    assert.equal(wallets.length, 2, "Separate SDP and SDC wallets");
    for (const w of wallets) {
      assert.equal(w.balance, "0.0000", `${w.walletType} balance must be 0.0000`);
      assert.equal(w.pendingBalance, "0.0000", `${w.walletType} pending balance must be 0.0000`);
    }

    // 4. Verify user_profiles record in PostgreSQL
    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, user.id))
      .limit(1);

    assert.ok(profile, "Profile record exists");
    assert.equal(profile.fullName, "Foundation Patron");
    assert.equal(profile.country, "Pakistan");
  });

  await t.test("Checkpoint F: Relational RBAC enforcement on PostgreSQL", async () => {
    const ownerId = "usr_owner_01";
    const partnerMgrId = "usr_partner_mgr_01";

    // Owner has partner approval permission
    const ownerCanApprove = await hasPermission(ownerId, SYSTEM_PERMISSIONS.PARTNERS_APPROVE);
    assert.equal(ownerCanApprove, true, "Owner has PARTNERS_APPROVE");

    // Partner Manager has partner approval permission
    const partnerMgrCanApprove = await hasPermission(partnerMgrId, SYSTEM_PERMISSIONS.PARTNERS_APPROVE);
    assert.equal(partnerMgrCanApprove, true, "Partner Manager has PARTNERS_APPROVE");

    // Cash Manager does NOT have partner approval permission
    const cashMgrId = "usr_cash_mgr_01";
    const cashMgrCanApprove = await hasPermission(cashMgrId, SYSTEM_PERMISSIONS.PARTNERS_APPROVE);
    assert.equal(cashMgrCanApprove, false, "Cash Manager cannot approve partners");

    // Patron does NOT have any admin permission
    const patronId = "usr_patron_01";
    const patronCanManageSettings = await hasPermission(patronId, SYSTEM_PERMISSIONS.PLATFORM_SETTINGS_MANAGE);
    assert.equal(patronCanManageSettings, false, "Patron cannot manage platform settings");
  });

  await t.test("Checkpoint I, J & K: Partner application, approval & agreement foundation on SAME user", async () => {
    const timestamp = Date.now();
    const candidateUsername = `partner_test_${timestamp}`;
    const candidate = await registerUser({
      fullName: "Partner Candidate",
      username: candidateUsername,
      email: `${candidateUsername}@example.com`,
      password: "StrongPassword123!",
    });

    // 1. Submit partner application
    const app = await applyForPartner(candidate.id, {
      businessName: "Elite Supplies Ltd",
      businessAddress: "Suite 4, Commercial Market, Rawalpindi",
      businessPhone: "+92 300 9876543",
      taxRegistrationNumber: "NTN-99887766",
    });

    assert.equal(app.status, "PENDING");
    assert.equal(app.userId, candidate.id);

    // 2. Approve partner by authorized admin
    await approvePartner(candidate.id, "usr_partner_mgr_01");

    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, candidate.id))
      .limit(1);

    assert.equal(updatedUser.partnerStatus, "APPROVED", "Partner status updated on the SAME user ID");
    assert.equal(updatedUser.id, candidate.id, "Never creates a second user account");

    // 3. Partner Agreement foundation
    const agreement = await createPartnerAgreement("usr_owner_01", {
      partnerId: candidate.id,
      platformFeeSdc: "2.5000",
      feeRecipientUserId: "usr_owner_01",
      notes: "Standard individual merchant agreement",
    });

    assert.ok(agreement.id);
    assert.equal(agreement.partnerId, candidate.id);
    assert.equal(agreement.platformFeeSdc, "2.5000");

    const retrievedAgreement = await getActivePartnerAgreement(candidate.id);
    assert.ok(retrievedAgreement);
    assert.equal(retrievedAgreement.platformFeeSdc, "2.5000");
  });

  await t.test("Checkpoint L: Platform settings persistence & unconfigured rate integrity", async () => {
    const sdpRate = await getSetting(SETTING_KEYS.SDP_PKR_RATE);
    const sdcRate = await getSetting(SETTING_KEYS.SDC_PKR_RATE);

    assert.equal(sdpRate, "[UNCONFIGURED]", "SDP PKR rate must NOT be invented as 1.0");
    assert.equal(sdcRate, "[UNCONFIGURED]", "SDC PKR rate must NOT be invented as 1.0");

    // Update a setting via authorized action
    await updateSetting("TEST_SETTING_KEY", "VERIFIED_VALUE", "usr_owner_01", "Audit check setting");
    const testVal = await getSetting("TEST_SETTING_KEY");
    assert.equal(testVal, "VERIFIED_VALUE");
  });

  await t.test("Checkpoint M: Audit Log persistence in PostgreSQL", async () => {
    await recordAuditEvent({
      actorId: "usr_owner_01",
      action: "security.audit_checkpoint_verification",
      entityType: "system",
      entityId: "checkpoint_verification",
      metadata: { status: "VERIFIED" },
    });

    const logs = await getAuditLogs({ entityType: "system", limit: 5 });
    assert.ok(logs.items.length > 0, "Audit logs recorded in PostgreSQL");
    const matching = logs.items.find((l) => l.action === "security.audit_checkpoint_verification");
    assert.ok(matching, "Matching audit event retrieved from PostgreSQL");
    assert.equal(matching.actorId, "usr_owner_01");
  });
});
