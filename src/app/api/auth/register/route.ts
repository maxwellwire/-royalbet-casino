import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),

  email: z.string().trim().email().max(254),

  password: z.string().min(12).max(128)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Enter a valid username, email, and password of at least 12 characters."
        },
        { status: 400 }
      );
    }

    const username = parsed.data.username;
    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      },
      select: {
        id: true
      }
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Username or email is already in use."
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(
      parsed.data.password,
      12
    );

    const configuredAdminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const role =
      configuredAdminEmail &&
      email === configuredAdminEmail
        ? "ADMIN"
        : "USER";

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        demoCredits: 1000
      }
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          demoCredits: user.demoCredits,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create account. Please try again."
      },
      { status: 500 }
    );
  }
}