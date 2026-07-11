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

function revalidateCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/materials");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/search");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    redirect("/admin/categories?error=title-required");
  }

  const slug = slugInput || createSlug(title);

  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingCategory) {
    redirect("/admin/categories?error=slug-exists");
  }

  await prisma.category.create({
    data: {
      title,
      slug,
      description: description || null,
    },
  });

  revalidateCategoryPages();

  redirect("/admin/categories?success=created");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!id) {
    redirect("/admin/categories?error=id-required");
  }

  if (!title) {
    redirect(`/admin/categories/${id}/edit?error=title-required`);
  }

  const slug = slugInput || createSlug(title);

  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingCategory && existingCategory.id !== id) {
    redirect(`/admin/categories/${id}/edit?error=slug-exists`);
  }

  await prisma.category.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      description: description || null,
    },
  });

  revalidateCategoryPages();

  redirect("/admin/categories?success=updated");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/admin/categories?error=id-required");
  }

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          materials: true,
        },
      },
    },
  });

  if (!category) {
    redirect("/admin/categories?error=not-found");
  }

  if (category._count.materials > 0) {
    redirect("/admin/categories?error=category-has-materials");
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  revalidateCategoryPages();

  redirect("/admin/categories?success=deleted");
}