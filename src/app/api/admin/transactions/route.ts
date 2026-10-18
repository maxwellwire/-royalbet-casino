import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function adminOnly() {
  const user = await getCurrentUser();

  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  const admin = await adminOnly();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  const transactions = await prisma.transaction.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          balance: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      userId: transaction.userId,
      username: transaction.user.username,
      email: transaction.user.email,
      balance: Number(transaction.user.balance),
      type: transaction.type,
      amount: Number(transaction.amount),
      status: transaction.status,
      note: transaction.note,
      createdAt: transaction.createdAt,
    })),
  });
}

const actionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(request: Request) {
  const admin = await adminOnly();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  const parsed = actionSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { id, action } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.transaction.findUnique({
        where: { id },
      });

      if (!item) throw new Error("NOT_FOUND");

      if (item.status !== "PENDING") {
        throw new Error("ALREADY_REVIEWED");
      }

      if (action === "APPROVE" && item.type === "DEPOSIT") {
        await tx.user.update({
          where: { id: item.userId },
          data: {
            balance: { increment: item.amount },
          },
        });
      }

      if (action === "APPROVE" && item.type === "WITHDRAWAL") {
        const debit = await tx.user.updateMany({
          where: {
            id: item.userId,
            balance: { gte: item.amount },
          },
          data: {
            balance: { decrement: item.amount },
          },
        });

        if (debit.count !== 1) {
          throw new Error("INSUFFICIENT_BALANCE");
        }
      }

      return tx.transaction.update({
        where: { id },
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: `Request ${result.status.toLowerCase()}.`,
      status: result.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ERROR";

    const mapped: Record<string, string> = {
      NOT_FOUND: "Request not found.",
      ALREADY_REVIEWED: "This request has already been reviewed.",
      INSUFFICIENT_BALANCE:
        "User no longer has enough available balance to approve this withdrawal.",
    };

    return NextResponse.json(
      { error: mapped[message] || "Unable to review request." },
      { status: message in mapped ? 400 : 500 }
    );
  }
}