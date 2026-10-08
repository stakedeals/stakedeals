import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { queryProducts, createProduct } from "@/lib/domain/products/service";
import { createProductSchema } from "@/lib/validations/catalog";
import { hasPermission } from "@/lib/domain/permissions/service";
import { SYSTEM_PERMISSIONS } from "@/lib/domain/permissions/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const childCategoryId = searchParams.get("childCategoryId") || undefined;
    const search = searchParams.get("search") || undefined;
    const minPrice = searchParams.get("minPrice") || undefined;
    const maxPrice = searchParams.get("maxPrice") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;
    const purchaseContext = searchParams.get("purchaseContext") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 12;

    const result = await queryProducts({
      categoryId,
      childCategoryId,
      search,
      minPrice,
      maxPrice,
      sellerId,
      purchaseContext,
      page,
      limit,
      isPublicOnly: true,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to query products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const isAdmin = await hasPermission(session.userId, SYSTEM_PERMISSIONS.PRODUCTS_CREATE);

    // If caller is partner, sellerId is enforced as session.userId
    const product = await createProduct(session.userId, validated, {
      autoApprove: isAdmin,
      actorId: session.userId,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
