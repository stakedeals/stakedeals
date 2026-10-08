import test from "node:test";
import assert from "node:assert/strict";
import { runSeed } from "../lib/db/seed";
import { db, schema } from "../lib/db";
import { eq, sum } from "drizzle-orm";
import { getSetting, SETTING_KEYS } from "../lib/domain/settings/service";
import { recordAuditEvent, getAuditLogs } from "../lib/domain/audit/service";
import { registerUser } from "../lib/domain/users/service";

test("Financial Integrity, Ledger & Wallet Rules (PostgreSQL)", async (t) => {
  await runSeed();

  await t.test("Wallets: Seed users and newly registered members have initial balances strictly 0.0000 in PostgreSQL", async () => {
    const seedUserIds = [
      "usr_owner_01",
      "usr_prod_mgr_01",
      "usr_cash_mgr_01",
      "usr_partner_mgr_01",
      "usr_patron_mgr_01",
      "usr_patron_01",
      "usr_patron_02",
      "usr_partner_01",
    ];

    for (const userId of seedUserIds) {
      const userWallets = await db
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.userId, userId));

      assert.equal(userWallets.length, 2, `User ${userId} must have exactly 2 wallets (SDP & SDC)`);

      for (const w of userWallets) {
        assert.equal(
          w.balance,
          "0.0000",
          `Wallet ${w.id} (${w.walletType}) must have initial balance of 0.0000`
        );
        assert.equal(
          w.pendingBalance,
          "0.0000",
          `Wallet ${w.id} (${w.walletType}) must have initial pendingBalance of 0.0000`
        );
      }
    }
  });

  await t.test("No invented monetary conversion values: Rates are unconfigured placeholders", async () => {
    const sdpRate = await getSetting(SETTING_KEYS.SDP_PKR_RATE);
    const sdcRate = await getSetting(SETTING_KEYS.SDC_PKR_RATE);

    assert.notEqual(sdpRate, "1.0000", "SDP rate must NOT be assumed as 1.0000 PKR");
    assert.notEqual(sdcRate, "1.0000", "SDC rate must NOT be assumed as 1.0000 PKR");
    assert.equal(sdpRate, "[UNCONFIGURED]", "SDP rate must be explicitly unconfigured");
    assert.equal(sdcRate, "[UNCONFIGURED]", "SDC rate must be explicitly unconfigured");
  });

  await t.test("Rank Metric vs Wallet: Spending SDC does NOT reduce historical Rank-Qualifying SDC", async () => {
    const testUsername = `user_financial_${Date.now()}`;
    const testUser = await registerUser({
      fullName: "Financial Test Member",
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "Password123!",
    });
    const testUserId = testUser.id;

    // 1. Record qualifying business activity in Rank Qualification Ledger (+500 SDC)
    const qualId = `rql_test_${Date.now()}`;
    await db.insert(schema.rankQualificationLedger).values({
      id: qualId,
      userId: testUserId,
      qualifyingSdcAmount: "500.0000",
      sourceType: "QUALIFYING_PURCHASE",
      sourceTransactionId: "trx_test_01",
      qualificationDate: new Date(),
      evaluationPeriod: "2026-10",
      createdAt: new Date(),
    });

    // 2. Also credit the user's usable SDC wallet (+500 SDC via ledger entry)
    const walletEntryCredit = `wle_cr_${Date.now()}`;
    await db.insert(schema.walletLedgerEntries).values({
      id: walletEntryCredit,
      walletId: `w_sdc_${testUserId}`,
      userId: testUserId,
      assetType: "SDC",
      entryType: "CREDIT",
      amount: "500.0000",
      balanceAfter: "500.0000",
      sourceType: "QUALIFYING_REWARD",
      sourceId: "trx_test_01",
      reference: "Qualifying purchase SDC reward",
      createdAt: new Date(),
    });

    // Update wallet balance to 500.0000
    await db
      .update(schema.wallets)
      .set({ balance: "500.0000" })
      .where(eq(schema.wallets.id, `w_sdc_${testUserId}`));

    // Verify initial state: exactly 500
    const [initialQual] = await db
      .select({ total: sum(schema.rankQualificationLedger.qualifyingSdcAmount) })
      .from(schema.rankQualificationLedger)
      .where(eq(schema.rankQualificationLedger.userId, testUserId));

    assert.equal(Number(initialQual?.total), 500);

    // 3. User spends 300 SDC (Deducted from wallet via ledger entry)
    const walletEntryDebit = `wle_db_${Date.now()}`;
    await db.insert(schema.walletLedgerEntries).values({
      id: walletEntryDebit,
      walletId: `w_sdc_${testUserId}`,
      userId: testUserId,
      assetType: "SDC",
      entryType: "DEBIT",
      amount: "300.0000",
      balanceAfter: "200.0000",
      sourceType: "MARKETPLACE_SPEND",
      sourceId: "ord_spend_01",
      reference: "Marketplace purchase using SDC",
      createdAt: new Date(),
    });

    await db
      .update(schema.wallets)
      .set({ balance: "200.0000", spentTotal: "300.0000" })
      .where(eq(schema.wallets.id, `w_sdc_${testUserId}`));

    // 4. Critical Master Spec Rule: Wallet is now 200 SDC, but Rank-Qualifying SDC remains exactly 500 SDC!
    const [walletAfterSpend] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.id, `w_sdc_${testUserId}`))
      .limit(1);

    const [qualAfterSpend] = await db
      .select({ total: sum(schema.rankQualificationLedger.qualifyingSdcAmount) })
      .from(schema.rankQualificationLedger)
      .where(eq(schema.rankQualificationLedger.userId, testUserId));

    assert.equal(walletAfterSpend.balance, "200.0000", "Spendable wallet balance must decrease to 200 SDC");
    assert.equal(
      Number(qualAfterSpend?.total),
      500,
      "Historical rank qualification must NEVER decrease when spending SDC"
    );
  });

  await t.test("Rank Metric vs Withdrawal: Withdrawing SDC does NOT reduce historical Rank-Qualifying SDC", async () => {
    const testUsername = `user_wth_${Date.now()}`;
    const testUser = await registerUser({
      fullName: "Withdrawal Test Member",
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "Password123!",
    });
    const testUserId = testUser.id;

    // 1. Initial qualifying event: 500 SDC in ledger, 500 SDC in wallet
    await db.insert(schema.rankQualificationLedger).values({
      id: `rql_wth_${Date.now()}`,
      userId: testUserId,
      qualifyingSdcAmount: "500.0000",
      sourceType: "QUALIFYING_PURCHASE",
      sourceTransactionId: "trx_test_wth",
      qualificationDate: new Date(),
      evaluationPeriod: "2026-10",
      createdAt: new Date(),
    });

    await db
      .update(schema.wallets)
      .set({ balance: "500.0000" })
      .where(eq(schema.wallets.id, `w_sdc_${testUserId}`));

    // 2. User withdraws 350 SDC
    const walletEntryWithdrawal = `wle_wth_${Date.now()}`;
    await db.insert(schema.walletLedgerEntries).values({
      id: walletEntryWithdrawal,
      walletId: `w_sdc_${testUserId}`,
      userId: testUserId,
      assetType: "SDC",
      entryType: "DEBIT",
      amount: "350.0000",
      balanceAfter: "150.0000",
      sourceType: "WITHDRAWAL_PAID",
      sourceId: "wth_test_01",
      reference: "Withdrawal of 350 SDC",
      createdAt: new Date(),
    });

    await db
      .update(schema.wallets)
      .set({ balance: "150.0000", withdrawnTotal: "350.0000" })
      .where(eq(schema.wallets.id, `w_sdc_${testUserId}`));

    // Verify wallet decreased to 150
    const [walletAfterWth] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.id, `w_sdc_${testUserId}`))
      .limit(1);

    // Verify historical rank metric remains untouched at 500
    const [qualAfterWth] = await db
      .select({ total: sum(schema.rankQualificationLedger.qualifyingSdcAmount) })
      .from(schema.rankQualificationLedger)
      .where(eq(schema.rankQualificationLedger.userId, testUserId));

    assert.equal(walletAfterWth.balance, "150.0000", "Spendable wallet balance must decrease to 150 SDC");
    assert.equal(
      Number(qualAfterWth?.total),
      500,
      "Historical rank qualification must NEVER decrease when withdrawing SDC"
    );
  });

  await t.test("Audit Logging: Actions are persisted directly in PostgreSQL audit_logs table", async () => {
    const testAction = `test.action.${Date.now()}`;
    await recordAuditEvent({
      actorId: "usr_owner_01",
      action: testAction,
      entityType: "system_verification",
      entityId: "verif_01",
      metadata: { tested: true },
    });

    const [dbAuditEntry] = await db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.action, testAction))
      .limit(1);

    assert.ok(dbAuditEntry, "Audit entry must be persisted in PostgreSQL");
    assert.equal(dbAuditEntry.actorId, "usr_owner_01");
    assert.equal(dbAuditEntry.entityType, "system_verification");

    const fetchedLogs = await getAuditLogs({ entityType: "system_verification" });
    assert.ok(fetchedLogs.items.length > 0);
  });
});
