"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createEcgSectionSlug } from "@/lib/ecgSections";
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

  if (redirectPath.startsWith("/admin/ecg-sections")) {
    return redirectPath;
  }

  return "/admin/ecg-sections";
}

function redirectWithMessage(
  pathname: string,
  type: "error" | "success",
  code: string,
): never {
  const separator = pathname.includes("?") ? "&" : "?";

  redirect(`${pathname}${separator}${type}=${code}`);
}

function revalidateEcgSectionPages() {
  revalidatePath("/admin/ecg-sections");
  revalidatePath("/admin/materials");
  revalidatePath("/library/base");
  revalidatePath("/search");
}

export async function createEcgSectionAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrderRaw = String(formData.get("sortOrder") ?? "100").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  const slug = createEcgSectionSlug(title);

  if (!title || !slug) {
    redirectWithMessage("/admin/ecg-sections", "error", "required-fields");
  }

  const existingSection = await prisma.ecgSection.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingSection) {
    redirectWithMessage("/admin/ecg-sections", "error", "slug-exists");
  }

  await prisma.ecgSection.create({
    data: {
      title,
      slug,
      description: description || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 100,
    },
  });

  revalidateEcgSectionPages();

  redirectWithMessage("/admin/ecg-sections", "success", "created");
}

export async function updateEcgSectionAction(formData: FormData) {
  await requireAdmin();

  const redirectPath = getRedirectPath(formData);
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrderRaw = String(formData.get("sortOrder") ?? "100").trim();
  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  const slug = createEcgSectionSlug(title);

  if (!id || !title || !slug) {
    redirectWithMessage(redirectPath, "error", "required-fields");
  }

  const existingSection = await prisma.ecgSection.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingSection && existingSection.id !== id) {
    redirectWithMessage(redirectPath, "error", "slug-exists");
  }

  await prisma.ecgSection.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      description: description || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 100,
    },
  });

  revalidateEcgSectionPages();
  revalidatePath(`/library/base/section/${slug}`);

  redirectWithMessage(redirectPath, "success", "updated");
}

export async function deleteEcgSectionAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const confirmDelete = String(formData.get("confirmDelete") ?? "").trim();

  if (!id || confirmDelete !== "DELETE_ECG_SECTION") {
    redirectWithMessage("/admin/ecg-sections", "error", "delete-not-confirmed");
  }

  await prisma.ecgSection.delete({
    where: {
      id,
    },
  });

  revalidateEcgSectionPages();

  redirectWithMessage("/admin/ecg-sections", "success", "deleted");
}

export async function moveMaterialEcgSectionAction(formData: FormData) {
  await requireAdmin();

  const redirectPath = getRedirectPath(formData);
  const materialId = String(formData.get("materialId") ?? "").trim();
  const ecgSectionIdRaw = String(formData.get("ecgSectionId") ?? "").trim();
  const ecgSectionId = ecgSectionIdRaw || null;

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

  if (ecgSectionId) {
    const section = await prisma.ecgSection.findUnique({
      where: {
        id: ecgSectionId,
      },
      select: {
        id: true,
      },
    });

    if (!section) {
      redirectWithMessage(redirectPath, "error", "section-not-found");
    }
  }

  await prisma.material.update({
    where: {
      id: materialId,
    },
    data: {
      ecgSectionId,
    },
  });

  revalidateEcgSectionPages();
  revalidatePath("/library/base");

  redirectWithMessage(redirectPath, "success", "material-moved");
}