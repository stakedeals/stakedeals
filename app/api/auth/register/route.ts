import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/domain/users/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await registerUser(body);
    return NextResponse.json({
      success: true,
      message: "Account created successfully. Welcome to StakeDeals!",
      user: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Registration failed.",
      },
      { status: 400 }
    );
  }
}
