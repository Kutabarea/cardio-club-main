import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
  name: z.string().min(2, "Имя должно быть минимум 2 символа").max(64).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return Response.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
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
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Ошибка валидации",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return Response.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}