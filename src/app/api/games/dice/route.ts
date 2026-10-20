import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_BET = 10;
const MAX_BET = 1000;
const TARGET = 50;
const MULTIPLIER = 1.94;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please log in to play." },
        { status: 401 }
      );
    }

    let body: { bet?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request." },
        { status: 400 }
      );
    }

    const bet = Number(body.bet);

    if (
      !Number.isFinite(bet) ||
      bet < MIN_BET ||
      bet > MAX_BET ||
      Math.round(bet * 100) !== bet * 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Bet must be between 10 and 1,000.",
        },
        { status: 400 }
      );
    }

    // Generates a secure random value from 0.00 to 99.99.
    const roll = randomInt(0, 10000) / 100;
    const won = roll < TARGET;

    const payout = won
      ? Math.round(bet * MULTIPLIER * 100) / 100
      : 0;

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });

      if (!account || Number(account.balance) < bet) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: bet,
          },
        },
      });

      let finalBalance = Number(account.balance) - bet;

      if (payout > 0) {
        const paid = await tx.user.update({
          where: { id: user.id },
          data: {
            balance: {
              increment: payout,
            },
          },
          select: { balance: true },
        });

        finalBalance = Number(paid.balance);
      }

      await tx.gameHistory.create({
        data: {
          userId: user.id,
          game: "dice",
          betAmount: bet,
          payout,
          result: won
            ? `Won: rolled ${roll.toFixed(2)} under ${TARGET}`
            : `Lost: rolled ${roll.toFixed(2)}`,
        },
      });

      return { balance: finalBalance };
    });

    return NextResponse.json({
      success: true,
      game: "dice",
      bet,
      roll,
      target: TARGET,
      won,
      multiplier: won ? MULTIPLIER : 0,
      payout,
      balance: result.balance,
      message: won ? "You won!" : "Better luck next time!",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance." },
        { status: 400 }
      );
    }

    console.error("Dice game error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to play Dice right now.",
      },
      { status: 500 }
    );
  }
}