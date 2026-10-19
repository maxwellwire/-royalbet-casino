import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type State = Record<string, any>;

const MINIMUM_BALANCE = 10;
const MAXIMUM_BET = 1000;

const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const response = (body: object, status = 200) =>
  NextResponse.json(body, { status });

function validAmount(value: unknown): number | null {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 1 ||
    amount > MAXIMUM_BET ||
    Math.round(amount * 100) !== amount * 100
  ) {
    return null;
  }

  return amount;
}

function generateCrashMultiplier(): number {
  const random = Math.random();

  return Math.max(
    1,
    Math.min(
      100,
      Math.floor((0.97 / (1 - random)) * 100) / 100
    )
  );
}

function calculateMinesMultiplier(
  safePicks: number,
  mineCount: number
): number {
  let probability = 1;

  for (let i = 0; i < safePicks; i++) {
    probability *= (25 - mineCount - i) / (25 - i);
  }

  if (probability <= 0) return 100;

  return Math.min(
    100,
    Math.max(
      1,
      Math.floor((0.97 / probability) * 100) / 100
    )
  );
}

function shuffledTiles(): number[] {
  const tiles = Array.from({ length: 25 }, (_, index) => index);

  for (let i = tiles.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  return tiles;
}

async function getAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      error: response({ error: "Please log in to play." }, 401),
    };
  }

  return { user, error: null };
}

async function debitBet(
  tx: Prisma.TransactionClient,
  userId: string,
  bet: number
) {
  const debit = await tx.user.updateMany({
    where: {
      id: userId,
      balance: { gte: bet },
    },
    data: {
      balance: { decrement: bet },
    },
  });

  if (debit.count !== 1) {
    throw new Error("INSUFFICIENT");
  }
}

async function getFreshBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  return Number(user?.balance ?? 0);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ game: string }> }
) {
  const { game } = await context.params;

  if (!["aviator", "slots", "mines"].includes(game)) {
    return response({ error: "Game not found." }, 404);
  }

  const auth = await getAuthenticatedUser();

  if (auth.error || !auth.user) {
    return auth.error!;
  }

  const user = auth.user;

  let body: State;

  try {
    body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response({ error: "Invalid request body." }, 400);
    }
  } catch {
    return response({ error: "Invalid request." }, 400);
  }

  const action = String(body.action ?? "");

  /*
   * Require a minimum balance when starting a round.
   * The bet itself must also be affordable.
   */
  if (["start", "spin"].includes(action)) {
    const balance = Number(user.balance);

    if (!Number.isFinite(balance) || balance < MINIMUM_BALANCE) {
      return response(
        {
          error: "You need at least 10 USDT in your account to start a game.",
          requiredBalance: MINIMUM_BALANCE,
        },
        403
      );
    }
  }

  try {
    /*
     * ROYAL SLOTS
     */
    if (game === "slots") {
      if (action !== "spin") {
        return response({ error: "Invalid Slots action." }, 400);
      }

      const bet = validAmount(body.bet);

      if (bet === null) {
        return response(
          {
            error:
              "Bet must be between 1 and 1,000 USDT, with up to two decimal places.",
          },
          400
        );
      }

      const symbols = ["🍒", "🍋", "🔔", "🍇", "💎", "👑"];

      const reels = Array.from(
        { length: 3 },
        () => symbols[randomInt(symbols.length)]
      );

      let multiplier = 0;

      if (reels.every((symbol) => symbol === reels[0])) {
        if (reels[0] === "👑") {
          multiplier = 8;
        } else if (reels[0] === "💎") {
          multiplier = 6;
        } else {
          multiplier = 4;
        }
      } else if (
        reels[0] === reels[1] ||
        reels[1] === reels[2] ||
        reels[0] === reels[2]
      ) {
        multiplier = 1.5;
      }

      const payout = money(bet * multiplier);
      const net = money(payout - bet);

      const balance = await prisma.$transaction(async (tx) => {
        await debitBet(tx, user.id, bet);

        if (payout > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: { balance: { increment: payout } },
          });
        }

        await tx.gameHistory.create({
          data: {
            userId: user.id,
            game: "slots",
            betAmount: bet,
            payout,
            result: JSON.stringify({ reels, multiplier }),
          },
        });

        const freshUser = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
          select: { balance: true },
        });

        return Number(freshUser.balance);
      });

      return response({
        reels,
        multiplier,
        payout,
        net,
        balance,
      });
    }

    /*
     * ROYAL AVIATOR
     */
    if (game === "aviator") {
      if (action === "start") {
        const bet = validAmount(body.bet);

        if (bet === null) {
          return response({ error: "Invalid bet amount." }, 400);
        }

        const existingRound = await prisma.activeGame.findFirst({
          where: {
            userId: user.id,
            game: "aviator",
            status: "ACTIVE",
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingRound) {
          return response(
            { error: "You already have an active Aviator round." },
            409
          );
        }

        const crashAt = generateCrashMultiplier();

        const created = await prisma.$transaction(async (tx) => {
          await debitBet(tx, user.id, bet);

          const round = await tx.activeGame.create({
            data: {
              userId: user.id,
              game: "aviator",
              state: {
                bet,
                crashAt,
                startedAt: Date.now(),
              } as Prisma.InputJsonValue,
            },
          });

          const freshUser = await tx.user.findUniqueOrThrow({
            where: { id: user.id },
            select: { balance: true },
          });

          return {
            roundId: round.id,
            balance: Number(freshUser.balance),
          };
        });

        return response({
          roundId: created.roundId,
          bet,
          balance: created.balance,
        });
      }

      if (action === "cashout") {
        const round = await prisma.activeGame.findFirst({
          where: {
            userId: user.id,
            game: "aviator",
            status: "ACTIVE",
          },
          orderBy: { createdAt: "desc" },
        });

        if (!round) {
          return response({ error: "No active Aviator round." }, 409);
        }

        const state = round.state as State;

        const elapsed = Math.max(
          0,
          Date.now() - Number(state.startedAt)
        );

        const currentMultiplier = Math.max(
          1,
          Math.floor(Math.exp(elapsed / 5000) * 100) / 100
        );

        if (currentMultiplier >= Number(state.crashAt)) {
          await prisma.$transaction(async (tx) => {
            const finished = await tx.activeGame.updateMany({
              where: {
                id: round.id,
                status: "ACTIVE",
              },
              data: { status: "LOST" },
            });

            if (finished.count !== 1) {
              throw new Error("ROUND_FINISHED");
            }

            await tx.gameHistory.create({
              data: {
                userId: user.id,
                game: "aviator",
                betAmount: Number(state.bet),
                payout: 0,
                result: JSON.stringify({
                  outcome: "crashed",
                  crashAt: state.crashAt,
                }),
              },
            });
          });

          return response({
            crashed: true,
            crashAt: state.crashAt,
            balance: await getFreshBalance(user.id),
          });
        }

        const multiplier = currentMultiplier;
        const payout = money(Number(state.bet) * multiplier);

        const balance = await prisma.$transaction(async (tx) => {
          const finished = await tx.activeGame.updateMany({
            where: {
              id: round.id,
              status: "ACTIVE",
            },
            data: { status: "CASHED_OUT" },
          });

          if (finished.count !== 1) {
            throw new Error("ROUND_FINISHED");
          }

          await tx.user.update({
            where: { id: user.id },
            data: { balance: { increment: payout } },
          });

          await tx.gameHistory.create({
            data: {
              userId: user.id,
              game: "aviator",
              betAmount: Number(state.bet),
              payout,
              result: JSON.stringify({
                outcome: "cashout",
                multiplier,
              }),
            },
          });

          const freshUser = await tx.user.findUniqueOrThrow({
            where: { id: user.id },
            select: { balance: true },
          });

          return Number(freshUser.balance);
        });

        return response({
          crashed: false,
          multiplier,
          payout,
          balance,
        });
      }

      return response({ error: "Invalid Aviator action." }, 400);
    }

    /*
     * ROYAL MINES
     */
    if (game === "mines") {
      if (action === "start") {
        const bet = validAmount(body.bet);
        const mineCount = Number(body.mineCount);

        if (bet === null) {
          return response({ error: "Invalid bet amount." }, 400);
        }

        if (
          !Number.isInteger(mineCount) ||
          mineCount < 1 ||
          mineCount > 24
        ) {
          return response(
            { error: "Choose between 1 and 24 mines." },
            400
          );
        }

        const existingRound = await prisma.activeGame.findFirst({
          where: {
            userId: user.id,
            game: "mines",
            status: "ACTIVE",
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingRound) {
          return response(
            { error: "You already have an active Mines round." },
            409
          );
        }

        const minePositions = shuffledTiles().slice(0, mineCount);

        const created = await prisma.$transaction(async (tx) => {
          await debitBet(tx, user.id, bet);

          const round = await tx.activeGame.create({
            data: {
              userId: user.id,
              game: "mines",
              state: {
                bet,
                mineCount,
                mines: minePositions,
                picks: [],
              } as Prisma.InputJsonValue,
            },
          });

          const freshUser = await tx.user.findUniqueOrThrow({
            where: { id: user.id },
            select: { balance: true },
          });

          return {
            roundId: round.id,
            balance: Number(freshUser.balance),
          };
        });

        return response({
          roundId: created.roundId,
          bet,
          mineCount,
          picks: [],
          multiplier: 1,
          balance: created.balance,
        });
      }

      const round = await prisma.activeGame.findFirst({
        where: {
          userId: user.id,
          game: "mines",
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!round) {
        return response({ error: "No active Mines round." }, 409);
      }

      const state = round.state as State;

      const picks: number[] = Array.isArray(state.picks)
        ? state.picks
        : [];

      const mines: number[] = Array.isArray(state.mines)
        ? state.mines
        : [];

      if (action === "reveal") {
        const tile = Number(body.tile);

        if (
          !Number.isInteger(tile) ||
          tile < 0 ||
          tile > 24 ||
          picks.includes(tile)
        ) {
          return response({ error: "Choose an unrevealed tile." }, 400);
        }

        if (mines.includes(tile)) {
          await prisma.$transaction(async (tx) => {
            const finished = await tx.activeGame.updateMany({
              where: {
                id: round.id,
                status: "ACTIVE",
              },
              data: { status: "LOST" },
            });

            if (finished.count !== 1) {
              throw new Error("ROUND_FINISHED");
            }

            await tx.gameHistory.create({
              data: {
                userId: user.id,
                game: "mines",
                betAmount: Number(state.bet),
                payout: 0,
                result: JSON.stringify({
                  outcome: "mine",
                  tile,
                  mineCount: state.mineCount,
                }),
              },
            });
          });

          return response({
            hitMine: true,
            tile,
            mines,
            picks,
            balance: await getFreshBalance(user.id),
          });
        }

        const nextPicks = [...picks, tile];

        const multiplier = calculateMinesMultiplier(
          nextPicks.length,
          Number(state.mineCount)
        );

        await prisma.activeGame.updateMany({
          where: {
            id: round.id,
            status: "ACTIVE",
          },
          data: {
            state: {
              ...state,
              picks: nextPicks,
            } as Prisma.InputJsonValue,
          },
        });

        return response({
          hitMine: false,
          tile,
          picks: nextPicks,
          multiplier,
          potentialPayout: money(Number(state.bet) * multiplier),
        });
      }

      if (action === "cashout") {
        if (picks.length === 0) {
          return response(
            {
              error:
                "Reveal at least one safe tile before cashing out.",
            },
            400
          );
        }

        const multiplier = calculateMinesMultiplier(
          picks.length,
          Number(state.mineCount)
        );

        const payout = money(Number(state.bet) * multiplier);

        const balance = await prisma.$transaction(async (tx) => {
          const finished = await tx.activeGame.updateMany({
            where: {
              id: round.id,
              status: "ACTIVE",
            },
            data: { status: "CASHED_OUT" },
          });

          if (finished.count !== 1) {
            throw new Error("ROUND_FINISHED");
          }

          await tx.user.update({
            where: { id: user.id },
            data: { balance: { increment: payout } },
          });

          await tx.gameHistory.create({
            data: {
              userId: user.id,
              game: "mines",
              betAmount: Number(state.bet),
              payout,
              result: JSON.stringify({
                outcome: "cashout",
                picks: picks.length,
                multiplier,
              }),
            },
          });

          const freshUser = await tx.user.findUniqueOrThrow({
            where: { id: user.id },
            select: { balance: true },
          });

          return Number(freshUser.balance);
        });

        return response({
          payout,
          multiplier,
          balance,
          mines,
          picks,
          cashedOut: true,
        });
      }

      return response({ error: "Invalid Mines action." }, 400);
    }

    return response({ error: "Invalid game action." }, 400);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (message === "INSUFFICIENT") {
      return response(
        { error: "Your balance is too low for that bet." },
        400
      );
    }

    if (message === "ROUND_FINISHED") {
      return response(
        { error: "This round has already finished." },
        409
      );
    }

    console.error("Game API error:", error);

    return response(
      {
        error:
          "Could not process this game action. Please check your account before retrying.",
      },
      500
    );
  }
}