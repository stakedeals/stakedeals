import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { recordAuditEvent } from "@/lib/domain/audit/service";

export interface PartnerAgreementInput {
  partnerId: string;
  platformFeeSdc: string; // Stored as numeric string
  effectiveDate?: Date;
  version?: string;
  feeRecipientUserId: string;
  status?: string;
  notes?: string;
}

/**
 * Foundation service for Partner Agreements.
 * Preserves the Master Specification requirement:
 * - Partner agreements are historical and versioned.
 * - Platform fee configuration is partner-specific.
 * - Does NOT hardcode or invent any default fee percentage.
 * - Changes are server-authorized and auditable.
 */
export async function createPartnerAgreement(
  adminId: string,
  input: PartnerAgreementInput
) {
  const agreementId = `pagr_${input.partnerId}_${Date.now()}`;
  const agreementRecord = {
    id: agreementId,
    partnerId: input.partnerId,
    platformFeeSdc: input.platformFeeSdc,
    effectiveDate: input.effectiveDate || new Date(),
    version: input.version || "1.0",
    feeRecipientUserId: input.feeRecipientUserId,
    status: input.status || "ACTIVE",
    notes: input.notes || null,
    createdAt: new Date(),
  };

  await db.insert(schema.partnerAgreements).values(agreementRecord);

  await recordAuditEvent({
    actorId: adminId,
    action: "partner_agreement.create",
    entityType: "partner_agreement",
    entityId: agreementId,
    afterState: agreementRecord,
    metadata: { partnerId: input.partnerId },
  });

  return agreementRecord;
}

export async function getActivePartnerAgreement(partnerId: string) {
  const [agreement] = await db
    .select()
    .from(schema.partnerAgreements)
    .where(eq(schema.partnerAgreements.partnerId, partnerId))
    .limit(1);

  return agreement || null;
}
