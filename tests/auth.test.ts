import test from "node:test";
import assert from "node:assert/strict";
import { registerUser, loginUser, applyForPartner, approvePartner } from "../lib/domain/users/service";
import { runSeed } from "../lib/db/seed";
import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";

test("Authentication & Single User Model Tests (PostgreSQL)", async (t) => {
  await t.test("Register creates member as SD Patron with separate zero-balance SDP and SDC wallets in PostgreSQL", async () => {
    const testUsername = `user_${Date.now()}`;
    const result = await registerUser({
      fullName: "Test Member",
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "Password123!",
    });

    assert.equal(result.username, testUsername);
    assert.equal(result.partnerStatus, "NONE"); // All members start as Patron
    assert.ok(result.referralCode);
    assert.ok(result.id);

    // Verify in PostgreSQL database directly
    const [dbUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, result.id))
      .limit(1);

    assert.ok(dbUser);
    assert.equal(dbUser.username, testUsername);
    assert.equal(dbUser.partnerStatus, "NONE");

    // Verify separate SDP and SDC wallets created in PostgreSQL with ZERO balances
    const dbWallets = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, result.id));

    assert.equal(dbWallets.length, 2);
    const sdpWallet = dbWallets.find((w) => w.walletType === "SDP");
    const sdcWallet = dbWallets.find((w) => w.walletType === "SDC");

    assert.ok(sdpWallet, "SDP wallet must exist in PostgreSQL");
    assert.ok(sdcWallet, "SDC wallet must exist in PostgreSQL");
    assert.equal(sdpWallet.balance, "0.0000", "Initial SDP balance must be 0.0000");
    assert.equal(sdcWallet.balance, "0.0000", "Initial SDC balance must be 0.0000");
    assert.equal(sdpWallet.pendingBalance, "0.0000");
    assert.equal(sdcWallet.pendingBalance, "0.0000");
  });

  await t.test("Single User Model: Partner application and approval use the exact SAME user ID in PostgreSQL", async () => {
    const testUsername = `partner_cand_${Date.now()}`;
    const member = await registerUser({
      fullName: "Partner Candidate",
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "Password123!",
    });

    // Apply for partner
    await applyForPartner(member.id, {
      businessName: "Candidate Electronics",
      businessAddress: "Sector G-9, Islamabad",
      businessPhone: "+92 333 1112233",
      taxRegistrationNumber: "NTN-11223344",
    });

    const [appliedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, member.id))
      .limit(1);

    assert.equal(appliedUser.partnerStatus, "PENDING");
    assert.equal(appliedUser.id, member.id, "User ID must not change during application");

    // Approve partner
    await approvePartner(member.id, "usr_owner_01");

    const [approvedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, member.id))
      .limit(1);

    assert.equal(approvedUser.partnerStatus, "APPROVED");
    assert.equal(approvedUser.id, member.id, "Approved partner must use identical user ID");

    // Verify profile updated on the same user
    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, member.id))
      .limit(1);

    assert.equal(profile.businessName, "Candidate Electronics");
    assert.equal(profile.businessPhone, "+92 333 1112233");
  });

  await t.test("Duplicate email registration fails", async () => {
    await assert.rejects(
      async () => {
        await registerUser({
          fullName: "Duplicate User",
          username: `unique_${Date.now()}`,
          email: "owner@stakedeals.com", // existing seed email
          password: "Password123!",
        });
      },
      { message: "An account with this email already exists." }
    );
  });

  await t.test("Login succeeds with valid credentials against PostgreSQL", async () => {
    const user = await loginUser({
      identifier: "owner@stakedeals.com",
      password: "Password123!",
    });

    assert.equal(user.email, "owner@stakedeals.com");
    assert.equal(user.username, "owner");
  });

  await t.test("Login fails with invalid password", async () => {
    await assert.rejects(
      async () => {
        await loginUser({
          identifier: "owner@stakedeals.com",
          password: "WrongPassword999!",
        });
      },
      { message: "Invalid email or password." }
    );
  });
});
