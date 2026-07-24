import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

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
  const areas = await prisma.contentArea.findMany({
    include: {
      categories: true,
    },
  });

  const requiredAreaSlugs = [
    "news",
    "video-lectures",
    "ecg",
    "courses",
    "literature",
    "helper",
  ];

  for (const slug of requiredAreaSlugs) {
    assertCondition(
      areas.some((area) => area.slug === slug),
      `Не найден раздел сайта: ${slug}`,
    );
  }

  const categoriesWithoutArea =
    await prisma.category.count({
      where: {
        contentAreaId: null,
      },
    });

  assertCondition(
    categoriesWithoutArea === 0,
    "Найдены категории без верхнего раздела.",
  );

  const ecgSectionsWithoutCategory =
    await prisma.ecgSection.count({
      where: {
        categoryId: null,
      },
    });

  assertCondition(
    ecgSectionsWithoutCategory === 0,
    "Найдены подразделы ЭКГ без категории.",
  );

  const videoSectionsWithoutCategory =
    await prisma.videoLectureSection.count({
      where: {
        categoryId: null,
      },
    });

  assertCondition(
    videoSectionsWithoutCategory === 0,
    "Найдены тематики видеолекций без категории.",
  );

  const materials = await prisma.material.findMany({
    select: {
      id: true,
      type: true,
      categoryId: true,
      ecgSectionId: true,
      videoLectureSectionId: true,
      category: {
        select: {
          subsectionKind: true,
          contentArea: {
            select: {
              materialType: true,
            },
          },
        },
      },
      ecgSection: {
        select: {
          categoryId: true,
        },
      },
      videoLectureSection: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  for (const material of materials) {
    assertCondition(
      material.category?.contentArea,
      `Материал ${material.id} находится вне структуры.`,
    );

    assertCondition(
      material.category.contentArea.materialType ===
        material.type,
      `Тип материала ${material.id} не соответствует разделу.`,
    );

    if (material.ecgSectionId) {
      assertCondition(
        material.ecgSection?.categoryId ===
          material.categoryId,
        `Подраздел ЭКГ материала ${material.id} принадлежит другой категории.`,
      );
    }

    if (material.videoLectureSectionId) {
      assertCondition(
        material.videoLectureSection?.categoryId ===
          material.categoryId,
        `Раздел видеолекции материала ${material.id} принадлежит другой категории.`,
      );
    }
  }

  const adminShell = readFile(
    "app",
    "admin",
    "AdminShell.tsx",
  );

  const materialFields = readFile(
    "app",
    "admin",
    "materials",
    "MaterialSectionFields.tsx",
  );

  assertCondition(
    adminShell.includes(
      "/admin/content-structure",
    ),
    "В меню отсутствует единая страница структуры.",
  );

  assertCondition(
    !adminShell.includes(
      'title: "ЭКГ-база"',
    ),
    "В меню осталась старая группа ЭКГ.",
  );

  assertCondition(
    materialFields.includes(
      "contentAreas",
    ),
    "Форма материала не использует динамические разделы.",
  );

  assertCondition(
    !materialFields.includes(
      "MATERIAL_NAVIGATION_SECTIONS",
    ),
    "В форме осталась захардкоженная структура.",
  );

  console.log("");
  console.log("Content structure audit");
  console.log("-----------------------");
  console.log(`Разделов сайта: ${areas.length}`);
  console.log("Категории привязаны: OK");
  console.log("Подразделы ЭКГ привязаны: OK");
  console.log("Тематики видеолекций привязаны: OK");
  console.log("Материалы согласованы: OK");
  console.log("Админское меню: OK");
  console.log("Динамическая форма: OK");
  console.log("");
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Unknown content structure error",
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });