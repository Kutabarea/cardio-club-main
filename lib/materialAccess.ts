import type { Prisma } from "@prisma/client";

import {
  hasActivePremiumAccess,
  type SubscriptionLike,
} from "@/lib/subscriptions";

export type PremiumMaterialLike = {
  isPremium: boolean;
  isPublished?: boolean;
};

export type MaterialViewerUserLike = {
  role?: string | null;
  subscriptions?: SubscriptionLike[] | null;
} | null | undefined;

export type PremiumAccessState = {
  isAuthenticated: boolean;
  hasPremium: boolean;
  isAdmin?: boolean;
};

export type MaterialAccessMode = "PUBLIC" | "ADMIN_PREVIEW";

export type MaterialAccessReason =
  | "PUBLIC"
  | "PREMIUM_ACTIVE"
  | "ADMIN"
  | "LOGIN_REQUIRED"
  | "PREMIUM_REQUIRED"
  | "UNPUBLISHED";

export type MaterialAccessState = {
  isAuthenticated: boolean;
  hasPremium: boolean;
  isAdmin: boolean;
  isPublished: boolean;
  isPremiumMaterial: boolean;
  canViewMetadata: boolean;
  canRead: boolean;
  canReadContent: boolean;
  canAccessProtectedMedia: boolean;
  reason: MaterialAccessReason;
};

const materialPublicSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  imageUrl: true,
  isPremium: true,
  isPublished: true,
  categoryId: true,
  ecgSectionId: true,
  sortOrder: true,
  category: {
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
    },
  },
  ecgSection: {
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      sortOrder: true,
    },
  },
} satisfies Prisma.MaterialSelect;

const materialProtectedSelect = {
  content: true,
  videoUrl: true,
} satisfies Prisma.MaterialSelect;

type PublicMaterialData = Prisma.MaterialGetPayload<{
  select: typeof materialPublicSelect;
}>;

export type AccessibleMaterial = PublicMaterialData & {
  content: string | null;
  videoUrl: string | null;
};

export type ResolvedMaterialAccess = {
  material: AccessibleMaterial;
  access: MaterialAccessState;
};

export function isSafeRouteSlug(value: string) {
  return (
    value.length >= 1 &&
    value.length <= 160 &&
    /^[\p{L}\p{N}](?:[\p{L}\p{N}_-]*[\p{L}\p{N}])?$/u.test(value)
  );
}

export function isSafeDatabaseId(value: string) {
  return value.length >= 8 && value.length <= 128 && /^[a-z0-9_-]+$/i.test(value);
}

export function getPremiumAccessStateFromSubscriptions(
  subscriptions: SubscriptionLike[] | null | undefined,
  isAdmin = false,
): PremiumAccessState {
  return {
    isAuthenticated: subscriptions !== null && subscriptions !== undefined,
    hasPremium: hasActivePremiumAccess(subscriptions),
    isAdmin,
  };
}

export function getPremiumAccessStateForUser(
  user: MaterialViewerUserLike,
): PremiumAccessState {
  if (!user) {
    return {
      isAuthenticated: false,
      hasPremium: false,
      isAdmin: false,
    };
  }

  return {
    isAuthenticated: true,
    hasPremium: hasActivePremiumAccess(user.subscriptions),
    isAdmin: user.role === "ADMIN",
  };
}

export function getMaterialAccessState(
  material: PremiumMaterialLike,
  viewer: PremiumAccessState,
  mode: MaterialAccessMode = "PUBLIC",
): MaterialAccessState {
  const isAdmin = Boolean(viewer.isAdmin);
  const isPublished = material.isPublished !== false;
  const isPremiumMaterial = material.isPremium;
  const canPreviewUnpublished = mode === "ADMIN_PREVIEW" && isAdmin;

  if (!isPublished && !canPreviewUnpublished) {
    return {
      isAuthenticated: viewer.isAuthenticated,
      hasPremium: viewer.hasPremium,
      isAdmin,
      isPublished,
      isPremiumMaterial,
      canViewMetadata: false,
      canRead: false,
      canReadContent: false,
      canAccessProtectedMedia: false,
      reason: "UNPUBLISHED",
    };
  }

  if (isAdmin) {
    return {
      isAuthenticated: viewer.isAuthenticated,
      hasPremium: viewer.hasPremium,
      isAdmin,
      isPublished,
      isPremiumMaterial,
      canViewMetadata: true,
      canRead: true,
      canReadContent: true,
      canAccessProtectedMedia: true,
      reason: "ADMIN",
    };
  }

  if (!isPremiumMaterial) {
    return {
      isAuthenticated: viewer.isAuthenticated,
      hasPremium: viewer.hasPremium,
      isAdmin,
      isPublished,
      isPremiumMaterial,
      canViewMetadata: true,
      canRead: true,
      canReadContent: true,
      canAccessProtectedMedia: true,
      reason: "PUBLIC",
    };
  }

  if (viewer.hasPremium) {
    return {
      isAuthenticated: viewer.isAuthenticated,
      hasPremium: viewer.hasPremium,
      isAdmin,
      isPublished,
      isPremiumMaterial,
      canViewMetadata: true,
      canRead: true,
      canReadContent: true,
      canAccessProtectedMedia: true,
      reason: "PREMIUM_ACTIVE",
    };
  }

  if (!viewer.isAuthenticated) {
    return {
      isAuthenticated: false,
      hasPremium: false,
      isAdmin,
      isPublished,
      isPremiumMaterial,
      canViewMetadata: true,
      canRead: false,
      canReadContent: false,
      canAccessProtectedMedia: false,
      reason: "LOGIN_REQUIRED",
    };
  }

  return {
    isAuthenticated: true,
    hasPremium: false,
    isAdmin,
    isPublished,
    isPremiumMaterial,
    canViewMetadata: true,
    canRead: false,
    canReadContent: false,
    canAccessProtectedMedia: false,
    reason: "PREMIUM_REQUIRED",
  };
}

export async function getCurrentPremiumAccessState(): Promise<PremiumAccessState> {
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();

  return getPremiumAccessStateForUser(user);
}

export async function getCurrentMaterialAccessState(
  material: PremiumMaterialLike,
  mode: MaterialAccessMode = "PUBLIC",
) {
  const viewer = await getCurrentPremiumAccessState();

  return getMaterialAccessState(material, viewer, mode);
}

type GetMaterialForViewerOptions = {
  where: Prisma.MaterialWhereInput;
  viewer: PremiumAccessState;
  mode?: MaterialAccessMode;
};

export async function getMaterialForViewer({
  where,
  viewer,
  mode = "PUBLIC",
}: GetMaterialForViewerOptions): Promise<ResolvedMaterialAccess | null> {
  const normalizedViewer: PremiumAccessState = {
    isAuthenticated: viewer.isAuthenticated,
    hasPremium: viewer.hasPremium,
    isAdmin: Boolean(viewer.isAdmin),
  };

  if (mode === "ADMIN_PREVIEW" && !normalizedViewer.isAdmin) {
    return null;
  }

  const { prisma } = await import("@/lib/prisma");
  const visibleWhere: Prisma.MaterialWhereInput =
    mode === "PUBLIC"
      ? {
          AND: [where, { isPublished: true }],
        }
      : where;

  const material = await prisma.material.findFirst({
    where: visibleWhere,
    select: materialPublicSelect,
  });

  if (!material) {
    return null;
  }

  const access = getMaterialAccessState(material, normalizedViewer, mode);

  if (!access.canViewMetadata) {
    return null;
  }

  let protectedData: {
    content: string | null;
    videoUrl: string | null;
  } | null = null;

  if (access.canReadContent || access.canAccessProtectedMedia) {
    const protectedWhere: Prisma.MaterialWhereInput = {
      id: material.id,
    };

    if (mode === "PUBLIC") {
      protectedWhere.isPublished = true;

      if (!normalizedViewer.isAdmin && !normalizedViewer.hasPremium) {
        protectedWhere.isPremium = false;
      }
    }

    protectedData = await prisma.material.findFirst({
      where: protectedWhere,
      select: materialProtectedSelect,
    });

    if (!protectedData) {
      return null;
    }
  }

  return {
    material: {
      ...material,
      content: access.canReadContent ? protectedData?.content ?? null : null,
      videoUrl: access.canAccessProtectedMedia ? protectedData?.videoUrl ?? null : null,
    },
    access,
  };
}

export async function getMaterialForCurrentViewer(
  options: Omit<GetMaterialForViewerOptions, "viewer">,
) {
  const viewer = await getCurrentPremiumAccessState();

  return getMaterialForViewer({
    ...options,
    viewer,
  });
}

export function getPremiumAccessMessage(access: MaterialAccessState) {
  if (access.reason === "PUBLIC") {
    return "Материал доступен всем пользователям.";
  }

  if (access.reason === "PREMIUM_ACTIVE") {
    return "Premium-доступ активен.";
  }

  if (access.reason === "ADMIN") {
    return "Материал доступен администратору.";
  }

  if (access.reason === "LOGIN_REQUIRED") {
    return "Войдите в аккаунт, чтобы оформить Premium-доступ.";
  }

  if (access.reason === "UNPUBLISHED") {
    return "Материал ещё не опубликован.";
  }

  return "Материал доступен только по Premium-подписке.";
}