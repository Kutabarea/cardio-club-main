import { premiumPlanCodes } from "@/lib/planCatalog";
import { prisma } from "@/lib/prisma";

export type SubscriptionLike = {
  id?: string;
  plan: string;
  planId?: string | null;
  planRecord?: {
    code: string;
    title?: string | null;
    isPremium: boolean;
  } | null;
  status: string;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export const premiumPlans = [...premiumPlanCodes];

export function getSubscriptionPlanCode(
  subscription?: SubscriptionLike | null,
) {
  return subscription?.planRecord?.code || subscription?.plan || null;
}

export function isPremiumPlan(plan?: string | null) {
  return Boolean(plan && premiumPlans.includes(plan));
}

export function isPremiumSubscription(subscription: SubscriptionLike) {
  if (subscription.planRecord) {
    return subscription.planRecord.isPremium;
  }

  return isPremiumPlan(getSubscriptionPlanCode(subscription));
}

export function getPlanLabel(
  plan?: string | null,
  storedTitle?: string | null,
) {
  if (storedTitle) return storedTitle;
  if (plan === "PREMIUM_MONTH") return "Premium на месяц";
  if (plan === "PREMIUM_3_MONTH") return "Premium на 3 месяца";
  if (plan === "PREMIUM_YEAR") return "Premium на год";
  if (plan === "FREE") return "Бесплатный";

  return plan || "Неизвестный план";
}

export function getStatusLabel(status?: string | null) {
  if (status === "PENDING") return "Ожидает оплаты";
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

export function isSubscriptionExpired(
  subscription: SubscriptionLike,
  now = new Date(),
) {
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
      isPremiumSubscription(subscription) &&
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
      isPremiumSubscription(subscription) &&
      !isSubscriptionExpired(subscription, now)
    );
  });

  if (activePremium) return activePremium;

  const activeFree = subscriptions.find((subscription) => {
    return (
      subscription.status === "ACTIVE" &&
      getSubscriptionPlanCode(subscription) === "FREE"
    );
  });

  if (activeFree) return activeFree;

  return subscriptions[0] ?? null;
}

export function getSubscriptionDaysLeft(
  subscription: SubscriptionLike | null,
) {
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
        in: premiumPlans,
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
        in: premiumPlans,
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