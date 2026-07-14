import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { hashAccountToken } from "@/lib/accountTokens";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resetPasswordSchema = z.object({
  token: z.string().min(32, "Некорректный токен"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
});

export async function POST(request: Request) {
  const rateLimitResult = rateLimit({
    key: `reset-password:${getClientIp(request)}`,
    limit: 5,
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

  try {
    const body = await request.json();
    const data = resetPasswordSchema.parse(body);
    const tokenHash = hashAccountToken(data.token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { message: "Ссылка восстановления недействительна или устарела." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),
      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.session.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Пароль обновлён. Войдите заново.",
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