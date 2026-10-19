import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const diceSchema = z.object({
  bet: z.number().finite().min(1).max(100).refine(
    (value) => Math.round(value * 100) === value * 100,
    "Bet must have no more than two decimal places."
  ),
  target: z.number().int().min(2).max(95),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to play Dice." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = diceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid bet or target number." },
        { status: 400 }
      );
    }

    const { bet, target } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { id: true, balance: true },
      });

      if (!currentUser) {
        throw new Error("USER_NOT_FOUND");
      }

      const balance = Number(currentUser.balance);

      if (!Number.isFinite(balance) || balance < 10) {
        throw new Error("MINIMUM_BALANCE");
      }

      if (balance < bet) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const updated = await tx.user.updateMany({
        where: {
          id: user.id,
          balance: { gte: bet },
        },
        data: {
          balance: { decrement: bet },
        },
      });

      if (updated.count !== 1) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // Secure random roll generated on the server.
      const roll = crypto.getRandomValues(new Uint32Array(1))[0] % 100 + 1;
      const won = roll <= target;

      // Gross payout includes the original wager.
      const multiplier = won ? 95 / target : 0;
      const payout = won ? Math.floor(bet * multiplier * 100) / 100 : 0;
      const profit = Math.round((payout - bet) * 100) / 100;

      if (payout > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            balance: { increment: payout },
          },
        });
      }

      await tx.gameHistory.create({
        data: {
          userId: user.id,
          game: "dice",
          betAmount: bet,
          payout,
          result: JSON.stringify({
            roll,
            target,
            won,
            multiplier,
          }),
        },
      });

      const latestUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });

      return {
        result: roll,
        won,
        bet,
        multiplier: won ? Math.round(multiplier * 100) / 100 : 0,
        profit,
        balance: Number(latestUser?.balance ?? 0),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    if (message === "MINIMUM_BALANCE") {
      return NextResponse.json(
        { error: "You need at least 10 USDT in your balance to play." },
        { status: 400 }
      );
    }

    if (message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "Your balance is insufficient for this bet." },
        { status: 400 }
      );
    }

    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    console.error("Dice game error:", error);

    return NextResponse.json(
      { error: "Unable to play Dice right now. Please try again." },
      { status: 500 }
    );
  }
}