import { NextResponse } from "next/server";
import { z } from "zod";

import { createPasswordResetToken } from "@/lib/accountTokens";
import { sendPasswordResetLink } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Некорректный email")
    .transform((email) => email.toLowerCase()),
});

const neutralResponse = NextResponse.json({
  message: "Если email есть в системе, ссылка восстановления будет отправлена.",
});

export async function POST(request: Request) {
  const rateLimitResult = rateLimit({
    key: `forgot-password:${getClientIp(request)}`,
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
    const data = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return neutralResponse;
    }

    const resetToken = await createPasswordResetToken(user.id);
    await sendPasswordResetLink({
      to: user.email,
      token: resetToken.token,
    });

    return neutralResponse;
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