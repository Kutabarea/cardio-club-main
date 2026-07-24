import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import {
  loadPublicNavigationUncached,
} from "@/lib/publicNavigation";
import {
  isSafePublicNavigationHref,
  PUBLIC_CATEGORY_ROUTES,
  resolvePublicCategoryHref,
  resolveVideoLectureSectionHref,
} from "@/lib/publicNavigationRoutes";
import { prisma } from "@/lib/prisma";

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readFile(...parts: string[]) {
  return fs.readFileSync(
    path.join(process.cwd(), ...parts),
    "utf8",
  );
}

async function main() {
  for (
    const [slug, expectedHref]
    of Object.entries(
      PUBLIC_CATEGORY_ROUTES,
    )
  ) {
    assertCondition(
      resolvePublicCategoryHref(slug) ===
        expectedHref,
      `Неверный маршрут категории: ${slug}`,
    );
  }

  assertCondition(
    resolvePublicCategoryHref(
      "unknown-category",
    ) === null,
    "Неизвестная категория не была скрыта.",
  );

  assertCondition(
    resolveVideoLectureSectionHref(
      "safe-section",
    ) ===
      "/videolecture#video-section-safe-section",
    "Безопасный якорь видеолекции не построен.",
  );

  assertCondition(
    resolveVideoLectureSectionHref(
      "../unsafe",
    ) === null,
    "Небезопасный slug видеолекции не был отклонён.",
  );

  const navigation =
    await loadPublicNavigationUncached();

  const keys = new Set<string>();
  let linkCount = 0;

  for (const item of navigation) {
    assertCondition(
      !keys.has(item.key),
      `Повторяется ключ меню: ${item.key}`,
    );

    keys.add(item.key);

    assertCondition(
      item.title.trim().length > 0,
      `Пустой заголовок меню: ${item.key}`,
    );

    if (item.href) {
      assertCondition(
        isSafePublicNavigationHref(
          item.href,
        ),
        `Небезопасный маршрут: ${item.href}`,
      );

      linkCount += 1;
    }

    assertCondition(
      Boolean(item.href) ||
        item.children.length > 0,
      `Пункт меню не имеет маршрута: ${item.key}`,
    );

    for (const child of item.children) {
      assertCondition(
        !keys.has(child.key),
        `Повторяется ключ меню: ${child.key}`,
      );

      keys.add(child.key);

      assertCondition(
        child.title.trim().length > 0,
        `Пустой заголовок: ${child.key}`,
      );

      assertCondition(
        isSafePublicNavigationHref(
          child.href,
        ),
        `Небезопасный маршрут: ${child.href}`,
      );

      linkCount += 1;
    }
  }

  const header = readFile(
    "app",
    "components",
    "Header.tsx",
  );

  const headerClient = readFile(
    "app",
    "components",
    "HeaderClient.tsx",
  );

  const structureActions = readFile(
    "app",
    "admin",
    "content-structure",
    "actions.ts",
  );

  const videoSectionActions = readFile(
    "app",
    "admin",
    "video-lecture-sections",
    "actions.ts",
  );

  assertCondition(
    !header.includes('"use client"'),
    "Header должен оставаться серверным компонентом.",
  );

  assertCondition(
    header.includes(
      "getPublicNavigation",
    ),
    "Header не загружает публичную навигацию.",
  );

  assertCondition(
    !headerClient.includes("prisma."),
    "Клиентская шапка не должна обращаться к Prisma.",
  );

  assertCondition(
    structureActions.includes(
      "updateTag(PUBLIC_NAVIGATION_CACHE_TAG)",
    ),
    "Структура не сбрасывает кэш навигации.",
  );

  assertCondition(
    videoSectionActions.includes(
      "updateTag(PUBLIC_NAVIGATION_CACHE_TAG)",
    ),
    "Тематики лекций не сбрасывают кэш навигации.",
  );

  const orphanVideoSections =
    await prisma.videoLectureSection.count({
      where: {
        categoryId: null,
      },
    });

  assertCondition(
    orphanVideoSections === 0,
    "Есть тематики видеолекций без категории.",
  );

  console.log("");
  console.log("Public navigation audit");
  console.log("-----------------------");
  console.log(
    `Пунктов верхнего меню: ${navigation.length}`,
  );
  console.log(
    `Безопасных ссылок: ${linkCount}`,
  );
  console.log("Серверная загрузка: OK");
  console.log("Карта маршрутов: OK");
  console.log("Сброс кэша: OK");
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Unknown public navigation error",
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });