"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { premiumPlans } from "@/lib/subscriptions";

const mockPlanConfig = {
  PREMIUM_MONTH: {
    days: 30,
  },
  PREMIUM_3_MONTH: {
    days: 90,
  },
  PREMIUM_YEAR: {
    days: 365,
  },
} as const;

type MockPlan = keyof typeof mockPlanConfig;

function isMockPlan(value: string): value is MockPlan {
  return value in mockPlanConfig;
}

export async function activateMockPremiumSubscriptionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const plan = String(formData.get("plan") ?? "").trim();

  if (!isMockPlan(plan)) {
    redirect("/profile/subscription?subscription=invalid-plan");
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + mockPlanConfig[plan].days);

  await prisma.$transaction([
    prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
        plan: {
          in: premiumPlans,
        },
      },
      data: {
        status: "CANCELED",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        plan,
        status: "ACTIVE",
        startsAt,
        endsAt,
      },
    }),
  ]);

  revalidatePath("/profile/subscription");
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/videocourses");

  redirect("/profile/subscription?subscription=activated");
}