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

function getRedirectPath(formData: FormData) {
  const redirectPath = String(formData.get("redirectPath") ?? "").trim();

  if (redirectPath.startsWith("/admin/ecg-materials")) {
    return redirectPath;
  }

  return "/admin/ecg-materials";
}

function redirectWithMessage(
  pathname: string,
  type: "error" | "success",
  code: string,
): never {
  const separator = pathname.includes("?") ? "&" : "?";

  redirect(`${pathname}${separator}${type}=${code}`);
}

function revalidateEcgMaterialPages() {
  revalidatePath("/admin/ecg-materials");
  revalidatePath("/admin/ecg-sections");
  revalidatePath("/admin/materials");
  revalidatePath("/library/base");
  revalidatePath("/search");
}

export async function updateEcgMaterialVisibilityAction(formData: FormData) {
  await requireAdmin();

  const redirectPath = getRedirectPath(formData);
  const materialId = String(formData.get("materialId") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";
  const isPremium = formData.get("isPremium") === "on";

  if (!materialId) {
    redirectWithMessage(redirectPath, "error", "material-required");
  }

  const material = await prisma.material.findUnique({
    where: {
      id: materialId,
    },
    include: {
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!material) {
    redirectWithMessage(redirectPath, "error", "material-not-found");
  }

  if (material.category?.slug !== "ecg-base") {
    redirectWithMessage(redirectPath, "error", "not-ecg-base");
  }

  await prisma.material.update({
    where: {
      id: materialId,
    },
    data: {
      isPublished,
      isPremium,
    },
  });

  revalidateEcgMaterialPages();

  redirectWithMessage(redirectPath, "success", "visibility-updated");
}