"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const maxImageSize = 5 * 1024 * 1024;

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(" ", "-")
    .replaceAll(/[^a-zа-яё0-9-]/gi, "")
    .replaceAll("ё", "е");
}

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

  if (redirectPath.startsWith("/admin/materials")) {
    return redirectPath;
  }

  return "/admin/materials";
}

function redirectWithError(pathname: string, error: string) {
  const separator = pathname.includes("?") ? "&" : "?";

  redirect(`${pathname}${separator}error=${error}`);
}

async function saveImageFile(
  file: FormDataEntryValue | null,
  errorRedirectPath: string,
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    redirectWithError(errorRedirectPath, "invalid-image");
  }

  if (file.size > maxImageSize) {
    redirectWithError(errorRedirectPath, "image-too-large");
  }

  const extensionFromName = file.name.split(".").pop()?.toLowerCase();
  const extension =
    extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)
      ? extensionFromName
      : "png";

  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");
  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, {
    recursive: true,
  });

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  return `/uploads/materials/${fileName}`;
}

function getRawMaterialPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const imageUrlInput = String(formData.get("imageUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";
  const isPublished = formData.get("isPublished") === "on";
  const slug = slugInput || createSlug(title);

  return {
    title,
    slug,
    description,
    content,
    type,
    imageUrlInput,
    videoUrl,
    categoryId,
    isPremium,
    isPublished,
  };
}

async function getMaterialPayload(
  formData: FormData,
  errorRedirectPath: string,
) {
  const raw = getRawMaterialPayload(formData);

  if (!raw.title || !raw.type || !raw.categoryId) {
    redirectWithError(errorRedirectPath, "required-fields");
  }

  if (!raw.slug) {
    redirectWithError(errorRedirectPath, "slug-required");
  }

  const uploadedImageUrl = await saveImageFile(
    formData.get("imageFile"),
    errorRedirectPath,
  );

  return {
    title: raw.title,
    slug: raw.slug,
    description: raw.description || null,
    content: raw.content || null,
    type: raw.type,
    imageUrl: uploadedImageUrl || raw.imageUrlInput || null,
    videoUrl: raw.videoUrl || null,
    categoryId: raw.categoryId,
    isPremium: raw.isPremium,
    isPublished: raw.isPublished,
  };
}

function revalidateMaterialPages() {
  revalidatePath("/admin/materials");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/search");
}

export async function createMaterialAction(formData: FormData) {
  await requireAdmin();

  const errorRedirectPath = getRedirectPath(formData);
  const raw = getRawMaterialPayload(formData);

  if (!raw.title || !raw.type || !raw.categoryId) {
    redirectWithError(errorRedirectPath, "required-fields");
  }

  if (!raw.slug) {
    redirectWithError(errorRedirectPath, "slug-required");
  }

  const existingMaterial = await prisma.material.findUnique({
    where: {
      slug: raw.slug,
    },
    select: {
      id: true,
    },
  });

  if (existingMaterial) {
    redirectWithError(errorRedirectPath, "slug-exists");
  }

  const payload = await getMaterialPayload(formData, errorRedirectPath);

  await prisma.material.create({
    data: payload,
  });

  revalidateMaterialPages();

  redirect("/admin/materials?success=created");
}

export async function updateMaterialAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const errorRedirectPath = getRedirectPath(formData);

  if (!id) {
    redirectWithError("/admin/materials", "id-required");
  }

  const raw = getRawMaterialPayload(formData);

  if (!raw.title || !raw.type || !raw.categoryId) {
    redirectWithError(errorRedirectPath, "required-fields");
  }

  if (!raw.slug) {
    redirectWithError(errorRedirectPath, "slug-required");
  }

  const existingMaterial = await prisma.material.findUnique({
    where: {
      slug: raw.slug,
    },
    select: {
      id: true,
    },
  });

  if (existingMaterial && existingMaterial.id !== id) {
    redirectWithError(errorRedirectPath, "slug-exists");
  }

  const payload = await getMaterialPayload(formData, errorRedirectPath);

  await prisma.material.update({
    where: {
      id,
    },
    data: payload,
  });

  revalidateMaterialPages();

  redirect("/admin/materials?success=updated");
}

export async function deleteMaterialAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirectWithError("/admin/materials", "id-required");
  }

  await prisma.material.delete({
    where: {
      id,
    },
  });

  revalidateMaterialPages();

  redirect("/admin/materials?success=deleted");
}