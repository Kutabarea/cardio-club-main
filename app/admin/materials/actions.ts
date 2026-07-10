"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function getMaterialPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !type || !categoryId) {
    throw new Error("Название, тип и категория обязательны");
  }

  const slug = slugInput || createSlug(title);

  return {
    title,
    slug,
    description: description || null,
    content: content || null,
    type,
    imageUrl: imageUrl || null,
    videoUrl: videoUrl || null,
    categoryId,
    isPremium,
    isPublished,
  };
}

function revalidateMaterialPages() {
  revalidatePath("/admin/materials");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
}

export async function createMaterialAction(formData: FormData) {
  await requireAdmin();

  const payload = getMaterialPayload(formData);

  await prisma.material.create({
    data: payload,
  });

  revalidateMaterialPages();
}

export async function updateMaterialAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("ID материала обязателен");
  }

  const payload = getMaterialPayload(formData);

  await prisma.material.update({
    where: {
      id,
    },
    data: payload,
  });

  revalidateMaterialPages();

  redirect("/admin/materials");
}

export async function deleteMaterialAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("ID материала обязателен");
  }

  await prisma.material.delete({
    where: {
      id,
    },
  });

  revalidateMaterialPages();
}