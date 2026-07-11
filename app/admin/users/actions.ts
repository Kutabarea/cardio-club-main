"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roles = ["USER", "ADMIN"];
const plans = ["FREE", "PREMIUM_MONTH", "PREMIUM_YEAR"];
const statuses = ["ACTIVE", "CANCELED", "EXPIRED"];

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

function getRedirectPath(formData: FormData) {
  const redirectPath = String(formData.get("redirectPath") ?? "").trim();

  if (redirectPath.startsWith("/admin/users")) {
    return redirectPath;
  }

  return "/admin/users";
}

function redirectWithMessage(pathname: string, type: "error" | "success", code: string) {
  const separator = pathname.includes("?") ? "&" : "?";

  redirect(`${pathname}${separator}${type}=${code}`);
}

function revalidateUsersPages() {
  revalidatePath("/admin/users");
  revalidatePath("/profile/subscription");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/search");
}

function parseEndsAt(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T23:59:59.999Z`);

  if (Number.isNaN(date.getTime())) {
    return "INVALID_DATE";
  }

  return date;
}

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const redirectPath = getRedirectPath(formData);
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId) {
    redirectWithMessage(redirectPath, "error", "user-id-required");
  }

  if (!roles.includes(role)) {
    redirectWithMessage(redirectPath, "error", "invalid-role");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!targetUser) {
    redirectWithMessage(redirectPath, "error", "user-not-found");
  }

  if (currentUser.id === userId && role !== "ADMIN") {
    redirectWithMessage(redirectPath, "error", "self-admin-remove");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  revalidateUsersPages();

  redirectWithMessage(redirectPath, "success", "role-updated");
}

export async function updateUserSubscriptionAction(formData: FormData) {
  await requireAdmin();

  const redirectPath = getRedirectPath(formData);
  const userId = String(formData.get("userId") ?? "").trim();
  const plan = String(formData.get("plan") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const endsAtInput = String(formData.get("endsAt") ?? "").trim();

  if (!userId) {
    redirectWithMessage(redirectPath, "error", "user-id-required");
  }

  if (!plans.includes(plan)) {
    redirectWithMessage(redirectPath, "error", "invalid-plan");
  }

  if (!statuses.includes(status)) {
    redirectWithMessage(redirectPath, "error", "invalid-status");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    redirectWithMessage(redirectPath, "error", "user-not-found");
  }

  const endsAt = parseEndsAt(endsAtInput);

  if (endsAt === "INVALID_DATE") {
    redirectWithMessage(redirectPath, "error", "invalid-date");
  }

  const currentSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (currentSubscription) {
    await prisma.subscription.update({
      where: {
        id: currentSubscription.id,
      },
      data: {
        plan,
        status,
        endsAt,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        plan,
        status,
        endsAt,
      },
    });
  }

  revalidateUsersPages();

  redirectWithMessage(redirectPath, "success", "subscription-updated");
}