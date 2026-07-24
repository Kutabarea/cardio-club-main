import "dotenv/config";

import { prisma } from "@/lib/prisma";

const areas = [
  {
    title: "Новости",
    slug: "news",
    description: "Новости Cardio Club и профессиональные обновления.",
    materialType: "NEWS",
    sortOrder: 10,
  },
  {
    title: "Видеолекции",
    slug: "video-lectures",
    description: "Образовательные видеолекции по кардиологии.",
    materialType: "VIDEO_LECTURE",
    sortOrder: 20,
  },
  {
    title: "ЭКГ",
    slug: "ecg",
    description: "База ЭКГ, тренажёр и клинические патологии.",
    materialType: "ECG_ARTICLE",
    sortOrder: 30,
  },
  {
    title: "Курсы",
    slug: "courses",
    description: "Полноценные обучающие курсы.",
    materialType: "VIDEO_COURSE",
    sortOrder: 40,
  },
  {
    title: "Литература",
    slug: "literature",
    description: "Книги, рекомендации и образовательные материалы.",
    materialType: "LITERATURE",
    sortOrder: 50,
  },
  {
    title: "Помощник кардиолога",
    slug: "helper",
    description: "Справочные материалы и инструменты.",
    materialType: "HELPER",
    sortOrder: 60,
  },
] as const;

const categories = [
  {
    areaSlug: "news",
    title: "Новости",
    slug: "news",
    description: "Новости и обновления.",
    subsectionKind: "NONE",
    sortOrder: 10,
  },
  {
    areaSlug: "video-lectures",
    title: "Видеолекции",
    slug: "video-lectures",
    description: "Образовательные видеолекции.",
    subsectionKind: "VIDEO_LECTURE",
    sortOrder: 10,
  },
  {
    areaSlug: "ecg",
    title: "ЭКГ база",
    slug: "ecg-base",
    description: "Основные материалы по ЭКГ.",
    subsectionKind: "ECG",
    sortOrder: 10,
  },
  {
    areaSlug: "ecg",
    title: "ЭКГ тренажёр",
    slug: "ecg-trainer",
    description: "Практические задания по ЭКГ.",
    subsectionKind: "NONE",
    sortOrder: 20,
  },
  {
    areaSlug: "ecg",
    title: "Патология от А до Я",
    slug: "pathology-a-z",
    description: "Кардиологические патологии и синдромы.",
    subsectionKind: "NONE",
    sortOrder: 30,
  },
  {
    areaSlug: "courses",
    title: "Курсы",
    slug: "video-courses",
    description: "Обучающие курсы.",
    subsectionKind: "NONE",
    sortOrder: 10,
  },
  {
    areaSlug: "literature",
    title: "Литература",
    slug: "literature",
    description: "Литература для врачей.",
    subsectionKind: "NONE",
    sortOrder: 10,
  },
  {
    areaSlug: "helper",
    title: "Полезные ресурсы",
    slug: "useful-resources",
    description: "Справочные материалы и инструменты.",
    subsectionKind: "NONE",
    sortOrder: 10,
  },
] as const;

async function main() {
  const areaIds = new Map<string, string>();

  for (const area of areas) {
    const record = await prisma.contentArea.upsert({
      where: {
        slug: area.slug,
      },
      update: {
        title: area.title,
        description: area.description,
        materialType: area.materialType,
        sortOrder: area.sortOrder,
        isActive: true,
      },
      create: {
        ...area,
        isActive: true,
      },
    });

    areaIds.set(area.slug, record.id);
  }

  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const contentAreaId =
      areaIds.get(category.areaSlug);

    if (!contentAreaId) {
      throw new Error(
        `Content area not found: ${category.areaSlug}`,
      );
    }

    const record = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        contentAreaId,
        title: category.title,
        description: category.description,
        subsectionKind: category.subsectionKind,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        contentAreaId,
        title: category.title,
        slug: category.slug,
        description: category.description,
        subsectionKind: category.subsectionKind,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });

    categoryIds.set(category.slug, record.id);
  }

  const ecgBaseCategoryId =
    categoryIds.get("ecg-base");

  const videoLectureCategoryId =
    categoryIds.get("video-lectures");

  if (
    !ecgBaseCategoryId ||
    !videoLectureCategoryId
  ) {
    throw new Error(
      "Required categories were not created.",
    );
  }

  await prisma.ecgSection.updateMany({
    where: {
      categoryId: null,
    },
    data: {
      categoryId: ecgBaseCategoryId,
      isActive: true,
    },
  });

  await prisma.videoLectureSection.updateMany({
    where: {
      categoryId: null,
    },
    data: {
      categoryId: videoLectureCategoryId,
      isActive: true,
    },
  });

  console.log("");
  console.log("Структура контента перенесена.");
  console.log(`Разделов сайта: ${areas.length}`);
  console.log(`Категорий: ${categories.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });