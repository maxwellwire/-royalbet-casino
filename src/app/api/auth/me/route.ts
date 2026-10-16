import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: Number(user.balance),
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve your account." },
      { status: 500 }
    );
  }
}