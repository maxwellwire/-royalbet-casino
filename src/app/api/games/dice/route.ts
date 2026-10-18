import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in first." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      error:
        "USDT giveaway balances cannot be used for game wagers. Game wagering is currently disabled.",
    },
    { status: 403 }
  );
}