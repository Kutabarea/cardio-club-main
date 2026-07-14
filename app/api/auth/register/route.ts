import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { createUserSession } from "@/lib/auth";
import { createEmailVerificationToken } from "@/lib/accountTokens";
import { sendEmailVerificationLink } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Некорректный email")
    .transform((email) => email.toLowerCase()),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
  name: z
    .string()
    .trim()
    .min(2, "Имя должно быть минимум 2 символа")
    .max(64)
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  const rateLimitResult = rateLimit({
    key: `register:${getClientIp(request)}`,
    limit: 3,
    windowMs: 600000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        message: "Слишком много попыток регистрации. Попробуйте позже.",
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
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Регистрация не выполнена. Проверьте данные и попробуйте снова." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name || null,
        profile: {
          create: {},
        },
        subscriptions: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const verificationToken = await createEmailVerificationToken(user.id);
    await sendEmailVerificationLink({
      to: user.email,
      token: verificationToken.token,
    });

    await createUserSession(user.id);

    return NextResponse.json(
      {
        user,
        message: "Аккаунт создан. Ссылка подтверждения email отправлена.",
      },
      { status: 201 },
    );
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