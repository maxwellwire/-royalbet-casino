import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await destroyCurrentSession();

    return NextResponse.redirect(
      new URL("/login?loggedOut=true", request.url),
      303
    );
  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.redirect(
      new URL("/login?error=logout", request.url),
      303
    );
  }
}