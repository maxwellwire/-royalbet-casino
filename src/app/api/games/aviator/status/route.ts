import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please log in to continue." },
        { status: 401 }
      );
    }

    const round = await prisma.activeGame.findFirst({
      where: {
        userId: user.id,
        game: "aviator",
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!round) {
      return NextResponse.json({
        success: true,
        active: false,
      });
    }

    const state = round.state as {
      bet?: number;
      crashAt?: number;
      startedAt?: number;
    };

    const bet = Number(state.bet);
    const crashAt = Number(state.crashAt);
    const startedAt = Number(state.startedAt);

    if (
      !Number.isFinite(bet) ||
      !Number.isFinite(crashAt) ||
      !Number.isFinite(startedAt) ||
      bet <= 0 ||
      crashAt < 1 ||
      startedAt <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid Aviator round." },
        { status: 500 }
      );
    }

    const elapsed = Math.max(0, Date.now() - startedAt);

    const multiplier = Math.max(
      1,
      Math.floor(Math.exp(elapsed / 5000) * 100) / 100
    );

    if (multiplier >= crashAt) {
      const finished = await prisma.activeGame.updateMany({
        where: {
          id: round.id,
          userId: user.id,
          status: "ACTIVE",
        },
        data: {
          status: "LOST",
          state: {
            ...state,
            finalMultiplier: crashAt,
            finishedAt: Date.now(),
          },
        },
      });

      if (finished.count === 1) {
        await prisma.gameHistory.create({
          data: {
            userId: user.id,
            game: "aviator",
            betAmount: bet,
            payout: 0,
            result: `Crashed at ${crashAt.toFixed(2)}x`,
          },
        });
      }

      const account = await prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });

      return NextResponse.json({
        success: true,
        active: false,
        crashed: true,
        crashAt,
        balance: account ? Number(account.balance) : 0,
      });
    }

    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return NextResponse.json({
      success: true,
      active: true,
      multiplier,
      crashAt,
      balance: account ? Number(account.balance) : 0,
    });
  } catch (error) {
    console.error("Aviator status error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to check the Aviator round.",
      },
      { status: 500 }
    );
  }
}