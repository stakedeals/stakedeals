import { db, schema } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { SYSTEM_ROLES, SystemRole, SystemPermission } from "./constants";
import { recordAuditEvent } from "@/lib/domain/audit/service";
import crypto from "crypto";

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const userRoleRows = await db
      .select({
        roleId: schema.userRoles.roleId,
        slug: schema.roles.slug,
      })
      .from(schema.userRoles)
      .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
      .where(eq(schema.userRoles.userId, userId));

    return userRoleRows.map((r) => r.slug);
  } catch (err) {
    console.error("[Permissions] Error getting user roles from PostgreSQL:", err);
    return [];
  }
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const roles = await getUserRoles(userId);

    // Super Admin (Owner) possesses ALL system permissions unconditionally
    if (roles.includes(SYSTEM_ROLES.OWNER)) {
      const allPerms = await db.select({ slug: schema.permissions.slug }).from(schema.permissions);
      return allPerms.map((p) => p.slug);
    }

    if (roles.length === 0) {
      return [];
    }

    // Fetch role records for the user's role slugs
    const roleRows = await db
      .select({ id: schema.roles.id })
      .from(schema.roles)
      .where(inArray(schema.roles.slug, roles));

    const roleIds = roleRows.map((r) => r.id);
    if (roleIds.length === 0) {
      return [];
    }

    // Fetch permissions associated with these roles
    const permRows = await db
      .select({ slug: schema.permissions.slug })
      .from(schema.rolePermissions)
      .innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
      .where(inArray(schema.rolePermissions.roleId, roleIds));

    return Array.from(new Set(permRows.map((p) => p.slug)));
  } catch (err) {
    console.error("[Permissions] Error getting user permissions from PostgreSQL:", err);
    return [];
  }
}

export async function hasRole(userId: string, roleSlug: SystemRole | string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(roleSlug);
}

export async function hasPermission(
  userId: string,
  permissionSlug: SystemPermission | string
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  if (roles.includes(SYSTEM_ROLES.OWNER)) {
    return true;
  }
  const perms = await getUserPermissions(userId);
  return perms.includes(permissionSlug);
}

export async function assignRole(
  userId: string,
  roleSlug: string,
  assignedBy: string
): Promise<void> {
  const [role] = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.slug, roleSlug))
    .limit(1);

  if (!role) {
    throw new Error(`Role "${roleSlug}" does not exist`);
  }

  const [existing] = await db
    .select()
    .from(schema.userRoles)
    .where(and(eq(schema.userRoles.userId, userId), eq(schema.userRoles.roleId, role.id)))
    .limit(1);

  if (existing) return;

  const id = `ur_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  await db.insert(schema.userRoles).values({
    id,
    userId,
    roleId: role.id,
    assignedAt: new Date(),
    assignedBy,
  });

  await recordAuditEvent({
    actorId: assignedBy,
    action: "roles.assign",
    entityType: "user_role",
    entityId: id,
    afterState: { userId, roleSlug, roleId: role.id },
  });
}

export async function removeRole(
  userId: string,
  roleSlug: string,
  removedBy: string
): Promise<void> {
  const [role] = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.slug, roleSlug))
    .limit(1);

  if (!role) return;

  await db
    .delete(schema.userRoles)
    .where(and(eq(schema.userRoles.userId, userId), eq(schema.userRoles.roleId, role.id)));

  await recordAuditEvent({
    actorId: removedBy,
    action: "roles.remove",
    entityType: "user_role",
    entityId: `${userId}_${role.id}`,
    beforeState: { userId, roleSlug },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requirePermission(permissionSlug: SystemPermission | string) {
  const user = await requireAuth();
  const allowed = await hasPermission(user.id, permissionSlug);
  if (!allowed) {
    throw new Error("FORBIDDEN_INSUFFICIENT_PERMISSIONS");
  }
  return user;
}

export async function requireRole(roleSlug: SystemRole | string) {
  const user = await requireAuth();
  const allowed = await hasRole(user.id, roleSlug);
  if (!allowed && !(await hasRole(user.id, SYSTEM_ROLES.OWNER))) {
    throw new Error("FORBIDDEN_INSUFFICIENT_ROLE");
  }
  return user;
}
