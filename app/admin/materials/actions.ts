"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  MAX_MATERIAL_CONTENT_LENGTH,
  sanitizeAssetUrl,
  sanitizeMaterialContent,
  sanitizeVideoUrl,
} from "@/lib/contentSecurity";
import {
  createContentSlug,
  resolveMaterialPlacement,
} from "@/lib/contentStructure";
import { prisma } from "@/lib/prisma";
import {
  deleteUploadedMaterialImage,
  saveMaterialImageFile,
} from "@/lib/uploads";

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }
}

function getSafeAdminPath(
  value: FormDataEntryValue | null,
  fallback: string,
) {
  const path = String(value ?? "").trim();

  return path.startsWith("/admin")
    ? path
    : fallback;
}

function getRedirectPath(formData: FormData) {
  return getSafeAdminPath(
    formData.get("redirectPath"),
    "/admin/materials",
  );
}

function getAfterCreatePath(formData: FormData) {
  return getSafeAdminPath(
    formData.get("afterCreatePath"),
    "/admin/materials",
  );
}

function redirectWithMessage(
  pathname: string,
  type: "error" | "success",
  code: string,
): never {
  const separator = pathname.includes("?")
    ? "&"
    : "?";

  redirect(
    `${pathname}${separator}${type}=${code}`,
  );
}

function getRawMaterialPayload(
  formData: FormData,
) {
  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const slugInput = String(
    formData.get("slug") ?? "",
  ).trim();

  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const contentInput = String(
    formData.get("content") ?? "",
  ).trim();

  const content =
    sanitizeMaterialContent(contentInput);

  const type = String(
    formData.get("type") ?? "",
  ).trim();

  const imageUrlInputRaw = String(
    formData.get("imageUrl") ?? "",
  ).trim();

  const imageUrlInput =
    sanitizeAssetUrl(imageUrlInputRaw);

  const videoUrlRaw = String(
    formData.get("videoUrl") ?? "",
  ).trim();

  const videoUrl =
    sanitizeVideoUrl(videoUrlRaw);

  const categoryId = String(
    formData.get("categoryId") ?? "",
  ).trim();

  const ecgSectionId = String(
    formData.get("ecgSectionId") ?? "",
  ).trim();

  const videoLectureSectionId = String(
    formData.get("videoLectureSectionId") ?? "",
  ).trim();

  const sortOrderValue = Number.parseInt(
    String(
      formData.get("sortOrder") ?? "100",
    ),
    10,
  );

  const isPremium =
    formData.get("isPremium") === "on";

  const isPublished =
    formData.get("isPublished") === "on";

  const slug =
    slugInput || createContentSlug(title);

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
    ecgSectionId,
    videoLectureSectionId,
    sortOrder: Number.isFinite(sortOrderValue)
      ? sortOrderValue
      : 100,
    isPremium,
    isPublished,
  };
}

function validateRawMaterialPayload(
  raw: ReturnType<typeof getRawMaterialPayload>,
  errorRedirectPath: string,
) {
  if (
    !raw.title ||
    !raw.type ||
    !raw.categoryId
  ) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "required-fields",
    );
  }

  if (!raw.slug) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "slug-required",
    );
  }

  if (
    raw.contentInput.length >
    MAX_MATERIAL_CONTENT_LENGTH
  ) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "content-too-large",
    );
  }

  if (
    raw.imageUrlInputRaw &&
    !raw.imageUrlInput
  ) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "invalid-url",
    );
  }

  if (raw.videoUrlRaw && !raw.videoUrl) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "invalid-url",
    );
  }
}

async function getMaterialPayload(
  formData: FormData,
  errorRedirectPath: string,
) {
  const raw = getRawMaterialPayload(formData);

  validateRawMaterialPayload(
    raw,
    errorRedirectPath,
  );

  const placement =
    await resolveMaterialPlacement({
      categoryId: raw.categoryId,
      type: raw.type,
      ecgSectionId: raw.ecgSectionId,
      videoLectureSectionId:
        raw.videoLectureSectionId,
    });

  if (!placement.ok) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      placement.error,
    );
  }

  const uploadedImage =
    await saveMaterialImageFile(
      formData.get("imageFile"),
    );

  if (!uploadedImage.ok) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      uploadedImage.error,
    );
  }

  return {
    title: raw.title,
    slug: raw.slug,
    description: raw.description || null,
    content: raw.content || null,
    type: raw.type,
    imageUrl:
      uploadedImage.imageUrl ||
      raw.imageUrlInput ||
      null,
    videoUrl: raw.videoUrl || null,
    categoryId: placement.categoryId,
    ecgSectionId: placement.ecgSectionId,
    videoLectureSectionId:
      placement.videoLectureSectionId,
    sortOrder: raw.sortOrder,
    isPremium: raw.isPremium,
    isPublished: raw.isPublished,
  };
}

function revalidateMaterialPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/materials");
  revalidatePath("/admin/materials/audit");
  revalidatePath("/admin/content-structure");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/videocourses");
  revalidatePath("/search");
}

export async function createMaterialAction(
  formData: FormData,
) {
  await requireAdmin();

  const errorRedirectPath =
    getRedirectPath(formData);

  const afterCreatePath =
    getAfterCreatePath(formData);

  const raw = getRawMaterialPayload(formData);

  validateRawMaterialPayload(
    raw,
    errorRedirectPath,
  );

  const existingMaterial =
    await prisma.material.findUnique({
      where: {
        slug: raw.slug,
      },
      select: {
        id: true,
      },
    });

  if (existingMaterial) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "slug-exists",
    );
  }

  const payload = await getMaterialPayload(
    formData,
    errorRedirectPath,
  );

  await prisma.material.create({
    data: payload,
  });

  revalidateMaterialPages();

  redirectWithMessage(
    afterCreatePath,
    "success",
    "created",
  );
}

export async function updateMaterialAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const errorRedirectPath =
    getRedirectPath(formData);

  if (!id) {
    redirectWithMessage(
      "/admin/materials",
      "error",
      "id-required",
    );
  }

  const raw = getRawMaterialPayload(formData);

  validateRawMaterialPayload(
    raw,
    errorRedirectPath,
  );

  const existingMaterial =
    await prisma.material.findUnique({
      where: {
        slug: raw.slug,
      },
      select: {
        id: true,
      },
    });

  if (
    existingMaterial &&
    existingMaterial.id !== id
  ) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "slug-exists",
    );
  }

  const oldMaterial =
    await prisma.material.findUnique({
      where: {
        id,
      },
      select: {
        imageUrl: true,
      },
    });

  if (!oldMaterial) {
    redirectWithMessage(
      errorRedirectPath,
      "error",
      "not-found",
    );
  }

  const payload = await getMaterialPayload(
    formData,
    errorRedirectPath,
  );

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
    await deleteUploadedMaterialImage(
      oldMaterial.imageUrl,
    );
  }

  revalidateMaterialPages();

  redirectWithMessage(
    errorRedirectPath,
    "success",
    "updated",
  );
}

export async function deleteMaterialAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const confirmDelete = String(
    formData.get("confirmDelete") ?? "",
  ).trim();

  const redirectPath =
    getRedirectPath(formData);

  if (!id) {
    redirectWithMessage(
      redirectPath,
      "error",
      "id-required",
    );
  }

  if (
    confirmDelete !== "DELETE_MATERIAL"
  ) {
    redirectWithMessage(
      redirectPath,
      "error",
      "delete-not-confirmed",
    );
  }

  const material =
    await prisma.material.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

  if (!material) {
    redirectWithMessage(
      redirectPath,
      "error",
      "not-found",
    );
  }

  await prisma.material.delete({
    where: {
      id,
    },
  });

  await deleteUploadedMaterialImage(
    material.imageUrl,
  );

  revalidateMaterialPages();

  redirectWithMessage(
    redirectPath,
    "success",
    "deleted",
  );
}

export async function toggleMaterialPublishAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const redirectPath =
    getRedirectPath(formData);

  const nextPublishedValue =
    String(
      formData.get("isPublished") ?? "",
    ).trim() === "true";

  if (!id) {
    redirectWithMessage(
      redirectPath,
      "error",
      "id-required",
    );
  }

  const material =
    await prisma.material.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!material) {
    redirectWithMessage(
      redirectPath,
      "error",
      "not-found",
    );
  }

  await prisma.material.update({
    where: {
      id,
    },
    data: {
      isPublished: nextPublishedValue,
    },
  });

  revalidateMaterialPages();

  redirectWithMessage(
    redirectPath,
    "success",
    nextPublishedValue
      ? "published"
      : "unpublished",
  );
}