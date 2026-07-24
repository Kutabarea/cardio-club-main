import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";

async function main() {
  const [categories, ecgSections, videoLectureSections, materials] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
        },
      }),

      prisma.ecgSection.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            title: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          sortOrder: true,
        },
      }),

      prisma.videoLectureSection.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            title: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          sortOrder: true,
        },
      }),

      prisma.material.findMany({
        orderBy: [
          {
            type: "asc",
          },
          {
            sortOrder: "asc",
          },
          {
            title: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          type: true,
          imageUrl: true,
          videoUrl: true,
          isPremium: true,
          isPublished: true,
          sortOrder: true,
          categoryId: true,
          ecgSectionId: true,
          videoLectureSectionId: true,
          category: {
            select: {
              title: true,
              slug: true,
            },
          },
          ecgSection: {
            select: {
              title: true,
              slug: true,
            },
          },
          videoLectureSection: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),
    ]);

  const exportData = {
    generatedAt: new Date().toISOString(),
    categories,
    ecgSections,
    videoLectureSections,
    materials,
  };

  const outputPath = path.join(
    process.cwd(),
    "cardio-content-export.json",
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(exportData, null, 2),
    "utf8",
  );

  console.log(`Экспорт создан: ${outputPath}`);
  console.log(`Категорий: ${categories.length}`);
  console.log(`Разделов ЭКГ: ${ecgSections.length}`);
  console.log(
    `Разделов видеолекций: ${videoLectureSections.length}`,
  );
  console.log(`Материалов: ${materials.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });