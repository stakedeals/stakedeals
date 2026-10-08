import { db, schema } from "@/lib/db";
import { eq, or, sql } from "drizzle-orm";
import { RegisterInput, registerSchema, LoginInput, loginSchema, PartnerApplicationInput } from "@/lib/validations/auth";
import { hashPassword, verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { resolveSponsorForRegistration, recordSponsorAndGenealogy } from "@/lib/domain/genealogy/service";
import { assignRole } from "@/lib/domain/permissions/service";
import { SYSTEM_ROLES } from "@/lib/domain/permissions/constants";
import { recordAuditEvent } from "@/lib/domain/audit/service";
import crypto from "crypto";

function generateReferralCode(username: string): string {
  const prefix = username.substring(0, 4).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomSuffix}`;
}

export async function registerUser(input: RegisterInput) {
  const validated = registerSchema.parse(input);

  // 1. Check email uniqueness in PostgreSQL
  const [existingEmail] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(sql`LOWER(${schema.users.email}) = LOWER(${validated.email})`)
    .limit(1);

  if (existingEmail) {
    throw new Error("An account with this email already exists.");
  }

  // 2. Check username uniqueness in PostgreSQL
  const [existingUsername] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(sql`LOWER(${schema.users.username}) = LOWER(${validated.username})`)
    .limit(1);

  if (existingUsername) {
    throw new Error("This username is already taken. Please choose another.");
  }

  // 3. Resolve Sponsor (user provided referral code or Admin-configured default)
  const sponsorResolution = await resolveSponsorForRegistration(validated.referralCode);

  // 4. Hash password securely
  const passwordHash = await hashPassword(validated.password);

  const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const referralCode = generateReferralCode(validated.username);

  // 5. Create User entity (Single User Model: starts as SD Patron)
  const newUser = {
    id: userId,
    email: validated.email,
    username: validated.username,
    passwordHash,
    status: "ACTIVE",
    isEmailVerified: false,
    partnerStatus: "NONE", // NONE, PENDING, APPROVED, REJECTED, SUSPENDED
    referralCode,
    sponsorId: sponsorResolution.sponsorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(schema.users).values(newUser);

  // 6. Create User Profile in PostgreSQL
  const profileId = `prof_${userId}`;
  const newProfile = {
    id: profileId,
    userId,
    fullName: validated.fullName,
    phoneNumber: null,
    addressLine: null,
    city: null,
    country: "Pakistan",
    avatarUrl: null,
    businessName: null,
    businessAddress: null,
    businessPhone: null,
    taxNumber: null,
    updatedAt: new Date(),
  };

  await db.insert(schema.userProfiles).values(newProfile);

  // 7. Assign default Patron role (Public registration CANNOT assign admin roles!)
  await assignRole(userId, SYSTEM_ROLES.PATRON, "system");

  // 8. Establish sponsor genealogy in PostgreSQL
  await recordSponsorAndGenealogy(userId, sponsorResolution.sponsorId);

  // 9. Directive 4 & 6: Initialize separate SDP and SDC Wallets with strictly 0.0000 balance in PostgreSQL
  const sdpWalletId = `w_sdp_${userId}`;
  await db.insert(schema.wallets).values({
    id: sdpWalletId,
    userId,
    walletType: "SDP",
    balance: "0.0000",
    pendingBalance: "0.0000",
    maturedBalance: "0.0000",
    withdrawnTotal: "0.0000",
    spentTotal: "0.0000",
    updatedAt: new Date(),
  });

  const sdcWalletId = `w_sdc_${userId}`;
  await db.insert(schema.wallets).values({
    id: sdcWalletId,
    userId,
    walletType: "SDC",
    balance: "0.0000",
    pendingBalance: "0.0000",
    maturedBalance: "0.0000",
    withdrawnTotal: "0.0000",
    spentTotal: "0.0000",
    updatedAt: new Date(),
  });

  // 10. Audit log registration in PostgreSQL
  await recordAuditEvent({
    actorId: userId,
    action: "auth.register",
    entityType: "user",
    entityId: userId,
    metadata: {
      username: newUser.username,
      sponsorId: sponsorResolution.sponsorId,
      isDefaultSponsor: sponsorResolution.isDefaultSponsor,
    },
  });

  const { passwordHash: _, ...safeUser } = newUser;
  return {
    ...safeUser,
    fullName: validated.fullName,
  };
}

export async function loginUser(input: LoginInput) {
  const validated = loginSchema.parse(input);
  const identifier = validated.identifier.toLowerCase();

  const [user] = await db
    .select()
    .from(schema.users)
    .where(
      or(
        sql`LOWER(${schema.users.email}) = ${identifier}`,
        sql`LOWER(${schema.users.username}) = ${identifier}`
      )
    )
    .limit(1);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Your account has been suspended or is pending verification.");
  }

  const isValidPassword = await verifyPassword(validated.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password.");
  }

  // Create JWT session
  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    partnerStatus: user.partnerStatus,
  });

  await setSessionCookie(token);

  await recordAuditEvent({
    actorId: user.id,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    metadata: { username: user.username },
  });

  const [profile] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, user.id))
    .limit(1);

  const { passwordHash: _, ...safeUser } = user;
  return {
    ...safeUser,
    profile: profile || null,
  };
}

export async function applyForPartner(userId: string, input: PartnerApplicationInput) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  if (user.partnerStatus === "APPROVED") {
    throw new Error("You are already an approved SD Partner.");
  }

  const appId = `papp_${userId}`;
  const appRecord = {
    id: appId,
    userId,
    businessName: input.businessName,
    businessAddress: input.businessAddress,
    businessPhone: input.businessPhone,
    taxRegistrationNumber: input.taxRegistrationNumber || null,
    status: "PENDING",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: new Date(),
  };

  await db.insert(schema.partnerApplications).values(appRecord).onConflictDoUpdate({
    target: schema.partnerApplications.id,
    set: appRecord,
  });

  // Single User Model: Update user partnerStatus on the SAME user!
  await db
    .update(schema.users)
    .set({
      partnerStatus: "PENDING",
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));

  await recordAuditEvent({
    actorId: userId,
    action: "partner.apply",
    entityType: "partner_application",
    entityId: appId,
    afterState: appRecord,
  });

  return appRecord;
}

export async function approvePartner(userId: string, reviewerId: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  const [app] = await db
    .select()
    .from(schema.partnerApplications)
    .where(eq(schema.partnerApplications.userId, userId))
    .limit(1);

  if (app) {
    await db
      .update(schema.partnerApplications)
      .set({
        status: "APPROVED",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(schema.partnerApplications.id, app.id));
  }

  // Single User Model: partnerStatus becomes APPROVED on the SAME user ID!
  await db
    .update(schema.users)
    .set({
      partnerStatus: "APPROVED",
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));

  // Single User Model: profile gets updated with business info on the SAME user!
  if (app) {
    await db
      .update(schema.userProfiles)
      .set({
        businessName: app.businessName,
        businessAddress: app.businessAddress,
        businessPhone: app.businessPhone,
        taxNumber: app.taxRegistrationNumber,
        updatedAt: new Date(),
      })
      .where(eq(schema.userProfiles.userId, userId));
  }

  await recordAuditEvent({
    actorId: reviewerId,
    action: "partner.approve",
    entityType: "user",
    entityId: userId,
    afterState: { partnerStatus: "APPROVED" },
  });

  return { success: true };
}
