import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(20),
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid username, email, and password of at least 6 characters." },
        { status: 400 }
      );
    }

    const username = parsed.data.username;
    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? "An account with this email already exists."
              : "This username is already taken.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const configuredAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role:
          configuredAdmin && email === configuredAdmin
            ? "ADMIN"
            : "USER",
        balance: 0,
      },
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: Number(user.balance),
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}