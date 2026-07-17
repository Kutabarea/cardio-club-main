"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  isPremiumPlanCode,
  premiumPlanCodes,
} from "@/lib/planCatalog";
import { prisma } from "@/lib/prisma";

function addDaysUtc(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

export async function activateMockPremiumSubscriptionAction(
  formData: FormData,
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const planCode = String(formData.get("plan") ?? "").trim();

  if (!isPremiumPlanCode(planCode)) {
    redirect("/profile/subscription?subscription=invalid-plan");
  }

  const selectedPlan = await prisma.plan.findUnique({
    where: {
      code: planCode,
    },
  });

  if (
    !selectedPlan ||
    !selectedPlan.isActive ||
    !selectedPlan.isPremium ||
    !selectedPlan.durationDays
  ) {
    redirect("/profile/subscription?subscription=plan-unavailable");
  }

  const startsAt = new Date();
  const endsAt = addDaysUtc(startsAt, selectedPlan.durationDays);
  const mockPaymentId = randomUUID();

  await prisma.$transaction(async (transaction) => {
    await transaction.subscription.updateMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
        plan: {
          in: [...premiumPlanCodes],
        },
      },
      data: {
        status: "CANCELED",
        canceledAt: startsAt,
      },
    });

    const subscription = await transaction.subscription.create({
      data: {
        userId: user.id,
        plan: selectedPlan.code,
        planId: selectedPlan.id,
        status: "ACTIVE",
        startsAt,
        endsAt,
        provider: "MOCK",
      },
    });

    await transaction.payment.create({
      data: {
        userId: user.id,
        planId: selectedPlan.id,
        subscriptionId: subscription.id,
        provider: "MOCK",
        providerPaymentId: `mock_${mockPaymentId}`,
        idempotencyKey: `mock:${user.id}:${mockPaymentId}`,
        status: "SUCCEEDED",
        amountMinor: selectedPlan.priceMinor,
        currency: selectedPlan.currency,
        paidAt: startsAt,
      },
    });
  });

  revalidatePath("/profile/subscription");
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/videocourses");

  redirect("/profile/subscription?subscription=activated");
}