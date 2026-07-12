import { prisma } from "@/lib/prisma";

export type SubscriptionLike = {
  id?: string;
  plan: string;
  status: string;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export const premiumPlans = ["PREMIUM_MONTH", "PREMIUM_YEAR"];

export function isPremiumPlan(plan?: string | null) {
  return Boolean(plan && premiumPlans.includes(plan));
}

export function getPlanLabel(plan?: string | null) {
  if (plan === "PREMIUM_MONTH") return "Premium на месяц";
  if (plan === "PREMIUM_YEAR") return "Premium на год";
  if (plan === "FREE") return "Free";

  return plan || "Неизвестный план";
}

export function getStatusLabel(status?: string | null) {
  if (status === "ACTIVE") return "Активна";
  if (status === "CANCELED") return "Отменена";
  if (status === "EXPIRED") return "Истекла";

  return status || "Неизвестный статус";
}

function toDate(value?: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function isSubscriptionExpired(subscription: SubscriptionLike, now = new Date()) {
  const endsAt = toDate(subscription.endsAt);

  return Boolean(endsAt && endsAt.getTime() <= now.getTime());
}

export function hasActivePremiumAccess(
  subscriptions: SubscriptionLike[] | null | undefined,
  now = new Date(),
) {
  if (!subscriptions?.length) return false;

  return subscriptions.some((subscription) => {
    return (
      subscription.status === "ACTIVE" &&
      isPremiumPlan(subscription.plan) &&
      !isSubscriptionExpired(subscription, now)
    );
  });
}

export function getCurrentSubscription(
  subscriptions: SubscriptionLike[] | null | undefined,
) {
  if (!subscriptions?.length) return null;

  const now = new Date();

  const activePremium = subscriptions.find((subscription) => {
    return (
      subscription.status === "ACTIVE" &&
      isPremiumPlan(subscription.plan) &&
      !isSubscriptionExpired(subscription, now)
    );
  });

  if (activePremium) return activePremium;

  const activeFree = subscriptions.find((subscription) => {
    return subscription.status === "ACTIVE" && subscription.plan === "FREE";
  });

  if (activeFree) return activeFree;

  return subscriptions[0] ?? null;
}

export function getSubscriptionDaysLeft(subscription: SubscriptionLike | null) {
  if (!subscription?.endsAt) return null;

  const endsAt = toDate(subscription.endsAt);

  if (!endsAt) return null;

  const diff = endsAt.getTime() - Date.now();

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function expireEndedSubscriptions() {
  return prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      plan: {
        not: "FREE",
      },
      endsAt: {
        lt: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

export async function expireEndedSubscriptionsForUser(userId: string) {
  return prisma.subscription.updateMany({
    where: {
      userId,
      status: "ACTIVE",
      plan: {
        not: "FREE",
      },
      endsAt: {
        lt: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}