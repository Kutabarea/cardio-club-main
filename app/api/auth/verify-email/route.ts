import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hashEmailVerificationCode,
  normalizeEmailVerificationCode,
} from "@/lib/accountTokens";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const verifyEmailSchema = z.object({
  code: z
    .string()
    .transform((value) => normalizeEmailVerificationCode(value))
    .refine((value) => /^\d{6}$/.test(value), "Введите 6-значный код"),
});

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/verify-email", request.url));
}

export async function POST(request: Request) {
  const rateLimitResult = rateLimit({
    key: `verify-email:${getClientIp(request)}`,
    limit: 8,
    windowMs: 600000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        message: "Слишком много попыток. Попробуйте позже.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      },
    );
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Для подтверждения email нужно войти в аккаунт." },
      { status: 401 },
    );
  }

  if (currentUser.emailVerifiedAt) {
    return NextResponse.json({
      message: "Email уже подтверждён.",
      verified: true,
    });
  }

  try {
    const body = await request.json();
    const data = verifyEmailSchema.parse(body);
    const tokenHash = hashEmailVerificationCode(currentUser.id, data.code);

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
    });

    if (
      !verificationToken ||
      verificationToken.userId !== currentUser.id ||
      verificationToken.usedAt ||
      verificationToken.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { message: "Код неверный или устарел." },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.emailVerificationToken.update({
        where: {
          id: verificationToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      message: "Email подтверждён.",
      verified: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Ошибка валидации",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}