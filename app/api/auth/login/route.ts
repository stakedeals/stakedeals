import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/domain/users/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await loginUser(body);
    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Invalid credentials.",
      },
      { status: 401 }
    );
  }
}
