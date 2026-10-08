import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { recordAuditEvent } from "@/lib/domain/audit/service";

export const SETTING_KEYS = {
  DEFAULT_SPONSOR_USER_ID: "DEFAULT_SPONSOR_USER_ID",
  SDC_FALLBACK_RECIPIENT_USER_ID: "SDC_FALLBACK_RECIPIENT_USER_ID",
  SDP_PKR_RATE: "SDP_PKR_RATE",
  SDC_PKR_RATE: "SDC_PKR_RATE",
  ALLOW_MEMBER_SDC_TRANSFER: "ALLOW_MEMBER_SDC_TRANSFER",
} as const;

export async function getSetting<T = string>(key: string, defaultValue?: T): Promise<T> {
  try {
    const records = await db
      .select()
      .from(schema.platformSettings)
      .where(eq(schema.platformSettings.key, key))
      .limit(1);

    if (!records || records.length === 0) {
      return defaultValue as T;
    }
    return (records[0].value as unknown) as T;
  } catch (err) {
    console.error(`[Settings] Failed to fetch setting "${key}":`, err);
    return defaultValue as T;
  }
}

export async function getAllSettings(): Promise<
  Record<string, { value: string; description?: string | null; updatedAt: Date }>
> {
  try {
    const records = await db.select().from(schema.platformSettings);
    const result: Record<string, { value: string; description?: string | null; updatedAt: Date }> = {};
    for (const r of records) {
      result[r.key] = {
        value: r.value,
        description: r.description,
        updatedAt: r.updatedAt,
      };
    }
    return result;
  } catch (err) {
    console.error("[Settings] Failed to fetch all settings:", err);
    return {};
  }
}

export async function updateSetting(
  key: string,
  value: string,
  updatedBy: string,
  description?: string
): Promise<void> {
  const existing = await db
    .select()
    .from(schema.platformSettings)
    .where(eq(schema.platformSettings.key, key))
    .limit(1);

  const beforeState = existing.length > 0 ? { value: existing[0].value } : null;

  await db
    .insert(schema.platformSettings)
    .values({
      key,
      value,
      description: description || existing[0]?.description || null,
      updatedBy,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.platformSettings.key,
      set: {
        value,
        description: description || existing[0]?.description || null,
        updatedBy,
        updatedAt: new Date(),
      },
    });

  await recordAuditEvent({
    actorId: updatedBy,
    action: "platform_settings.update",
    entityType: "platform_setting",
    entityId: key,
    beforeState,
    afterState: { value },
    metadata: { description },
  });
}
