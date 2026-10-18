import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentUser();

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      balance: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      ...user,
      balance: Number(user.balance),
    })),
  });
}

const creditSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive().max(1000000),
  note: z.string().trim().min(3).max(300),
});

export async function POST(request: Request) {
  const admin = await getCurrentUser();

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  const parsed = creditSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid user, positive amount, and reason." },
      { status: 400 }
    );
  }

  const { userId, amount, note } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "GIVEAWAY",
          amount,
          status: "APPROVED",
          note,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });
    });

    return NextResponse.json(
      { message: "USDT giveaway reward credited and recorded." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Giveaway credit error:", error);

    return NextResponse.json(
      { error: "Unable to credit this user." },
      { status: 400 }
    );
  }
}