import test from "node:test";
import assert from "node:assert/strict";
import { runSeed } from "../lib/db/seed";
import {
  resolveSponsorForRegistration,
  recordSponsorAndGenealogy,
  getGenealogyForUser,
  isAncestorOf,
} from "../lib/domain/genealogy/service";
import { registerUser } from "../lib/domain/users/service";
import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";
import { updateSetting, SETTING_KEYS } from "../lib/domain/settings/service";

test("Sponsor & Genealogy Hierarchy Tests (PostgreSQL)", async (t) => {
  await t.test("Valid sponsor referral code resolves sponsor from PostgreSQL", async () => {
    const result = await resolveSponsorForRegistration("SDPATRON1");
    assert.equal(result.isDefaultSponsor, false);
    assert.equal(result.sponsorUser?.username, "patron1");
  });

  await t.test("Empty referral code resolves to Admin-configured default sponsor from PostgreSQL settings", async () => {
    const result = await resolveSponsorForRegistration("");
    assert.equal(result.isDefaultSponsor, true);
    assert.equal(result.sponsorId, "usr_owner_01");
  });

  await t.test("Directive 7: No automatic Owner fallback when no code and no default sponsor configured", async () => {
    // Temporarily clear the default sponsor setting
    await updateSetting(SETTING_KEYS.DEFAULT_SPONSOR_USER_ID, "", "usr_owner_01");

    const result = await resolveSponsorForRegistration("");
    assert.equal(result.sponsorId, null, "Must NOT automatically fallback to Owner");
    assert.equal(result.sponsorUser, null);

    // Restore default sponsor
    await updateSetting(SETTING_KEYS.DEFAULT_SPONSOR_USER_ID, "usr_owner_01", "usr_owner_01");
  });

  await t.test("Self-sponsorship is strictly rejected", async () => {
    await assert.rejects(
      async () => {
        await resolveSponsorForRegistration("SDPATRON1", "usr_patron_01");
      },
      { message: "Self-sponsorship is not permitted." }
    );
  });

  await t.test("Cycle prevention: downline cannot sponsor an upline ancestor", async () => {
    // usr_patron_01 -> usr_patron_02. So usr_patron_01 is ancestor of usr_patron_02
    const isAncestor = await isAncestorOf("usr_owner_01", "usr_patron_01");
    assert.equal(isAncestor, true);

    const isAncestor2 = await isAncestorOf("usr_patron_01", "usr_patron_02");
    assert.equal(isAncestor2, true);

    // Attempt to register with sponsor that creates a cycle
    await assert.rejects(
      async () => {
        await resolveSponsorForRegistration("SDPATRON2", "usr_patron_01");
      },
      { message: "Genealogy cycle detected: sponsor cannot be downline of user." }
    );
  });

  await t.test("Genealogy upline resolution computes exactly 10 levels in PostgreSQL", async () => {
    // Register member 3 sponsored by patron2 (who is sponsored by patron1, who is sponsored by owner)
    const testUsername = `lineage_member_${Date.now()}`;
    const memberC = await registerUser({
      fullName: "Lineage Level 3 Member",
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "Password123!",
      referralCode: "SDPATRON2", // patron 2
    });

    const genC = await getGenealogyForUser(memberC.id);
    assert.ok(genC.uplines);
    assert.equal(genC.sponsorId, "usr_patron_02", "Level 1 direct sponsor");
    assert.equal(genC.uplines.level1Id, "usr_patron_02", "L1 must be direct sponsor");
    assert.equal(genC.uplines.level2Id, "usr_patron_01", "L2 must be second upline");
    assert.equal(genC.uplines.level3Id, "usr_owner_01", "L3 must be third upline");
    assert.equal(genC.uplines.level4Id, null, "L4 is null when tree terminates");
    assert.equal(genC.uplines.level10Id, null, "L10 is null when tree terminates");

    // Verify in PostgreSQL table directly
    const [dbGen] = await db
      .select()
      .from(schema.genealogy)
      .where(eq(schema.genealogy.userId, memberC.id))
      .limit(1);

    assert.ok(dbGen);
    assert.equal(dbGen.level1Id, "usr_patron_02");
    assert.equal(dbGen.level2Id, "usr_patron_01");
    assert.equal(dbGen.level3Id, "usr_owner_01");
  });
});
