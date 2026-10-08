import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getAllCategories, createCategory } from "@/lib/domain/categories/service";
import { categorySchema } from "@/lib/validations/catalog";
import { hasPermission } from "@/lib/domain/permissions/service";
import { SYSTEM_PERMISSIONS } from "@/lib/domain/permissions/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const categories = await getAllCategories(includeInactive);
    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canCreate = await hasPermission(session.userId, SYSTEM_PERMISSIONS.PRODUCTS_CREATE);
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const validated = categorySchema.parse(body);

    const category = await createCategory(session.userId, validated);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
