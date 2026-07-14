import { NextResponse } from "next/server";

import { hashAccountToken } from "@/lib/accountTokens";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?status=invalid", request.url));
  }

  const tokenHash = hashAccountToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (
    !verificationToken ||
    verificationToken.usedAt ||
    verificationToken.expiresAt < new Date()
  ) {
    return NextResponse.redirect(new URL("/verify-email?status=invalid", request.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
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

  return NextResponse.redirect(new URL("/verify-email?status=success", request.url));
}