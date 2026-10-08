import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getProductById, updateProduct, moderateProduct, updateInventory, configureProductSdpRule, configureProductSdcRule } from "@/lib/domain/products/service";
import { updateProductSchema, moderateProductSchema, updateInventorySchema, productSdpRuleSchema, productSdcRuleSchema } from "@/lib/validations/catalog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check action type if specific sub-operation
    if (body.action === "moderate") {
      const validated = moderateProductSchema.parse(body.data);
      const moderated = await moderateProduct(session.userId, id, validated);
      return NextResponse.json({ success: true, product: moderated });
    }

    if (body.action === "update_inventory") {
      const validated = updateInventorySchema.parse(body.data);
      const inventory = await updateInventory(session.userId, id, validated);
      return NextResponse.json({ success: true, inventory });
    }

    if (body.action === "configure_sdp_rule") {
      const validated = productSdpRuleSchema.parse(body.data);
      const sdpRule = await configureProductSdpRule(session.userId, id, validated);
      return NextResponse.json({ success: true, sdpRule });
    }

    if (body.action === "configure_sdc_rule") {
      const validated = productSdcRuleSchema.parse(body.data);
      const sdcRule = await configureProductSdcRule(session.userId, id, validated);
      return NextResponse.json({ success: true, sdcRule });
    }

    // Default: update product listing fields
    const validated = updateProductSchema.parse(body);
    const updated = await updateProduct(id, session.userId, validated);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
