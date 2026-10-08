import { db, schema } from "@/lib/db";
import { eq, or, sql } from "drizzle-orm";
import { getSetting, SETTING_KEYS } from "@/lib/domain/settings/service";

export interface ResolveSponsorResult {
  sponsorId: string | null;
  isDefaultSponsor: boolean;
  sponsorUser: { id: string; username: string; email: string } | null;
}

export async function resolveSponsorForRegistration(
  referralCodeOrUsername?: string | null,
  forUserId?: string
): Promise<ResolveSponsorResult> {
  if (referralCodeOrUsername && referralCodeOrUsername.trim().length > 0) {
    const code = referralCodeOrUsername.trim();

    // Query user by referral code or username in PostgreSQL
    const [found] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        referralCode: schema.users.referralCode,
      })
      .from(schema.users)
      .where(
        or(
          sql`LOWER(${schema.users.referralCode}) = LOWER(${code})`,
          sql`LOWER(${schema.users.username}) = LOWER(${code})`
        )
      )
      .limit(1);

    if (found) {
      // Rule: User cannot sponsor themselves
      if (forUserId && found.id === forUserId) {
        throw new Error("Self-sponsorship is not permitted.");
      }

      // Rule: Cycle prevention if forUserId already exists
      if (forUserId && (await isAncestorOf(forUserId, found.id))) {
        throw new Error("Genealogy cycle detected: sponsor cannot be downline of user.");
      }

      return {
        sponsorId: found.id,
        isDefaultSponsor: false,
        sponsorUser: found,
      };
    }
  }

  // Fallback to Admin-configured default sponsor ONLY
  const defaultSponsorId = await getSetting<string>(
    SETTING_KEYS.DEFAULT_SPONSOR_USER_ID,
    ""
  );

  let defaultSponsor: { id: string; username: string; email: string } | null = null;
  if (defaultSponsorId && defaultSponsorId.trim().length > 0) {
    const [defaultUser] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        referralCode: schema.users.referralCode,
      })
      .from(schema.users)
      .where(eq(schema.users.id, defaultSponsorId.trim()))
      .limit(1);

    if (defaultUser) {
      defaultSponsor = defaultUser;
    }
  }

  // Directive 7: No automatic Owner fallback is invented!
  // If neither code nor configured default sponsor is valid, sponsorId remains null.
  return {
    sponsorId: defaultSponsor?.id || null,
    isDefaultSponsor: defaultSponsor !== null,
    sponsorUser: defaultSponsor,
  };
}

export async function isAncestorOf(potentialAncestorId: string, targetUserId: string): Promise<boolean> {
  let currentId: string | null = targetUserId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    if (currentId === potentialAncestorId) return true;

    const [rel] = await db
      .select({ sponsorId: schema.sponsorRelationships.sponsorId })
      .from(schema.sponsorRelationships)
      .where(eq(schema.sponsorRelationships.userId, currentId))
      .limit(1);

    currentId = rel?.sponsorId || null;
  }

  return false;
}

export async function recordSponsorAndGenealogy(userId: string, sponsorId: string | null): Promise<void> {
  if (!sponsorId) return;

  // 1. Establish sponsor relationship in PostgreSQL
  const relId = `sr_${userId}`;
  await db
    .insert(schema.sponsorRelationships)
    .values({
      id: relId,
      userId,
      sponsorId,
      depth: 1,
      establishedAt: new Date(),
    })
    .onConflictDoNothing();

  // 2. Resolve exactly 10-level upline hierarchy in PostgreSQL
  const uplines: (string | null)[] = [];
  let currSponsorId: string | null = sponsorId;

  for (let level = 1; level <= 10; level++) {
    if (currSponsorId) {
      uplines.push(currSponsorId);
      const [nextRel] = await db
        .select({ sponsorId: schema.sponsorRelationships.sponsorId })
        .from(schema.sponsorRelationships)
        .where(eq(schema.sponsorRelationships.userId, currSponsorId))
        .limit(1);

      currSponsorId = nextRel?.sponsorId || null;
    } else {
      uplines.push(null);
    }
  }

  const genealogyRecord = {
    id: `gen_${userId}`,
    userId,
    sponsorId,
    level1Id: uplines[0],
    level2Id: uplines[1],
    level3Id: uplines[2],
    level4Id: uplines[3],
    level5Id: uplines[4],
    level6Id: uplines[5],
    level7Id: uplines[6],
    level8Id: uplines[7],
    level9Id: uplines[8],
    level10Id: uplines[9],
    path: `/${uplines.filter(Boolean).reverse().join("/")}/${userId}/`,
    updatedAt: new Date(),
  };

  await db
    .insert(schema.genealogy)
    .values(genealogyRecord)
    .onConflictDoUpdate({
      target: schema.genealogy.userId,
      set: genealogyRecord,
    });
}

export async function getGenealogyForUser(userId: string) {
  const [directSponsorRel] = await db
    .select()
    .from(schema.sponsorRelationships)
    .where(eq(schema.sponsorRelationships.userId, userId))
    .limit(1);

  const directReferralRows = await db
    .select({
      userId: schema.sponsorRelationships.userId,
      establishedAt: schema.sponsorRelationships.establishedAt,
      username: schema.users.username,
      fullName: schema.userProfiles.fullName,
    })
    .from(schema.sponsorRelationships)
    .innerJoin(schema.users, eq(schema.sponsorRelationships.userId, schema.users.id))
    .leftJoin(schema.userProfiles, eq(schema.sponsorRelationships.userId, schema.userProfiles.userId))
    .where(eq(schema.sponsorRelationships.sponsorId, userId));

  const [gen] = await db
    .select()
    .from(schema.genealogy)
    .where(eq(schema.genealogy.userId, userId))
    .limit(1);

  return {
    sponsorId: directSponsorRel?.sponsorId || null,
    directReferrals: directReferralRows,
    uplines: gen || null,
  };
}
