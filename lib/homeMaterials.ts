import { sanitizeAssetUrl } from "@/lib/contentSecurity";
import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

export type HomeMaterialCard = {
  id: string;
  href: string;
  imageUrl: string;
  fallbackImageUrl: string;
  typeLabel: string;
  title: string;
  description: string;
  categoryTitle: string;
  isPremium: boolean;
};

type MaterialForHome = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  type: string;
  isPremium: boolean;
  category: {
    slug: string;
    title: string;
  } | null;
};

function getMaterialTypeLabel(type: string) {
  if (type === "VIDEO_LECTURE") return "Видео";
  if (type === "VIDEO_COURSE") return "Курс";
  if (type === "HELPER") return "Ресурс";
  if (type === "ECG_ARTICLE") return "Статья";

  return "Материал";
}

function getFallbackImage(type: string, index: number) {
  if (type === "VIDEO_LECTURE" || type === "VIDEO_COURSE") {
    return `/images/videolecture__img__${(index % 3) + 1}.png`;
  }

  return `/images/materials__img__${(index % 3) + 1}.png`;
}

function normalizeStoredImageUrl(value?: string | null) {
  if (!value) return null;

  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  if (
    trimmedValue.startsWith("uploads/") ||
    trimmedValue.startsWith("images/")
  ) {
    return `/${trimmedValue}`;
  }

  if (
    trimmedValue.startsWith("public/uploads/") ||
    trimmedValue.startsWith("public/images/")
  ) {
    return trimmedValue.replace(/^public/i, "");
  }

  return trimmedValue;
}

function getSafeImageUrl(value?: string | null) {
  const normalizedValue = normalizeStoredImageUrl(value);

  if (!normalizedValue) return null;

  return sanitizeAssetUrl(normalizedValue);
}

function extractFirstContentImage(content?: string | null) {
  if (!content) return null;

  const markdownImageMatch = content.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  const htmlImageMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const imageUrl = markdownImageMatch?.[1] || htmlImageMatch?.[1] || null;

  return getSafeImageUrl(imageUrl);
}

function stripMarkdown(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`>]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getShortDescription(material: MaterialForHome) {
  const source = material.description || material.content || "";
  const text = stripMarkdown(source);

  if (!text) {
    return "Материал Cardio Club.";
  }

  return text.length > 155 ? `${text.slice(0, 155).trim()}...` : text;
}

function getMaterialImage(material: MaterialForHome, index: number) {
  const fallbackImageUrl = getFallbackImage(material.type, index);
  const directImage = getSafeImageUrl(material.imageUrl);

  if (directImage) {
    return {
      imageUrl: directImage,
      fallbackImageUrl,
    };
  }

  const contentImage = extractFirstContentImage(material.content);

  if (contentImage) {
    return {
      imageUrl: contentImage,
      fallbackImageUrl,
    };
  }

  return {
    imageUrl: fallbackImageUrl,
    fallbackImageUrl,
  };
}

export async function getLatestHomeMaterials(take = 12): Promise<HomeMaterialCard[]> {
  const materials = await prisma.material.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    take: take * 3,
    include: {
      category: {
        select: {
          slug: true,
          title: true,
        },
      },
    },
  });

  return materials
    .map((material, index) => {
      const href = getMaterialPublicHref(material);

      if (!href) {
        return null;
      }

      const image = getMaterialImage(material, index);

      return {
        id: material.id,
        href,
        imageUrl: image.imageUrl,
        fallbackImageUrl: image.fallbackImageUrl,
        typeLabel: getMaterialTypeLabel(material.type),
        title: material.title,
        description: getShortDescription(material),
        categoryTitle: material.category?.title || "Cardio Club",
        isPremium: material.isPremium,
      };
    })
    .filter((item): item is HomeMaterialCard => Boolean(item))
    .slice(0, take);
}