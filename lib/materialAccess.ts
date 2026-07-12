import { getCurrentUser } from "@/lib/auth";
import {
  hasActivePremiumAccess,
  type SubscriptionLike,
} from "@/lib/subscriptions";

export type PremiumMaterialLike = {
  isPremium: boolean;
};

export type PremiumAccessState = {
  isAuthenticated: boolean;
  hasPremium: boolean;
};

export type MaterialAccessState = PremiumAccessState & {
  isPremiumMaterial: boolean;
  canRead: boolean;
  reason: "PUBLIC" | "PREMIUM_ACTIVE" | "LOGIN_REQUIRED" | "PREMIUM_REQUIRED";
};

export function getPremiumAccessStateFromSubscriptions(
  subscriptions: SubscriptionLike[] | null | undefined,
): PremiumAccessState {
  return {
    isAuthenticated: Boolean(subscriptions),
    hasPremium: hasActivePremiumAccess(subscriptions),
  };
}

export function getMaterialAccessState(
  material: PremiumMaterialLike,
  access: PremiumAccessState,
): MaterialAccessState {
  if (!material.isPremium) {
    return {
      ...access,
      isPremiumMaterial: false,
      canRead: true,
      reason: "PUBLIC",
    };
  }

  if (access.hasPremium) {
    return {
      ...access,
      isPremiumMaterial: true,
      canRead: true,
      reason: "PREMIUM_ACTIVE",
    };
  }

  if (!access.isAuthenticated) {
    return {
      ...access,
      isPremiumMaterial: true,
      canRead: false,
      reason: "LOGIN_REQUIRED",
    };
  }

  return {
    ...access,
    isPremiumMaterial: true,
    canRead: false,
    reason: "PREMIUM_REQUIRED",
  };
}

export async function getCurrentPremiumAccessState(): Promise<PremiumAccessState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      isAuthenticated: false,
      hasPremium: false,
    };
  }

  return {
    isAuthenticated: true,
    hasPremium: hasActivePremiumAccess(user.subscriptions),
  };
}

export async function getCurrentMaterialAccessState(
  material: PremiumMaterialLike,
) {
  const access = await getCurrentPremiumAccessState();

  return getMaterialAccessState(material, access);
}

export function getPremiumAccessMessage(access: MaterialAccessState) {
  if (access.reason === "PUBLIC") {
    return "Материал доступен всем пользователям.";
  }

  if (access.reason === "PREMIUM_ACTIVE") {
    return "Premium-доступ активен.";
  }

  if (access.reason === "LOGIN_REQUIRED") {
    return "Войдите в аккаунт, чтобы оформить Premium-доступ.";
  }

  return "Материал доступен только по Premium-подписке.";
}