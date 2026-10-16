import { NextResponse } from “next/server”;
import { randomInt } from “node:crypto”;
import { z } from “zod”;

import { prisma } from “@/lib/prisma”;
import { getCurrentUser } from “@/lib/auth”;

export const runtime = “nodejs”;

const gameSchema = z.object({
bet: z.number().int().min(1).max(100),
target: z.number().int().min(2).max(95),
});

export async function POST(request: Request) {
try {
const user = await getCurrentUser();

if (!user) {
  return NextResponse.json(
    { error: "Please log in first." },
    { status: 401 }
  );
}
const body = await request.json();
const parsed = gameSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: "Invalid bet or target." },
    { status: 400 }
  );
}
const { bet, target } = parsed.data;
const result = randomInt(1, 101);
const won = result <= target;
// Demonstration-only payout calculation.
const multiplier = won
  ? Number((95 / target).toFixed(4))
  : 0;
const payout = won
  ? Math.floor(bet * multiplier)
  : 0;
const profit = payout - bet;
const updated = await prisma.$transaction(async (tx) => {
  const debit = await tx.user.updateMany({
    where: {
      id: user.id,
      balance: {
        gte: bet,
      },
    },
    data: {
      balance: {
        decrement: bet,
      },
    },
  });
  if (debit.count !== 1) {
    throw new Error("INSUFFICIENT_BALANCE");
  }
  if (payout > 0) {
    await tx.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: payout,
        },
      },
    });
  }
  const account = await tx.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { balance: true },
  });
  await tx.gameHistory.create({
    data: {
      userId: user.id,
      game: "DICE",
      betAmount: bet,
      result: String(result),
      payout,
    },
  });
  return account;
});
return NextResponse.json({
  result,
  won,
  bet,
  multiplier,
  payout,
  profit,
  balance: Number(updated.balance),
});

} catch (error) {
if (
error instanceof Error &&
error.message === “INSUFFICIENT_BALANCE”
) {
return NextResponse.json(
{ error: “Not enough balance.” },
{ status: 400 }
);
}

console.error("Dice game error:", error);
return NextResponse.json(
  { error: "The game could not be completed." },
  { status: 500 }
);

}
}