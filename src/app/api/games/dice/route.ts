import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const gameSchema = z.object({
  bet: z.number().int().min(1).max(100),
  target: z.number().int().min(2).max(95)
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

    /*
     * Demonstration-only payout calculation.
     * This is not a production gambling payout model.
     */
    const multiplier = won
      ? Number((95 / target).toFixed(4))
      : 0;

    const returnedCredits = won
      ? Math.floor(bet * multiplier)
      : 0;

    const netProfit = returnedCredits - bet;

    const updated = await prisma.$transaction(
      async (tx) => {
        const debit = await tx.user.updateMany({
          where: {
            id: user.id,
            demoCredits: {
              gte: bet
            }
          },
          data: {
            demoCredits: {
              decrement: bet
            }
          }
        });

        if (debit.count !== 1) {
          throw new Error("INSUFFICIENT_CREDITS");
        }

        if (returnedCredits > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              demoCredits: {
                increment: returnedCredits
              }
            }
          });
        }

        const account = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
          select: { demoCredits: true }
        });

        await tx.gameHistory.create({
          data: {
            userId: user.id,
            game: "DICE",
            betAmount: bet,
            result: String(result),
            multiplier,
            profit: netProfit,
            balanceAfter: account.demoCredits
          }
        });

        return account;
      }
    );

    return NextResponse.json({
      result,
      won,
      bet,
      multiplier,
      profit: netProfit,
      demoCredits: updated.demoCredits
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_CREDITS"
    ) {
      return NextResponse.json(
        { error: "Not enough virtual credits." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "The game could not be completed." },
      { status: 500 }
    );
  }
}