import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),

  amount: z.coerce
    .number()
    .finite("Enter a valid amount.")
    .positive("Amount must be greater than zero.")
    .max(1_000_000, "The maximum request is 1,000,000 USDT."),

  note: z.preprocess(
    (value) => {
      if (value === undefined || value === null) {
        return "";
      }

      if (typeof value !== "string") {
        return value;
      }

      return value.trim();
    },
    z.string().max(300, "Your note must be 300 characters or fewer.")
  ),
});

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Please log in to continue.", 401);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
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
      "Unable to load transaction history. Please try again.",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Please log in to continue.", 401);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid request. Please refresh the page and try again.",
        400
      );
    }

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      return errorResponse(
        firstIssue?.message ?? "Please check your transaction details.",
        400
      );
    }

    const { type, amount, note } = parsed.data;

    if (type === "WITHDRAWAL") {
      const balance = Number(user.balance);

      if (!Number.isFinite(balance) || balance < amount) {
        return errorResponse(
          "Your available USDT balance is insufficient for this withdrawal request.",
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
          "Your request has been submitted for administrator review. Contact RoyalBet Payments on Telegram for assistance.",

        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: Number(transaction.amount),
          status: transaction.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Transaction request error:", error);

    return errorResponse(
      "Unable to submit your request right now. Please try again.",
      500
    );
  }
}