import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/auth";


export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return Response.json(
        { message: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      return Response.json(
        { message: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    await createUserSession(user.id);

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
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