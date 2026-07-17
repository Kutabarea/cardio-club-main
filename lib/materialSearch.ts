import type { Prisma } from "@prisma/client";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 100;
export const SEARCH_QUERY_MAX_TERMS = 10;
export const SEARCH_RESULT_LIMIT = 40;
export const SEARCH_CANDIDATE_LIMIT = 300;

export type SearchQueryErrorCode =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "TOO_MANY_TERMS";

export type ParsedSearchQuery = {
  raw: string;
  normalized: string;
  terms: string[];
  isEmpty: boolean;
  isValid: boolean;
  error: SearchQueryErrorCode | null;
};

export type MaterialSearchResult = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  typeLabel: string;
  isPremium: boolean;
  category: {
    title: string;
    slug: string;
  } | null;
  href: string;
};

export type MaterialSearchResponse = {
  query: ParsedSearchQuery;
  results: MaterialSearchResult[];
  totalMatches: number;
  isLimited: boolean;
};

const MATERIAL_TYPE_LABELS: Readonly<Record<string, string>> = {
  ECG_ARTICLE: "Статья ЭКГ",
  VIDEO_LECTURE: "Видеолекция",
  VIDEO_COURSE: "Видеокурс",
  HELPER: "Помощник кардиолога",
};

const MATERIAL_TYPE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  видео: ["VIDEO_LECTURE", "VIDEO_COURSE"],
  video: ["VIDEO_LECTURE", "VIDEO_COURSE"],

  видеолекция: ["VIDEO_LECTURE"],
  видеолекции: ["VIDEO_LECTURE"],
  лекция: ["VIDEO_LECTURE"],
  лекции: ["VIDEO_LECTURE"],

  видеокурс: ["VIDEO_COURSE"],
  видеокурсы: ["VIDEO_COURSE"],
  курс: ["VIDEO_COURSE"],
  курсы: ["VIDEO_COURSE"],

  экг: ["ECG_ARTICLE"],
  статья: ["ECG_ARTICLE"],
  статьи: ["ECG_ARTICLE"],

  помощник: ["HELPER"],
  helper: ["HELPER"],
};

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^0-9a-zа-я]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSearchQuery(value: unknown): ParsedSearchQuery {
  const raw =
    typeof value === "string"
      ? value.replace(/\s+/g, " ").trim()
      : "";

  if (!raw) {
    return {
      raw: "",
      normalized: "",
      terms: [],
      isEmpty: true,
      isValid: true,
      error: null,
    };
  }

  if (raw.length > SEARCH_QUERY_MAX_LENGTH) {
    return {
      raw,
      normalized: "",
      terms: [],
      isEmpty: false,
      isValid: false,
      error: "TOO_LONG",
    };
  }

  const normalized = normalizeSearchText(raw);
  const terms = normalized ? normalized.split(" ") : [];

  if (normalized.length < SEARCH_QUERY_MIN_LENGTH) {
    return {
      raw,
      normalized,
      terms,
      isEmpty: false,
      isValid: false,
      error: "TOO_SHORT",
    };
  }

  if (terms.length > SEARCH_QUERY_MAX_TERMS) {
    return {
      raw,
      normalized,
      terms,
      isEmpty: false,
      isValid: false,
      error: "TOO_MANY_TERMS",
    };
  }

  return {
    raw,
    normalized,
    terms,
    isEmpty: false,
    isValid: true,
    error: null,
  };
}

export function getSearchQueryErrorMessage(
  error: SearchQueryErrorCode | null,
) {
  if (error === "TOO_SHORT") {
    return `Введите минимум ${SEARCH_QUERY_MIN_LENGTH} символа.`;
  }

  if (error === "TOO_LONG") {
    return `Запрос слишком длинный. Максимум ${SEARCH_QUERY_MAX_LENGTH} символов.`;
  }

  if (error === "TOO_MANY_TERMS") {
    return `В запросе должно быть не более ${SEARCH_QUERY_MAX_TERMS} слов.`;
  }

  return null;
}

export function getMaterialTypeLabel(type: string) {
  return MATERIAL_TYPE_LABELS[type] ?? "Материал";
}

function getSearchVariants(term: string) {
  const firstCharacter = term.slice(0, 1);
  const remainingCharacters = term.slice(1);

  return Array.from(
    new Set([
      term,
      term.toLocaleUpperCase("ru-RU"),
      `${firstCharacter.toLocaleUpperCase("ru-RU")}${remainingCharacters}`,
    ]),
  );
}

function getMatchingMaterialTypes(term: string) {
  return [...(MATERIAL_TYPE_ALIASES[term] ?? [])];
}

function createTermFilter(term: string): Prisma.MaterialWhereInput {
  const filters: Prisma.MaterialWhereInput[] = [];

  for (const variant of getSearchVariants(term)) {
    filters.push(
      {
        title: {
          contains: variant,
        },
      },
      {
        description: {
          contains: variant,
        },
      },
      {
        content: {
          contains: variant,
        },
      },
      {
        category: {
          title: {
            contains: variant,
          },
        },
      },
    );
  }

  const matchingTypes = getMatchingMaterialTypes(term);

  if (matchingTypes.length > 0) {
    filters.push({
      type: {
        in: matchingTypes,
      },
    });
  }

  return {
    OR: filters,
  };
}

function includesTerm(value: string | null | undefined, term: string) {
  return normalizeSearchText(value ?? "").includes(term);
}

function calculateRelevanceScore(
  material: {
    title: string;
    description: string | null;
    content: string | null;
    type: string;
    category: {
      title: string;
      slug: string;
    } | null;
  },
  query: ParsedSearchQuery,
) {
  const normalizedTitle = normalizeSearchText(material.title);
  const normalizedDescription = normalizeSearchText(
    material.description ?? "",
  );
  const normalizedContent = normalizeSearchText(material.content ?? "");
  const normalizedCategory = normalizeSearchText(
    material.category?.title ?? "",
  );
  const normalizedType = normalizeSearchText(
    `${material.type} ${getMaterialTypeLabel(material.type)}`,
  );

  let score = 0;

  if (normalizedTitle === query.normalized) {
    score += 1000;
  } else if (normalizedTitle.startsWith(query.normalized)) {
    score += 600;
  } else if (normalizedTitle.includes(query.normalized)) {
    score += 350;
  }

  if (normalizedCategory === query.normalized) {
    score += 250;
  }

  if (normalizedType.includes(query.normalized)) {
    score += 200;
  }

  for (const term of query.terms) {
    if (normalizedTitle === term) {
      score += 150;
    } else if (normalizedTitle.startsWith(term)) {
      score += 100;
    } else if (normalizedTitle.includes(term)) {
      score += 70;
    }

    if (normalizedCategory.includes(term)) {
      score += 40;
    }

    if (normalizedType.includes(term)) {
      score += 35;
    }

    if (normalizedDescription.includes(term)) {
      score += 20;
    }

    if (normalizedContent.includes(term)) {
      score += 5;
    }
  }

  return score;
}

export async function searchPublishedMaterials(
  value: unknown,
): Promise<MaterialSearchResponse> {
  const query = parseSearchQuery(value);

  if (query.isEmpty || !query.isValid) {
    return {
      query,
      results: [],
      totalMatches: 0,
      isLimited: false,
    };
  }

  const candidates = await prisma.material.findMany({
    where: {
      isPublished: true,
      AND: query.terms.map(createTermFilter),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      type: true,
      isPremium: true,
      updatedAt: true,
      category: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        id: "asc",
      },
    ],
    take: SEARCH_CANDIDATE_LIMIT,
  });

  const rankedResults = candidates
    .map((material) => {
      const href = getMaterialPublicHref(material);

      if (!href) {
        return null;
      }

      const score = calculateRelevanceScore(material, query);

      const result: MaterialSearchResult = {
        id: material.id,
        title: material.title,
        description: material.description,
        type: material.type,
        typeLabel: getMaterialTypeLabel(material.type),
        isPremium: material.isPremium,
        category: material.category,
        href,
      };

      return {
        result,
        score,
        updatedAt: material.updatedAt.getTime(),
      };
    })
    .filter(
      (
        item,
      ): item is {
        result: MaterialSearchResult;
        score: number;
        updatedAt: number;
      } => item !== null,
    )
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.updatedAt - left.updatedAt;
    });

  const totalMatches = rankedResults.length;
  const results = rankedResults
    .slice(0, SEARCH_RESULT_LIMIT)
    .map((item) => item.result);

  return {
    query,
    results,
    totalMatches,
    isLimited: totalMatches > results.length,
  };
}

export function searchResultContainsProtectedFields(
  result: MaterialSearchResult,
) {
  const record = result as unknown as Record<string, unknown>;

  return (
    Object.prototype.hasOwnProperty.call(record, "content") ||
    Object.prototype.hasOwnProperty.call(record, "videoUrl") ||
    Object.prototype.hasOwnProperty.call(record, "isPublished")
  );
}