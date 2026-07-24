"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PUBLIC_NAVIGATION_CACHE_TAG } from "@/lib/publicNavigationRoutes";
import {
  createVideoLectureSectionSlug,
} from "@/lib/videoLectureSections";

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }
}

function redirectWithMessage(
  type: "error" | "success",
  code: string,
): never {
  redirect(`/admin/video-lecture-sections?${type}=${code}`);
}

async function getVideoLectureCategoryId() {
  const category =
    await prisma.category.findUnique({
      where: {
        slug: "video-lectures",
      },
      select: {
        id: true,
        contentArea: {
          select: {
            slug: true,
            materialType: true,
          },
        },
      },
    });

  const contentArea =
    category?.contentArea;

  if (
    !category ||
    !contentArea ||
    contentArea.slug !==
      "video-lectures" ||
    contentArea.materialType !==
      "VIDEO_LECTURE"
  ) {
    redirectWithMessage(
      "error",
      "structure-not-ready",
    );
  }

  return category.id;
}

function revalidateVideoLecturePages() {
  updateTag(PUBLIC_NAVIGATION_CACHE_TAG);
  revalidatePath("/videolecture");
  revalidatePath("/admin");
  revalidatePath("/admin/materials");
  revalidatePath("/admin/video-lecture-sections");
  revalidatePath("/search");
}

export async function createVideoLectureSectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const sortOrderValue = Number.parseInt(
    String(formData.get("sortOrder") ?? "100"),
    10,
  );

  const slug = createVideoLectureSectionSlug(title);

  if (!title || !slug) {
    redirectWithMessage("error", "required-fields");
  }

  const existingSection =
    await prisma.videoLectureSection.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (existingSection) {
    redirectWithMessage("error", "slug-exists");
  }

  const categoryId =
    await getVideoLectureCategoryId();

  await prisma.videoLectureSection.create({
    data: {
      title,
      slug,
      description: description || null,
      categoryId,
      sortOrder: Number.isFinite(sortOrderValue)
        ? sortOrderValue
        : 100,
    },
  });

  revalidateVideoLecturePages();
  redirectWithMessage("success", "section-created");
}

export async function updateVideoLectureSectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const sortOrderValue = Number.parseInt(
    String(formData.get("sortOrder") ?? "100"),
    10,
  );

  const slug = createVideoLectureSectionSlug(title);

  if (!id || !title || !slug) {
    redirectWithMessage("error", "required-fields");
  }

  const existingSection =
    await prisma.videoLectureSection.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (existingSection && existingSection.id !== id) {
    redirectWithMessage("error", "slug-exists");
  }

  const categoryId =
    await getVideoLectureCategoryId();

  await prisma.videoLectureSection.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      description: description || null,
      categoryId,
      sortOrder: Number.isFinite(sortOrderValue)
        ? sortOrderValue
        : 100,
    },
  });

  revalidateVideoLecturePages();
  redirectWithMessage("success", "section-updated");
}

export async function deleteVideoLectureSectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const confirmation = String(
    formData.get("confirmDelete") ?? "",
  ).trim();

  if (!id || confirmation !== "DELETE_VIDEO_SECTION") {
    redirectWithMessage("error", "delete-not-confirmed");
  }

  await prisma.videoLectureSection.delete({
    where: {
      id,
    },
  });

  revalidateVideoLecturePages();
  redirectWithMessage("success", "section-deleted");
}

export async function assignVideoLectureSectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const materialId = String(
    formData.get("materialId") ?? "",
  ).trim();

  const sectionIdValue = String(
    formData.get("videoLectureSectionId") ?? "",
  ).trim();

  const sortOrderValue = Number.parseInt(
    String(formData.get("sortOrder") ?? "100"),
    10,
  );

  if (!materialId) {
    redirectWithMessage("error", "material-required");
  }

  const material = await prisma.material.findUnique({
    where: {
      id: materialId,
    },
    select: {
      id: true,
      type: true,
    },
  });

  if (!material || material.type !== "VIDEO_LECTURE") {
    redirectWithMessage("error", "material-not-found");
  }

  let videoLectureSectionId: string | null = null;

  if (sectionIdValue) {
    const section =
      await prisma.videoLectureSection.findUnique({
        where: {
          id: sectionIdValue,
        },
        select: {
          id: true,
        },
      });

    if (!section) {
      redirectWithMessage("error", "section-not-found");
    }

    videoLectureSectionId = section.id;
  }

  await prisma.material.update({
    where: {
      id: materialId,
    },
    data: {
      videoLectureSectionId,
      sortOrder: Number.isFinite(sortOrderValue)
        ? sortOrderValue
        : 100,
    },
  });

  revalidateVideoLecturePages();
  redirectWithMessage("success", "material-assigned");
}