import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_CODE_TTL_MINUTES = 15;
const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

export function createAccountToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashAccountToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createEmailVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function normalizeEmailVerificationCode(code: string) {
  return code.replace(/\D/g, "").slice(0, 6);
}

export function hashEmailVerificationCode(userId: string, code: string) {
  const normalizedCode = normalizeEmailVerificationCode(code);

  return crypto
    .createHash("sha256")
    .update(`${userId}:${normalizedCode}`)
    .digest("hex");
}

function addMinutes(date: Date, minutes: number) {
  const nextDate = new Date(date);
  nextDate.setMinutes(nextDate.getMinutes() + minutes);
  return nextDate;
}

export async function createEmailVerificationCodeForUser(userId: string) {
  const code = createEmailVerificationCode();
  const tokenHash = hashEmailVerificationCode(userId, code);
  const expiresAt = addMinutes(new Date(), EMAIL_VERIFICATION_CODE_TTL_MINUTES);

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
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
    code,
    expiresAt,
  };
}

/**
 * Backward-compatible export. New code should use createEmailVerificationCodeForUser.
 */
export async function createEmailVerificationToken(userId: string) {
  const result = await createEmailVerificationCodeForUser(userId);

  return {
    token: result.code,
    expiresAt: result.expiresAt,
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