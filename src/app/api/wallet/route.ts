import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const transactionSchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),

  amount: z.coerce
    .number()
    .finite()
    .positive()
    .max(1_000_000),

  note: z.preprocess(
    (value) => {
      if (value == null) return "";
      if (typeof value !== "string") return value;
      return value.trim();
    },
    z.string().max(300)
  ),
});

function respond(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return respond("Please log in to continue.", 401);
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
    console.error("Wallet history error:", error);

    return respond(
      "Unable to load wallet history. Please try again.",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return respond("Please log in to continue.", 401);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return respond("Invalid request data.", 400);
    }

    const result = transactionSchema.safeParse(body);

    if (!result.success) {
      return respond(
        result.error.issues[0]?.message ??
          "Please enter a valid amount and transaction type.",
        400
      );
    }

    const { type, amount, note } = result.data;

    if (type === "WITHDRAWAL") {
      const balance = Number(user.balance);

      if (!Number.isFinite(balance) || balance < amount) {
        return respond(
          "Your available balance is insufficient for this withdrawal.",
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
          "Your request has been submitted for administrator review.",
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
    console.error("Wallet transaction error:", error);

    return respond(
      "Unable to submit your request. Please try again.",
      500
    );
  }
}