import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { count } from "drizzle-orm";
import { getAllSettings } from "@/lib/domain/settings/service";
import { getAuditLogs } from "@/lib/domain/audit/service";

export async function GET() {
  try {
    const settings = await getAllSettings();
    const auditLogsResult = await getAuditLogs({ limit: 10 });

    const [usersCount] = await db.select({ value: count() }).from(schema.users);
    const [profilesCount] = await db.select({ value: count() }).from(schema.userProfiles);
    const [rolesCount] = await db.select({ value: count() }).from(schema.roles);
    const [permissionsCount] = await db.select({ value: count() }).from(schema.permissions);
    const [sponsorsCount] = await db.select({ value: count() }).from(schema.sponsorRelationships);
    const [walletsCount] = await db.select({ value: count() }).from(schema.wallets);
    const [settingsCount] = await db.select({ value: count() }).from(schema.platformSettings);

    return NextResponse.json({
      status: "healthy",
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: true,
        mode: "PostgreSQL (Cloud SQL)",
        engine: "PostgreSQL / Cloud SQL Authoritative Engine",
        tables: {
          users: Number(usersCount?.value || 0),
          profiles: Number(profilesCount?.value || 0),
          roles: Number(rolesCount?.value || 0),
          permissions: Number(permissionsCount?.value || 0),
          sponsorRelationships: Number(sponsorsCount?.value || 0),
          wallets: Number(walletsCount?.value || 0),
          settings: Number(settingsCount?.value || 0),
          auditLogsTotal: auditLogsResult.total,
        },
      },
      platformSettings: settings,
      recentAuditLogs: auditLogsResult.items,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database status check error";
    console.error("[System Status] Failed:", err);
    return NextResponse.json(
      {
        status: "error",
        error: message,
      },
      { status: 500 }
    );
  }
}
