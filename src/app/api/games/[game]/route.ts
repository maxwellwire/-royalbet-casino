import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type State = Record<string, any>;

const money = (n: number) => Math.round(n * 100) / 100;

const response = (body: object, status = 200) =>
  NextResponse.json(body, { status });

function validAmount(value: unknown) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 1 ||
    amount > 1000 ||
    Math.round(amount * 100) !== amount * 100
  ) {
    return null;
  }

  return amount;
}

async function getAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: response(
        { error: "Please log in to play." },
        401
      ),
    };
  }

  return { user };
}

function generateCrashMultiplier() {
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
) {
  let probability = 1;

  for (let i = 0; i < safePicks; i++) {
    probability *=
      (25 - mineCount - i) / (25 - i);
  }

  return Math.max(
    1,
    Math.floor((0.97 / probability) * 100) / 100
  );
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

  if (auth.error) {
    return auth.error;
  }

  const user = auth.user!;

  let body: State;

  try {
    body = await request.json();
  } catch {
    return response({ error: "Invalid request." }, 400);
  }

  const action = String(body.action || "");
  const balance = Number(user.balance);

  // The minimum balance is required when starting a round.
  if (
    ["start", "spin"].includes(action) &&
    (!Number.isFinite(balance) || balance < 50)
  ) {
    return response(
      {
        error:
          "You need at least 50 USDT in your account to start a game.",
        requiredBalance: 50,
      },
      403
    );
  }

  try {
    /*
     * ROYAL SLOTS
     */
    if (game === "slots") {
      if (action !== "spin") {
        return response(
          { error: "Invalid Slots action." },
          400
        );
      }

      const bet = validAmount(body.bet);

      if (!bet) {
        return response(
          {
            error:
              "Bet must be between 1 and 1,000 USDT, with up to two decimal places.",
          },
          400
        );
      }

      const symbols = [
        "🍒",
        "🍋",
        "🔔",
        "🍇",
        "💎",
        "👑",
      ];

      const reels = Array.from(
        { length: 3 },
        () =>
          symbols[
            Math.floor(Math.random() * symbols.length)
          ]
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

      const result = await prisma.$transaction(
        async (tx) => {
          // Debit only if the user has enough funds.
          const debit = await tx.user.updateMany({
            where: {
              id: user.id,
              balance: { gte: bet },
            },
            data: {
              balance: { decrement: bet },
            },
          });

          if (!debit.count) {
            throw new Error("INSUFFICIENT");
          }

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
              game: "slots",
              betAmount: bet,
              payout,
              result: JSON.stringify({
                reels,
                multiplier,
              }),
            },
          });

          const freshUser =
            await tx.user.findUniqueOrThrow({
              where: { id: user.id },
              select: { balance: true },
            });

          return {
            balance: Number(freshUser.balance),
          };
        }
      );

      return response({
        reels,
        multiplier,
        payout,
        net,
        balance: result.balance,
      });
    }

    /*
     * AVIATOR
     */
    if (game === "aviator") {
      if (action === "start") {
        const bet = validAmount(body.bet);

        if (!bet) {
          return response(
            { error: "Invalid bet amount." },
            400
          );
        }

        const existingRound =
          await prisma.activeGame.findFirst({
            where: {
              userId: user.id,
              game: "aviator",
              status: "ACTIVE",
            },
            orderBy: { createdAt: "desc" },
          });

        if (existingRound) {
          return response(
            {
              error:
                "You already have an active Aviator round.",
            },
            409
          );
        }

        const crashAt = generateCrashMultiplier();

        const created = await prisma.$transaction(
          async (tx) => {
            const debit = await tx.user.updateMany({
              where: {
                id: user.id,
                balance: { gte: bet },
              },
              data: {
                balance: { decrement: bet },
              },
            });

            if (!debit.count) {
              throw new Error("INSUFFICIENT");
            }

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

            const freshUser =
              await tx.user.findUniqueOrThrow({
                where: { id: user.id },
                select: { balance: true },
              });

            return {
              roundId: round.id,
              balance: Number(freshUser.balance),
            };
          }
        );

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
          return response(
            { error: "No active Aviator round." },
            409
          );
        }

        const state = round.state as State;

        const elapsed = Math.max(
          0,
          Date.now() - Number(state.startedAt)
        );

        const currentMultiplier = Math.max(
          1,
          Math.floor(
            Math.exp(elapsed / 5000) * 100
          ) / 100
        );

        // The server, not the browser, decides whether
        // the requested cash-out beat the crash point.
        if (currentMultiplier >= Number(state.crashAt)) {
          await prisma.$transaction([
            prisma.activeGame.update({
              where: { id: round.id },
              data: { status: "LOST" },
            }),

            prisma.gameHistory.create({
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
            }),
          ]);

          const freshUser =
            await prisma.user.findUniqueOrThrow({
              where: { id: user.id },
              select: { balance: true },
            });

          return response({
            crashed: true,
            crashAt: state.crashAt,
            balance: Number(freshUser.balance),
          });
        }

        const multiplier = currentMultiplier;

        const payout = money(
          Number(state.bet) * multiplier
        );

        const newBalance = await prisma.$transaction(
          async (tx) => {
            const finished =
              await tx.activeGame.updateMany({
                where: {
                  id: round.id,
                  status: "ACTIVE",
                },
                data: {
                  status: "CASHED_OUT",
                },
              });

            if (!finished.count) {
              throw new Error("ROUND_FINISHED");
            }

            await tx.user.update({
              where: { id: user.id },
              data: {
                balance: { increment: payout },
              },
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

            const freshUser =
              await tx.user.findUniqueOrThrow({
                where: { id: user.id },
                select: { balance: true },
              });

            return Number(freshUser.balance);
          }
        );

        return response({
          crashed: false,
          multiplier,
          payout,
          balance: newBalance,
        });
      }

      return response(
        { error: "Invalid Aviator action." },
        400
      );
    }

    /*
     * ROYAL MINES
     */
    if (game === "mines") {
      if (action === "start") {
        const bet = validAmount(body.bet);
        const mineCount = Number(body.mineCount);

        if (!bet) {
          return response(
            { error: "Invalid bet amount." },
            400
          );
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

        const existingRound =
          await prisma.activeGame.findFirst({
            where: {
              userId: user.id,
              game: "mines",
              status: "ACTIVE",
            },
            orderBy: { createdAt: "desc" },
          });

        if (existingRound) {
          return response(
            {
              error:
                "You already have an active Mines round.",
            },
            409
          );
        }

        const mines = Array.from(
          { length: 25 },
          (_, index) => index
        )
          .sort(() => Math.random() - 0.5)
          .slice(0, mineCount);

        const created = await prisma.$transaction(
          async (tx) => {
            const debit = await tx.user.updateMany({
              where: {
                id: user.id,
                balance: { gte: bet },
              },
              data: {
                balance: { decrement: bet },
              },
            });

            if (!debit.count) {
              throw new Error("INSUFFICIENT");
            }

            const round = await tx.activeGame.create({
              data: {
                userId: user.id,
                game: "mines",
                state: {
                  bet,
                  mineCount,
                  mines,
                  picks: [],
                } as Prisma.InputJsonValue,
              },
            });

            const freshUser =
              await tx.user.findUniqueOrThrow({
                where: { id: user.id },
                select: { balance: true },
              });

            return {
              roundId: round.id,
              balance: Number(freshUser.balance),
            };
          }
        );

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
        return response(
          { error: "No active Mines round." },
          409
        );
      }

      const state = round.state as State;

      const picks: number[] = Array.isArray(state.picks)
        ? state.picks
        : [];

      if (action === "reveal") {
        const tile = Number(body.tile);

        if (
          !Number.isInteger(tile) ||
          tile < 0 ||
          tile > 24 ||
          picks.includes(tile)
        ) {
          return response(
            { error: "Choose an unrevealed tile." },
            400
          );
        }

        if ((state.mines as number[]).includes(tile)) {
          await prisma.$transaction([
            prisma.activeGame.update({
              where: { id: round.id },
              data: { status: "LOST" },
            }),

            prisma.gameHistory.create({
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
            }),
          ]);

          const freshUser =
            await prisma.user.findUniqueOrThrow({
              where: { id: user.id },
              select: { balance: true },
            });

          return response({
            hitMine: true,
            tile,
            mines: state.mines,
            picks,
            balance: Number(freshUser.balance),
          });
        }

        const nextPicks = [...picks, tile];

        const multiplier = calculateMinesMultiplier(
          nextPicks.length,
          Number(state.mineCount)
        );

        await prisma.activeGame.update({
          where: { id: round.id },
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
          potentialPayout: money(
            Number(state.bet) * multiplier
          ),
        });
      }

      if (action === "cashout") {
        if (!picks.length) {
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

        const payout = money(
          Number(state.bet) * multiplier
        );

        const newBalance = await prisma.$transaction(
          async (tx) => {
            const finished =
              await tx.activeGame.updateMany({
                where: {
                  id: round.id,
                  status: "ACTIVE",
                },
                data: {
                  status: "CASHED_OUT",
                },
              });

            if (!finished.count) {
              throw new Error("ROUND_FINISHED");
            }

            await tx.user.update({
              where: { id: user.id },
              data: {
                balance: { increment: payout },
              },
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

            const freshUser =
              await tx.user.findUniqueOrThrow({
                where: { id: user.id },
                select: { balance: true },
              });

            return Number(freshUser.balance);
          }
        );

        return response({
          payout,
          multiplier,
          balance: newBalance,
          mines: state.mines,
          picks,
          cashedOut: true,
        });
      }

      return response(
        { error: "Invalid Mines action." },
        400
      );
    }
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
          "Could not process this game action. Check your connection and balance before retrying.",
      },
      500
    );
  }

  return response({ error: "Invalid game action." }, 400);
}