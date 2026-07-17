import { NextResponse } from "next/server";

import { createEmailVerificationCodeForUser } from "@/lib/accountTokens";
import { getCurrentUser } from "@/lib/auth";
import { sendEmailVerificationCode } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rateLimitResult = rateLimit({
    key: `resend-verification:${getClientIp(request)}`,
    limit: 3,
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
    return NextResponse.json({ message: "Требуется вход." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Требуется вход." }, { status: 401 });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ message: "Email уже подтверждён." });
  }

  const verificationToken = await createEmailVerificationCodeForUser(user.id);
  await sendEmailVerificationCode({
    to: user.email,
    code: verificationToken.code,
  });

  return NextResponse.json({
    message: "Ссылка подтверждения отправлена.",
  });
}