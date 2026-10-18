import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  amount: z.number().positive().max(1000000),
  note: z.string().trim().max(300).optional(),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in." },
      { status: 401 }
    );
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
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in." },
      { status: 401 }
    );
  }

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid request type and amount." },
      { status: 400 }
    );
  }

  const { type, amount, note } = parsed.data;

  if (type === "WITHDRAWAL" && Number(user.balance) < amount) {
    return NextResponse.json(
      { error: "Your available USDT balance is too low for this request." },
      { status: 400 }
    );
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
}