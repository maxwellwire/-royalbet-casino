import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getAdmin() {
  const user = await getCurrentUser();

  return user?.role === "ADMIN" ? user : null;
}

// GET: List registered accounts for the admin dashboard.
export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return errorResponse("Admin access required.", 403);
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
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

    return errorResponse(
      "Unable to load registered users. Check the server logs.",
      500
    );
  }
}

const creditSchema = z.object({
  userId: z.string().trim().min(1, "Select a registered user."),

  amount: z.coerce
    .number()
    .finite("Enter a valid funding amount.")
    .positive("The amount must be greater than zero.")
    .max(1_000_000, "The maximum funding amount is 1,000,000 USDT."),

  note: z
    .string()
    .trim()
    .max(300, "The funding note cannot exceed 300 characters.")
    .optional()
    .default(""),
});

// POST: Credit USDT to a user's internal RoyalBet account balance.
// This does not transfer cryptocurrency on the blockchain.
export async function POST(request: Request) {
  try {
    // Only administrators can credit accounts.
    const admin = await getAdmin();

    if (!admin) {
      return errorResponse("Admin access required.", 403);
    }

    // Parse the incoming JSON safely.
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

    /*
     * Validate the amount to two decimal places.
     *
     * A small tolerance avoids rejecting legitimate amounts such as
     * 0.29 because of JavaScript floating-point representation.
     */
    const amountInCents = Math.round(amount * 100);

    if (
      !Number.isSafeInteger(amountInCents) ||
      Math.abs(amount * 100 - amountInCents) > 1e-8
    ) {
      return errorResponse(
        "The funding amount cannot have more than two decimal places.",
        400
      );
    }

    // Store the amount with exactly two decimal places.
    const amountDecimal = (amountInCents / 100).toFixed(2);

    // Confirm that the destination account exists.
    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!targetUser) {
      return errorResponse("The selected user does not exist.", 404);
    }

    const reference = `ADMIN-${randomUUID()}`;

    /*
     * Update the user's balance and create the transaction record
     * within the same database transaction.
     *
     * If either database operation fails, both operations are rolled back.
     */
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: {
          id: targetUser.id,
        },
        data: {
          balance: {
            increment: amountDecimal,
          },
        },
        select: {
          id: true,
          email: true,
          balance: true,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: targetUser.id,
          type: "ADMIN_CREDIT",
          amount: amountDecimal,
          status: "APPROVED",
          reference,
          note: note || "Admin account funding",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          reference: true,
          createdAt: true,
        },
      });

      return {
        user: updatedUser,
        transaction,
      };
    });

    console.info("Admin account credit completed:", {
      adminId: admin.id,
      userId: result.user.id,
      amount: amountDecimal,
      transactionId: result.transaction.id,
      reference,
    });

    return NextResponse.json(
      {
        message: `${amountDecimal} USDT credited to ${result.user.email}.`,

        user: {
          id: result.user.id,
          email: result.user.email,
          balance: Number(result.user.balance),
        },

        transaction: {
          ...result.transaction,
          amount: Number(result.transaction.amount),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Admin account funding error:", error);

    return errorResponse(
      "Account funding failed. Check the Vercel server logs for the exact cause.",
      500
    );
  }
}