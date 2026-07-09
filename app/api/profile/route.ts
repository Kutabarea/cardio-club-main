import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  phone: z.string().max(32).optional(),
  city: z.string().max(64).optional(),
  bio: z.string().max(500).optional(),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { message: "Пользователь не авторизован" },
      { status: 401 },
    );
  }

  return Response.json({ user });
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json(
      { message: "Пользователь не авторизован" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: data.name,
        profile: {
          upsert: {
            create: {
              phone: data.phone,
              city: data.city,
              bio: data.bio,
            },
            update: {
              phone: data.phone,
              city: data.city,
              bio: data.bio,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profile: true,
        subscriptions: true,
      },
    });

    return Response.json({ user: updatedUser });
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