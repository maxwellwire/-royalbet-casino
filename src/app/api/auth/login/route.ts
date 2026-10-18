import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !(await bcrypt.compare(parsed.data.password, user.passwordHash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const configuredAdmin =
      process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const signedInUser =
      configuredAdmin &&
      email === configuredAdmin &&
      user.role !== "ADMIN"
        ? await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          })
        : user;

    await createSession(signedInUser.id);

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: signedInUser.id,
        username: signedInUser.username,
        email: signedInUser.email,
        balance: Number(signedInUser.balance),
        role: signedInUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Unable to log in. Please try again." },
      { status: 500 }
    );
  }
}