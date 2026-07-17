import { redirect } from "next/navigation";

import ProfileSubscription from "../../components/ProfileSubscription";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  expireEndedSubscriptionsForUser,
  getCurrentSubscription,
  getPlanLabel,
  hasActivePremiumAccess,
} from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

type SubscribePageProps = {
  searchParams?: Promise<{
    subscription?: string;
  }>;
};

function formatDate(value?: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function SubscribePage({
  searchParams,
}: SubscribePageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  await expireEndedSubscriptionsForUser(currentUser.id);

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    include: {
      subscriptions: {
        include: {
          planRecord: {
            select: {
              code: true,
              title: true,
              isPremium: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentSubscription = getCurrentSubscription(user.subscriptions);
  const hasPremium = hasActivePremiumAccess(user.subscriptions);
  const endsAtText = hasPremium
    ? formatDate(currentSubscription?.endsAt)
    : null;

  return (
    <ProfileSubscription
      status={hasPremium ? "active" : "inactive"}
      endsAtText={endsAtText}
      planLabel={getPlanLabel(
        currentSubscription?.plan,
        currentSubscription?.planRecord?.title,
      )}
      message={
        resolvedSearchParams.subscription === "activated"
          ? "Premium-подписка активирована в demo-режиме."
          : null
      }
    />
  );
}