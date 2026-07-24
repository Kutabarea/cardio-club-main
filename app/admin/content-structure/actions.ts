"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  createContentSlug,
  isSafeContentSlug,
} from "@/lib/contentStructure";
import {
  isContentMaterialType,
  isContentSubsectionKind,
} from "@/lib/materialClassification";
import { prisma } from "@/lib/prisma";
import { PUBLIC_NAVIGATION_CACHE_TAG } from "@/lib/publicNavigationRoutes";

const structurePath = "/admin/content-structure";

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
  redirect(`${structurePath}?${type}=${code}`);
}

function readText(
  formData: FormData,
  name: string,
  maxLength: number,
) {
  return String(
    formData.get(name) ?? "",
  )
    .trim()
    .slice(0, maxLength);
}

function readOrder(formData: FormData) {
  const value = Number.parseInt(
    String(formData.get("sortOrder") ?? "100"),
    10,
  );

  return Number.isFinite(value)
    ? Math.max(0, Math.min(value, 100000))
    : 100;
}

function readActive(formData: FormData) {
  return formData.get("isActive") === "on";
}

function resolveSlug(
  title: string,
  slugInput: string,
) {
  const slug =
    slugInput || createContentSlug(title);

  return isSafeContentSlug(slug)
    ? slug
    : "";
}

function revalidateStructurePages() {
  updateTag(PUBLIC_NAVIGATION_CACHE_TAG);
  revalidatePath("/admin");
  revalidatePath("/admin/content-structure");
  revalidatePath("/admin/materials");
  revalidatePath("/admin/materials/new");
  revalidatePath("/library");
  revalidatePath("/library/base");
  revalidatePath("/videolecture");
  revalidatePath("/videocourses");
  revalidatePath("/search");
}

export async function createContentAreaAction(
  formData: FormData,
) {
  await requireAdmin();

  const title = readText(formData, "title", 120);
  const description = readText(
    formData,
    "description",
    1000,
  );

  const slug = resolveSlug(
    title,
    readText(formData, "slug", 120),
  );

  const materialType = readText(
    formData,
    "materialType",
    40,
  );

  if (
    !title ||
    !slug ||
    !isContentMaterialType(materialType)
  ) {
    redirectWithMessage(
      "error",
      "invalid-area",
    );
  }

  const existing =
    await prisma.contentArea.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (existing) {
    redirectWithMessage(
      "error",
      "slug-exists",
    );
  }

  await prisma.contentArea.create({
    data: {
      title,
      slug,
      description: description || null,
      materialType,
      sortOrder: readOrder(formData),
      isActive: readActive(formData),
    },
  });

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "area-created",
  );
}

export async function updateContentAreaAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = readText(formData, "id", 100);
  const title = readText(formData, "title", 120);
  const description = readText(
    formData,
    "description",
    1000,
  );

  const slug = resolveSlug(
    title,
    readText(formData, "slug", 120),
  );

  const materialType = readText(
    formData,
    "materialType",
    40,
  );

  if (
    !id ||
    !title ||
    !slug ||
    !isContentMaterialType(materialType)
  ) {
    redirectWithMessage(
      "error",
      "invalid-area",
    );
  }

  const current =
    await prisma.contentArea.findUnique({
      where: {
        id,
      },
      select: {
        materialType: true,
      },
    });

  if (!current) {
    redirectWithMessage(
      "error",
      "not-found",
    );
  }

  const conflicting =
    await prisma.contentArea.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (conflicting && conflicting.id !== id) {
    redirectWithMessage(
      "error",
      "slug-exists",
    );
  }

  if (current.materialType !== materialType) {
    const materialCount =
      await prisma.material.count({
        where: {
          category: {
            contentAreaId: id,
          },
        },
      });

    if (materialCount > 0) {
      redirectWithMessage(
        "error",
        "area-type-in-use",
      );
    }
  }

  await prisma.contentArea.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      description: description || null,
      materialType,
      sortOrder: readOrder(formData),
      isActive: readActive(formData),
    },
  });

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "area-updated",
  );
}

export async function deleteContentAreaAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = readText(formData, "id", 100);
  const confirmation = readText(
    formData,
    "confirmation",
    100,
  );

  if (
    !id ||
    confirmation !== "DELETE_CONTENT_AREA"
  ) {
    redirectWithMessage(
      "error",
      "delete-not-confirmed",
    );
  }

  const categoryCount =
    await prisma.category.count({
      where: {
        contentAreaId: id,
      },
    });

  if (categoryCount > 0) {
    redirectWithMessage(
      "error",
      "area-not-empty",
    );
  }

  await prisma.contentArea.delete({
    where: {
      id,
    },
  });

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "area-deleted",
  );
}

export async function createStructureCategoryAction(
  formData: FormData,
) {
  await requireAdmin();

  const contentAreaId = readText(
    formData,
    "contentAreaId",
    100,
  );

  const title = readText(formData, "title", 120);
  const description = readText(
    formData,
    "description",
    1000,
  );

  const slug = resolveSlug(
    title,
    readText(formData, "slug", 120),
  );

  const subsectionKind = readText(
    formData,
    "subsectionKind",
    40,
  );

  if (
    !contentAreaId ||
    !title ||
    !slug ||
    !isContentSubsectionKind(subsectionKind)
  ) {
    redirectWithMessage(
      "error",
      "invalid-category",
    );
  }

  const area =
    await prisma.contentArea.findUnique({
      where: {
        id: contentAreaId,
      },
      select: {
        id: true,
      },
    });

  if (!area) {
    redirectWithMessage(
      "error",
      "not-found",
    );
  }

  const conflicting =
    await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (conflicting) {
    redirectWithMessage(
      "error",
      "slug-exists",
    );
  }

  await prisma.category.create({
    data: {
      contentAreaId,
      title,
      slug,
      description: description || null,
      subsectionKind,
      sortOrder: readOrder(formData),
      isActive: readActive(formData),
    },
  });

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "category-created",
  );
}

export async function updateStructureCategoryAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = readText(formData, "id", 100);
  const contentAreaId = readText(
    formData,
    "contentAreaId",
    100,
  );

  const title = readText(formData, "title", 120);
  const description = readText(
    formData,
    "description",
    1000,
  );

  const slug = resolveSlug(
    title,
    readText(formData, "slug", 120),
  );

  const subsectionKind = readText(
    formData,
    "subsectionKind",
    40,
  );

  if (
    !id ||
    !contentAreaId ||
    !title ||
    !slug ||
    !isContentSubsectionKind(subsectionKind)
  ) {
    redirectWithMessage(
      "error",
      "invalid-category",
    );
  }

  const [current, targetArea] =
    await Promise.all([
      prisma.category.findUnique({
        where: {
          id,
        },
        include: {
          contentArea: {
            select: {
              materialType: true,
            },
          },
          _count: {
            select: {
              materials: true,
              ecgSections: true,
              videoLectureSections: true,
            },
          },
        },
      }),

      prisma.contentArea.findUnique({
        where: {
          id: contentAreaId,
        },
        select: {
          materialType: true,
        },
      }),
    ]);

  if (!current || !targetArea) {
    redirectWithMessage(
      "error",
      "not-found",
    );
  }

  const conflicting =
    await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (conflicting && conflicting.id !== id) {
    redirectWithMessage(
      "error",
      "slug-exists",
    );
  }

  if (
    current._count.materials > 0 &&
    current.contentArea?.materialType !==
      targetArea.materialType
  ) {
    redirectWithMessage(
      "error",
      "category-type-in-use",
    );
  }

  if (
    subsectionKind !== current.subsectionKind &&
    (
      current._count.ecgSections > 0 ||
      current._count.videoLectureSections > 0
    )
  ) {
    redirectWithMessage(
      "error",
      "category-has-subsections",
    );
  }

  await prisma.category.update({
    where: {
      id,
    },
    data: {
      contentAreaId,
      title,
      slug,
      description: description || null,
      subsectionKind,
      sortOrder: readOrder(formData),
      isActive: readActive(formData),
    },
  });

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "category-updated",
  );
}

export async function deleteStructureCategoryAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = readText(formData, "id", 100);
  const confirmation = readText(
    formData,
    "confirmation",
    100,
  );

  if (
    !id ||
    confirmation !== "DELETE_STRUCTURE_CATEGORY"
  ) {
    redirectWithMessage(
      "error",
      "delete-not-confirmed",
    );
  }

  const category =
    await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            materials: true,
            ecgSections: true,
            videoLectureSections: true,
          },
        },
      },
    });

  if (!category) {
    redirectWithMessage(
      "error",
      "not-found",
    );
  }

  if (
    category._count.materials > 0 ||
    category._count.ecgSections > 0 ||
    category._count.videoLectureSections > 0
  ) {
    redirectWithMessage(
      "error",
      "category-not-empty",
    );
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "category-deleted",
  );
}

export async function createSubsectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const categoryId = readText(
    formData,
    "categoryId",
    100,
  );

  const kind = readText(
    formData,
    "kind",
    40,
  );

  const title = readText(formData, "title", 120);
  const description = readText(
    formData,
    "description",
    1000,
  );

  const slug = resolveSlug(
    title,
    readText(formData, "slug", 120),
  );

  if (
    !categoryId ||
    !title ||
    !slug ||
    (
      kind !== "ECG" &&
      kind !== "VIDEO_LECTURE"
    )
  ) {
    redirectWithMessage(
      "error",
      "invalid-subsection",
    );
  }

  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        subsectionKind: true,
      },
    });

  if (
    !category ||
    category.subsectionKind !== kind
  ) {
    redirectWithMessage(
      "error",
      "invalid-subsection",
    );
  }

  if (kind === "ECG") {
    const conflicting =
      await prisma.ecgSection.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (conflicting) {
      redirectWithMessage(
        "error",
        "slug-exists",
      );
    }

    await prisma.ecgSection.create({
      data: {
        categoryId,
        title,
        slug,
        description: description || null,
        sortOrder: readOrder(formData),
        isActive: readActive(formData),
      },
    });
  } else {
    const conflicting =
      await prisma.videoLectureSection.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (conflicting) {
      redirectWithMessage(
        "error",
        "slug-exists",
      );
    }

    await prisma.videoLectureSection.create({
      data: {
        categoryId,
        title,
        slug,
        description: description || null,
        sortOrder: readOrder(formData),
        isActive: readActive(formData),
      },
    });
  }

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "subsection-created",
  );
}

export async function updateSubsectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = readText(formData, "id", 100);
  const categoryId = readText(
    formData,
    "categoryId",
    100,
  );

  const kind = readText(
    formData,
    "kind",
    40,
  );

  const title = readText(formData, "title", 120);
  const description = readText(
    formData,
    "description",
    1000,
  );

  const slug = resolveSlug(
    title,
    readText(formData, "slug", 120),
  );

  if (
    !id ||
    !categoryId ||
    !title ||
    !slug ||
    (
      kind !== "ECG" &&
      kind !== "VIDEO_LECTURE"
    )
  ) {
    redirectWithMessage(
      "error",
      "invalid-subsection",
    );
  }

  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        subsectionKind: true,
      },
    });

  if (
    !category ||
    category.subsectionKind !== kind
  ) {
    redirectWithMessage(
      "error",
      "invalid-subsection",
    );
  }

  if (kind === "ECG") {
    const current =
      await prisma.ecgSection.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!current) {
      redirectWithMessage(
        "error",
        "not-found",
      );
    }

    const conflicting =
      await prisma.ecgSection.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (
      conflicting &&
      conflicting.id !== id
    ) {
      redirectWithMessage(
        "error",
        "slug-exists",
      );
    }

    await prisma.$transaction([
      prisma.ecgSection.update({
        where: {
          id,
        },
        data: {
          categoryId,
          title,
          slug,
          description: description || null,
          sortOrder: readOrder(formData),
          isActive: readActive(formData),
        },
      }),

      prisma.material.updateMany({
        where: {
          ecgSectionId: id,
        },
        data: {
          categoryId,
        },
      }),
    ]);
  } else {
    const current =
      await prisma.videoLectureSection.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!current) {
      redirectWithMessage(
        "error",
        "not-found",
      );
    }

    const conflicting =
      await prisma.videoLectureSection.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (
      conflicting &&
      conflicting.id !== id
    ) {
      redirectWithMessage(
        "error",
        "slug-exists",
      );
    }

    await prisma.$transaction([
      prisma.videoLectureSection.update({
        where: {
          id,
        },
        data: {
          categoryId,
          title,
          slug,
          description: description || null,
          sortOrder: readOrder(formData),
          isActive: readActive(formData),
        },
      }),

      prisma.material.updateMany({
        where: {
          videoLectureSectionId: id,
        },
        data: {
          categoryId,
        },
      }),
    ]);
  }

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "subsection-updated",
  );
}

export async function deleteSubsectionAction(
  formData: FormData,
) {
  await requireAdmin();

  const id = readText(formData, "id", 100);
  const kind = readText(formData, "kind", 40);
  const confirmation = readText(
    formData,
    "confirmation",
    100,
  );

  if (
    !id ||
    confirmation !== "DELETE_SUBSECTION" ||
    (
      kind !== "ECG" &&
      kind !== "VIDEO_LECTURE"
    )
  ) {
    redirectWithMessage(
      "error",
      "delete-not-confirmed",
    );
  }

  if (kind === "ECG") {
    const materialCount =
      await prisma.material.count({
        where: {
          ecgSectionId: id,
        },
      });

    if (materialCount > 0) {
      redirectWithMessage(
        "error",
        "subsection-not-empty",
      );
    }

    await prisma.ecgSection.delete({
      where: {
        id,
      },
    });
  } else {
    const materialCount =
      await prisma.material.count({
        where: {
          videoLectureSectionId: id,
        },
      });

    if (materialCount > 0) {
      redirectWithMessage(
        "error",
        "subsection-not-empty",
      );
    }

    await prisma.videoLectureSection.delete({
      where: {
        id,
      },
    });
  }

  revalidateStructurePages();
  redirectWithMessage(
    "success",
    "subsection-deleted",
  );
}