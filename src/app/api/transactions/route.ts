import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  amount: z
    .number()
    .finite()
    .positive()
    .max(1000000),
  note: z.string().trim().max(300).optional(),
});

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Please log in.", 401);
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      balance: Number(user.balance),
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        status: transaction.status,
        note: transaction.note,
        reference: transaction.reference,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    console.error("Transaction history error:", error);

    return errorResponse(
      "Unable to load your transaction history. Please try again.",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Please log in.", 401);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse("The request contains invalid JSON.", 400);
    }

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Enter a valid request type and an amount greater than zero, up to 1,000,000.",
        400
      );
    }

    const { type, amount, note } = parsed.data;

    if (type === "WITHDRAWAL") {
      const balance = Number(user.balance);

      if (!Number.isFinite(balance) || balance < amount) {
        return errorResponse(
          "Your available USDT balance is too low for this request.",
          400
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type,
        amount,
        status: "PENDING",
        note: note || null,
      },
    });

    return NextResponse.json(
      {
        message:
          "Request submitted. Contact the RoyalBet admin on Telegram and wait for review.",
        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: Number(transaction.amount),
          status: transaction.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction request error:", error);

    return errorResponse(
      "Unable to submit your transaction request. Please try again.",
      500
    );
  }
}