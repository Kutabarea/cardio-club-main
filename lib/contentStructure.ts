import { prisma } from "@/lib/prisma";

const transliteration: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function createContentSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((character) => transliteration[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isSafeContentSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

type ResolveMaterialPlacementInput = {
  categoryId: string;
  type: string;
  ecgSectionId: string;
  videoLectureSectionId: string;
};

type ResolveMaterialPlacementResult =
  | {
      ok: true;
      categoryId: string;
      ecgSectionId: string | null;
      videoLectureSectionId: string | null;
    }
  | {
      ok: false;
      error: "category-not-found" | "invalid-classification";
    };

export async function resolveMaterialPlacement({
  categoryId,
  type,
  ecgSectionId,
  videoLectureSectionId,
}: ResolveMaterialPlacementInput): Promise<ResolveMaterialPlacementResult> {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      subsectionKind: true,
      contentArea: {
        select: {
          materialType: true,
        },
      },
    },
  });

  if (!category || !category.contentArea) {
    return {
      ok: false,
      error: "category-not-found",
    };
  }

  if (category.contentArea.materialType !== type) {
    return {
      ok: false,
      error: "invalid-classification",
    };
  }

  let resolvedEcgSectionId: string | null = null;
  let resolvedVideoLectureSectionId: string | null = null;

  if (category.subsectionKind === "ECG" && ecgSectionId) {
    const section = await prisma.ecgSection.findFirst({
      where: {
        id: ecgSectionId,
        categoryId: category.id,
      },
      select: {
        id: true,
      },
    });

    if (!section) {
      return {
        ok: false,
        error: "invalid-classification",
      };
    }

    resolvedEcgSectionId = section.id;
  }

  if (
    category.subsectionKind === "VIDEO_LECTURE" &&
    videoLectureSectionId
  ) {
    const section =
      await prisma.videoLectureSection.findFirst({
        where: {
          id: videoLectureSectionId,
          categoryId: category.id,
        },
        select: {
          id: true,
        },
      });

    if (!section) {
      return {
        ok: false,
        error: "invalid-classification",
      };
    }

    resolvedVideoLectureSectionId = section.id;
  }

  return {
    ok: true,
    categoryId: category.id,
    ecgSectionId: resolvedEcgSectionId,
    videoLectureSectionId: resolvedVideoLectureSectionId,
  };
}