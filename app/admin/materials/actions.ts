"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  MAX_MATERIAL_CONTENT_LENGTH,
  sanitizeAssetUrl,
  sanitizeMaterialContent,
  sanitizeVideoUrl,
} from "@/lib/contentSecurity";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const maxImageSize = 5 * 1024 * 1024;

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

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

function redirectWithMessage(
  pathname: string,
  type: "error" | "success",
  code: string,
): never {
  const separator = pathname.includes("?") ? "&" : "?";

  redirect(`${pathname}${separator}${type}=${code}`);
}

async function deleteUploadedMaterialImage(imageUrl?: string | null) {
  if (!imageUrl?.startsWith("/uploads/materials/")) {
    return;
  }

  const fileName = path.basename(imageUrl);
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "materials",
    fileName,
  );

  await unlink(filePath).catch(() => null);
}

async function saveImageFile(
  file: FormDataEntryValue | null,
  errorRedirectPath: string,
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-image");
  }

  if (file.size > maxImageSize) {
    redirectWithMessage(errorRedirectPath, "error", "image-too-large");
  }

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
  const contentInput = String(formData.get("content") ?? "").trim();
  const content = sanitizeMaterialContent(contentInput);
  const type = String(formData.get("type") ?? "").trim();
  const imageUrlInputRaw = String(formData.get("imageUrl") ?? "").trim();
  const imageUrlInput = sanitizeAssetUrl(imageUrlInputRaw);
  const videoUrlRaw = String(formData.get("videoUrl") ?? "").trim();
  const videoUrl = sanitizeVideoUrl(videoUrlRaw);
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";
  const isPublished = formData.get("isPublished") === "on";
  const slug = slugInput || createSlug(title);

  return {
    title,
    slug,
    description,
    content,
    contentInput,
    type,
    imageUrlInputRaw,
    imageUrlInput,
    videoUrlRaw,
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
    redirectWithMessage(errorRedirectPath, "error", "required-fields");
  }

  if (!raw.slug) {
    redirectWithMessage(errorRedirectPath, "error", "slug-required");
  }

  if (raw.contentInput.length > MAX_MATERIAL_CONTENT_LENGTH) {
    redirectWithMessage(errorRedirectPath, "error", "content-too-large");
  }

  if (raw.imageUrlInputRaw && !raw.imageUrlInput) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-url");
  }

  if (raw.videoUrlRaw && !raw.videoUrl) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-url");
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
  revalidatePath("/admin");
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
    redirectWithMessage(errorRedirectPath, "error", "required-fields");
  }

  if (!raw.slug) {
    redirectWithMessage(errorRedirectPath, "error", "slug-required");
  }

  if (raw.contentInput.length > MAX_MATERIAL_CONTENT_LENGTH) {
    redirectWithMessage(errorRedirectPath, "error", "content-too-large");
  }

  if (raw.imageUrlInputRaw && !raw.imageUrlInput) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-url");
  }

  if (raw.videoUrlRaw && !raw.videoUrl) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-url");
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
    redirectWithMessage(errorRedirectPath, "error", "slug-exists");
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
    redirectWithMessage("/admin/materials", "error", "id-required");
  }

  const raw = getRawMaterialPayload(formData);

  if (!raw.title || !raw.type || !raw.categoryId) {
    redirectWithMessage(errorRedirectPath, "error", "required-fields");
  }

  if (!raw.slug) {
    redirectWithMessage(errorRedirectPath, "error", "slug-required");
  }

  if (raw.contentInput.length > MAX_MATERIAL_CONTENT_LENGTH) {
    redirectWithMessage(errorRedirectPath, "error", "content-too-large");
  }

  if (raw.imageUrlInputRaw && !raw.imageUrlInput) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-url");
  }

  if (raw.videoUrlRaw && !raw.videoUrl) {
    redirectWithMessage(errorRedirectPath, "error", "invalid-url");
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
    redirectWithMessage(errorRedirectPath, "error", "slug-exists");
  }

  const oldMaterial = await prisma.material.findUnique({
    where: {
      id,
    },
    select: {
      imageUrl: true,
    },
  });

  if (!oldMaterial) {
    redirectWithMessage(errorRedirectPath, "error", "not-found");
  }

  const payload = await getMaterialPayload(formData, errorRedirectPath);

  await prisma.material.update({
    where: {
      id,
    },
    data: payload,
  });

  if (
    payload.imageUrl &&
    oldMaterial.imageUrl &&
    payload.imageUrl !== oldMaterial.imageUrl
  ) {
    await deleteUploadedMaterialImage(oldMaterial.imageUrl);
  }

  revalidateMaterialPages();

  redirectWithMessage(errorRedirectPath, "success", "updated");
}

export async function deleteMaterialAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const confirmDelete = String(formData.get("confirmDelete") ?? "").trim();
  const redirectPath = getRedirectPath(formData);

  if (!id) {
    redirectWithMessage(redirectPath, "error", "id-required");
  }

  if (confirmDelete !== "DELETE_MATERIAL") {
    redirectWithMessage(redirectPath, "error", "delete-not-confirmed");
  }

  const material = await prisma.material.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      imageUrl: true,
    },
  });

  if (!material) {
    redirectWithMessage(redirectPath, "error", "not-found");
  }

  await prisma.material.delete({
    where: {
      id,
    },
  });

  await deleteUploadedMaterialImage(material.imageUrl);

  revalidateMaterialPages();

  redirectWithMessage(redirectPath, "success", "deleted");
}