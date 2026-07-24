import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  isPublicAreaCategory,
  PUBLIC_NAVIGATION_CACHE_TAG,
  type PublicNavigationItem,
  type PublicNavigationLink,
  resolvePublicCategoryHref,
  resolveVideoLectureSectionHref,
} from "@/lib/publicNavigationRoutes";

type PublicNavigationSourceSection = {
  title: string;
  slug: string;
};

type PublicNavigationSourceCategory = {
  title: string;
  slug: string;
  videoLectureSections:
    PublicNavigationSourceSection[];
};

type PublicNavigationSourceArea = {
  title: string;
  slug: string;
  categories: PublicNavigationSourceCategory[];
};

function normalizeTitle(value: string) {
  return value.trim().slice(0, 120);
}

export function buildPublicNavigation(
  areas: PublicNavigationSourceArea[],
): PublicNavigationItem[] {
  const navigation: PublicNavigationItem[] =
    [];

  for (const area of areas) {
    const areaTitle = normalizeTitle(
      area.title,
    );

    if (!areaTitle) {
      continue;
    }

    const routableCategories =
      area.categories.flatMap((category) => {
        if (
          !isPublicAreaCategory(
            area.slug,
            category.slug,
          )
        ) {
          return [];
        }

        const href =
          resolvePublicCategoryHref(
            category.slug,
          );

        const title = normalizeTitle(
          category.title,
        );

        if (!href || !title) {
          return [];
        }

        return [
          {
            category,
            link: {
              key: `category:${category.slug}`,
              title,
              href,
            } satisfies PublicNavigationLink,
          },
        ];
      });

    if (routableCategories.length === 0) {
      continue;
    }

    if (area.slug === "video-lectures") {
      const lectureCategory =
        routableCategories.find(
          ({ category }) =>
            category.slug ===
            "video-lectures",
        );

      if (!lectureCategory) {
        continue;
      }

      const lectureSections =
        lectureCategory.category
          .videoLectureSections
          .flatMap((section) => {
            const href =
              resolveVideoLectureSectionHref(
                section.slug,
              );

            const title = normalizeTitle(
              section.title,
            );

            if (!href || !title) {
              return [];
            }

            return [
              {
                key: `video-section:${section.slug}`,
                title,
                href,
              } satisfies PublicNavigationLink,
            ];
          });

      navigation.push({
        key: `area:${area.slug}`,
        title: areaTitle,
        href: lectureCategory.link.href,
        children: lectureSections,
      });

      continue;
    }

    if (routableCategories.length === 1) {
      navigation.push({
        key: `area:${area.slug}`,
        title: areaTitle,
        href:
          routableCategories[0].link.href,
        children: [],
      });

      continue;
    }

    navigation.push({
      key: `area:${area.slug}`,
      title: areaTitle,
      href: null,
      children: routableCategories.map(
        ({ link }) => link,
      ),
    });
  }

  return navigation;
}

export async function loadPublicNavigationUncached() {
  const areas =
    await prisma.contentArea.findMany({
      where: {
        isActive: true,
      },
      select: {
        title: true,
        slug: true,
        categories: {
          where: {
            isActive: true,
          },
          select: {
            title: true,
            slug: true,
            videoLectureSections: {
              where: {
                isActive: true,
              },
              select: {
                title: true,
                slug: true,
              },
              orderBy: [
                {
                  sortOrder: "asc",
                },
                {
                  title: "asc",
                },
              ],
            },
          },
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              title: "asc",
            },
          ],
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
    });

  return buildPublicNavigation(areas);
}

const loadPublicNavigationCached =
  unstable_cache(
    loadPublicNavigationUncached,
    ["public-navigation-v1"],
    {
      revalidate: 300,
      tags: [
        PUBLIC_NAVIGATION_CACHE_TAG,
      ],
    },
  );

export async function getPublicNavigation() {
  return loadPublicNavigationCached();
}