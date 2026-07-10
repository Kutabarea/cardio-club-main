"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function revalidateUsersPages() {
  revalidatePath("/admin/users");
  revalidatePath("/profile/subscription");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
}

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId) {
    redirect("/admin/users?error=user-id-required");
  }

  if (!["USER", "ADMIN"].includes(role)) {
    redirect("/admin/users?error=invalid-role");
  }

  if (currentUser.id === userId && role !== "ADMIN") {
    redirect("/admin/users?error=self-admin-remove");
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

  redirect("/admin/users?success=role-updated");
}

export async function updateUserSubscriptionAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const plan = String(formData.get("plan") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const endsAtInput = String(formData.get("endsAt") ?? "").trim();

  if (!userId) {
    redirect("/admin/users?error=user-id-required");
  }

  if (!["FREE", "PREMIUM_MONTH", "PREMIUM_YEAR"].includes(plan)) {
    redirect("/admin/users?error=invalid-plan");
  }

  if (!["ACTIVE", "CANCELED", "EXPIRED"].includes(status)) {
    redirect("/admin/users?error=invalid-status");
  }

  const endsAt = endsAtInput ? new Date(`${endsAtInput}T23:59:59.999Z`) : null;

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

  redirect("/admin/users?success=subscription-updated");
}