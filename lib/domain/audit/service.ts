import { db, schema } from "@/lib/db";
import { desc, eq, and, count } from "drizzle-orm";
import crypto from "crypto";

export interface AuditEventParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: unknown;
  afterState?: unknown;
  metadata?: unknown;
  ipAddress?: string;
}

export async function recordAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const id = `aud_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await db.insert(schema.auditLogs).values({
      id,
      actorId: params.actorId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeState: params.beforeState ? (params.beforeState as Record<string, unknown>) : null,
      afterState: params.afterState ? (params.afterState as Record<string, unknown>) : null,
      metadata: params.metadata ? (params.metadata as Record<string, unknown>) : null,
      ipAddress: params.ipAddress || null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("[AuditLog] Failed to record audit log in PostgreSQL:", err);
  }
}

export async function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  entityType?: string;
  actorId?: string;
}) {
  try {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const conditions = [];
    if (options?.entityType) {
      conditions.push(eq(schema.auditLogs.entityType, options.entityType));
    }
    if (options?.actorId) {
      conditions.push(eq(schema.auditLogs.actorId, options.actorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(schema.auditLogs)
      .where(whereClause);

    const items = await db
      .select()
      .from(schema.auditLogs)
      .where(whereClause)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      total: Number(totalResult?.value || 0),
      items,
    };
  } catch (err) {
    console.error("[AuditLog] Failed to query audit logs from PostgreSQL:", err);
    return {
      total: 0,
      items: [],
    };
  }
}
