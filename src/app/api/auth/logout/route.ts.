import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await destroyCurrentSession();

    return NextResponse.json({
      message: "Logged out successfully."
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to log out." },
      { status: 500 }
    );
  }
}