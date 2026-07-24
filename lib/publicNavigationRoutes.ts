export const PUBLIC_NAVIGATION_CACHE_TAG =
  "public-navigation";

export const PUBLIC_CATEGORY_ROUTES = {
  news: "/",
  "video-lectures": "/videolecture",
  "ecg-base": "/library/base",
  "ecg-trainer": "/library/trainer",
  "pathology-a-z": "/library/pathology",
  "video-courses": "/videocourses",
  literature: "/library/literature",
  "useful-resources": "/library/resources",
} as const;

const PUBLIC_AREA_CATEGORIES = {
  news: ["news"],
  "video-lectures": ["video-lectures"],
  ecg: [
    "ecg-base",
    "ecg-trainer",
    "pathology-a-z",
  ],
  courses: ["video-courses"],
  literature: ["literature"],
  helper: ["useful-resources"],
} as const;

export type PublicNavigationLink = Readonly<{
  key: string;
  title: string;
  href: string;
}>;

export type PublicNavigationItem = Readonly<{
  key: string;
  title: string;
  href: string | null;
  children: readonly PublicNavigationLink[];
}>;

function ownsKey(
  value: object,
  key: PropertyKey,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    value,
    key,
  );
}

export function resolvePublicCategoryHref(
  categorySlug: string,
): string | null {
  if (
    !ownsKey(
      PUBLIC_CATEGORY_ROUTES,
      categorySlug,
    )
  ) {
    return null;
  }

  return PUBLIC_CATEGORY_ROUTES[
    categorySlug as keyof typeof PUBLIC_CATEGORY_ROUTES
  ];
}

export function isPublicAreaCategory(
  areaSlug: string,
  categorySlug: string,
): boolean {
  if (
    !ownsKey(
      PUBLIC_AREA_CATEGORIES,
      areaSlug,
    )
  ) {
    return false;
  }

  const allowedCategories =
    PUBLIC_AREA_CATEGORIES[
      areaSlug as keyof typeof PUBLIC_AREA_CATEGORIES
    ] as readonly string[];

  return allowedCategories.includes(categorySlug);
}

export function resolveVideoLectureSectionHref(
  sectionSlug: string,
): string | null {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      sectionSlug,
    )
  ) {
    return null;
  }

  return (
    "/videolecture#video-section-" +
    sectionSlug
  );
}

export function isSafePublicNavigationHref(
  href: string,
): boolean {
  return (
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(href)
  );
}