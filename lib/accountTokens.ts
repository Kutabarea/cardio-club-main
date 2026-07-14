import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_TOKEN_TTL_HOURS = 24;
const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

export function createAccountToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashAccountToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function addHours(date: Date, hours: number) {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
}

function addMinutes(date: Date, minutes: number) {
  const nextDate = new Date(date);
  nextDate.setMinutes(nextDate.getMinutes() + minutes);
  return nextDate;
}

export async function createEmailVerificationToken(userId: string) {
  const token = createAccountToken();
  const tokenHash = hashAccountToken(token);
  const expiresAt = addHours(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_HOURS);

  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function createPasswordResetToken(userId: string) {
  const token = createAccountToken();
  const tokenHash = hashAccountToken(token);
  const expiresAt = addMinutes(new Date(), PASSWORD_RESET_TOKEN_TTL_MINUTES);

  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function cleanupExpiredAccountTokens() {
  const now = new Date();

  await prisma.emailVerificationToken.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });
}