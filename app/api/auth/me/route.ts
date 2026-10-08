import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserPermissions, getUserRoles } from "@/lib/domain/permissions/service";
import { db, schema } from "@/lib/db";
import { eq, sum } from "drizzle-orm";
import { getSetting, SETTING_KEYS } from "@/lib/domain/settings/service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const permissions = await getUserPermissions(user.id);
  const roles = await getUserRoles(user.id);

  // Fetch user's real wallets from PostgreSQL
  const userWallets = await db
    .select()
    .from(schema.wallets)
    .where(eq(schema.wallets.userId, user.id));

  const sdpWallet = userWallets.find((w) => w.walletType === "SDP") || {
    balance: "0.0000",
    pendingBalance: "0.0000",
    maturedBalance: "0.0000",
    withdrawnTotal: "0.0000",
    spentTotal: "0.0000",
  };

  const sdcWallet = userWallets.find((w) => w.walletType === "SDC") || {
    balance: "0.0000",
    pendingBalance: "0.0000",
    maturedBalance: "0.0000",
    withdrawnTotal: "0.0000",
    spentTotal: "0.0000",
  };

  // Compute historical rank qualifying metric from Rank Qualification Ledger in PostgreSQL
  const [rankQualResult] = await db
    .select({ total: sum(schema.rankQualificationLedger.qualifyingSdcAmount) })
    .from(schema.rankQualificationLedger)
    .where(eq(schema.rankQualificationLedger.userId, user.id));

  const rankQualifyingSdc = rankQualResult?.total || "0.0000";

  // Check conversion settings (without invented hardcoded values)
  const sdpRate = await getSetting<string>(SETTING_KEYS.SDP_PKR_RATE, "");
  const sdcRate = await getSetting<string>(SETTING_KEYS.SDC_PKR_RATE, "");

  const { passwordHash: _, ...safeUser } = user;

  return NextResponse.json({
    authenticated: true,
    user: {
      ...safeUser,
      roles,
      permissions,
      wallets: {
        sdp: sdpWallet,
        sdc: sdcWallet,
      },
      rankQualifyingSdc,
      rates: {
        sdpRate: sdpRate && sdpRate !== "[UNCONFIGURED]" ? sdpRate : null,
        sdcRate: sdcRate && sdcRate !== "[UNCONFIGURED]" ? sdcRate : null,
      },
    },
  });
}
