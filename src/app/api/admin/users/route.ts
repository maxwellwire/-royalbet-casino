import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return errorResponse("Admin access required.", 403);
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
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
  } catch (error) {
    console.error("Admin user list error:", error);
    return errorResponse("Unable to load registered users.", 500);
  }
}

const creditSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().finite().positive().max(1_000_000),
  note: z.string().trim().max(300).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return errorResponse("Admin access required.", 403);
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = creditSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message ??
          "Enter a valid user and funding amount.",
        400
      );
    }

    const { userId, amount, note } = parsed.data;

    // The database stores balances to two decimal places.
    if (Math.round(amount * 100) !== amount * 100) {
      return errorResponse(
        "The funding amount cannot have more than two decimal places.",
        400
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!targetUser) {
      return errorResponse("The selected user does not exist.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUser.id },
        data: {
          balance: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId: targetUser.id,
          type: "ADMIN_CREDIT",
          amount,
          status: "APPROVED",
          note: note || "Admin account funding",
          reference: `ADMIN-${crypto.randomUUID()}`,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });
    });

    return NextResponse.json(
      {
        message: `${amount.toFixed(2)} USDT credited to ${targetUser.email}.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin account funding error:", error);
    return errorResponse("Unable to fund this account. Please try again.", 500);
  }
}