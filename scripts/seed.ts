import "dotenv/config";
import { prisma } from "../lib/prisma";

const libraryCategories = [
  {
    title: "ЭКГ база",
    slug: "ecg-base",
    description:
      "Вся база ЭКГ, которую надо знать врачу. Зубцы, сегменты, интервалы, патологии, реальные примеры и клиническая интерпретация.",
  },
  {
    title: "ЭКГ тренажёр",
    slug: "ecg-trainer",
    description:
      "Плёнки разного уровня для проверки себя. Расшифровки с подробными объяснениями после каждой плёнки.",
  },
  {
    title: "Патология от А до Я",
    slug: "pathology-a-z",
    description:
      "Интерпретация ЭКГ в клиническом контексте. Диагнозы и примеры плёнок.",
  },
  {
    title: "Полезные ресурсы",
    slug: "useful-resources",
    description:
      "Блоги, книги, статьи и сайты для более глубокого изучения и понимания ЭКГ.",
  },
];

const materials = [
  {
    title: "Частота ЭКГ",
    slug: "ecg-frequency",
    description: "Как правильно считать частоту сердечных сокращений по ЭКГ.",
    content:
      "Материал объясняет базовые способы подсчёта ЧСС по электрокардиограмме.",
    type: "ECG_ARTICLE",
    imageUrl: "/images/materials__img__1.png",
    isPremium: false,
    isPublished: true,
    categorySlug: "ecg-base",
  },
  {
    title: "Интервалы на ЭКГ",
    slug: "ecg-intervals",
    description: "PR, QRS, QT и другие интервалы: что оценивать и зачем.",
    content:
      "Разбор основных интервалов ЭКГ, их нормы и клинического значения.",
    type: "ECG_ARTICLE",
    imageUrl: "/images/materials__img__2.png",
    isPremium: false,
    isPublished: true,
    categorySlug: "ecg-base",
  },
  {
    title: "ЭКГ при неотложной помощи",
    slug: "ecg-emergency",
    description: "ЭКГ-признаки, которые нельзя пропустить в экстренной ситуации.",
    content:
      "Материал про опасные изменения на ЭКГ при острых состояниях.",
    type: "ECG_ARTICLE",
    imageUrl: "/images/materials__img__3.png",
    isPremium: true,
    isPublished: true,
    categorySlug: "ecg-base",
  },
  {
    title: "Фармакология",
    slug: "pharmacology",
    description:
      "База кардиофармакологии: механизмы действия препаратов, алгоритмы и дозы.",
    content:
      "Видеолекции по основным группам препаратов, применяемых в кардиологии.",
    type: "VIDEO_LECTURE",
    imageUrl: "/images/videolecture__img__1.png",
    videoUrl: null,
    isPremium: false,
    isPublished: true,
    categorySlug: "useful-resources",
  },
  {
    title: "Пульмонология и ТЭЛА",
    slug: "pulmonology-and-pe",
    description:
      "ТЭЛА, ХОБЛ, бронхиальная астма, пневмония: диагностика и лечение.",
    content:
      "Видеолекция по смежным состояниям, важным для кардиологической практики.",
    type: "VIDEO_LECTURE",
    imageUrl: "/images/videolecture__img__2.png",
    videoUrl: null,
    isPremium: false,
    isPublished: true,
    categorySlug: "useful-resources",
  },
  {
    title: "ЭКГ и аритмии",
    slug: "ecg-and-arrhythmias",
    description:
      "Лекции по ЭКГ и аритмиям от базы до сложных патологий простым языком.",
    content:
      "Курс материалов по нарушениям ритма и их ЭКГ-признакам.",
    type: "VIDEO_LECTURE",
    imageUrl: "/images/videolecture__img__3.png",
    videoUrl: null,
    isPremium: true,
    isPublished: true,
    categorySlug: "ecg-base",
  },
];

async function main() {
  for (const category of libraryCategories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        title: category.title,
        description: category.description,
      },
      create: category,
    });
  }

  for (const material of materials) {
    const category = await prisma.category.findUnique({
      where: {
        slug: material.categorySlug,
      },
    });

    if (!category) {
      throw new Error(`Категория не найдена: ${material.categorySlug}`);
    }

    await prisma.material.upsert({
      where: {
        slug: material.slug,
      },
      update: {
        title: material.title,
        description: material.description,
        content: material.content,
        type: material.type,
        imageUrl: material.imageUrl,
        videoUrl: material.videoUrl,
        isPremium: material.isPremium,
        isPublished: material.isPublished,
        categoryId: category.id,
      },
      create: {
        title: material.title,
        slug: material.slug,
        description: material.description,
        content: material.content,
        type: material.type,
        imageUrl: material.imageUrl,
        videoUrl: material.videoUrl,
        isPremium: material.isPremium,
        isPublished: material.isPublished,
        categoryId: category.id,
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });