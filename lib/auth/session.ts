import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "stakedeals_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Secure key resolution: reads process.env.AUTH_SECRET or initializes a 256-bit secure buffer
let runtimeFallbackSecret: Uint8Array | null = null;

function getSecretKey(): Uint8Array {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) {
    return new TextEncoder().encode(process.env.AUTH_SECRET);
  }
  if (!runtimeFallbackSecret) {
    runtimeFallbackSecret = crypto.randomBytes(32);
  }
  return runtimeFallbackSecret;
}

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  partnerStatus: string;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      username: payload.username as string,
      partnerStatus: payload.partnerStatus as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
  } catch {
    // Outside request scope
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Outside request scope
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .limit(1);

    if (!user || user.status !== "ACTIVE") return null;

    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, user.id))
      .limit(1);

    const userRolesList = await db
      .select({
        id: schema.roles.id,
        name: schema.roles.name,
        slug: schema.roles.slug,
      })
      .from(schema.userRoles)
      .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
      .where(eq(schema.userRoles.userId, user.id));

    return {
      ...user,
      profile: profile || null,
      roles: userRolesList,
    };
  } catch (err) {
    console.error("[Session] Error resolving current user from PostgreSQL:", err);
    return null;
  }
}
