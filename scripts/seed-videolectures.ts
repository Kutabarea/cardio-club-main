import "dotenv/config";
import { prisma } from "../lib/prisma";

const videoLectures = [
  {
    title: "Фармакология",
    slug: "pharmacology",
    description:
      "База кардиофармакологии: механизмы действия препаратов, алгоритмы и дозы.",
    content:
      "Видеолекция по основным группам препаратов, применяемых в кардиологии. Здесь позже будет полноценное описание лекции, таймкоды, вложенные материалы и ссылка на видео.",
    imageUrl: "/images/videolecture__img__1.png",
    isPremium: false,
  },
  {
    title: "Пульмонология и ТЭЛА",
    slug: "pulmonology-and-pe",
    description:
      "ТЭЛА, ХОБЛ, бронхиальная астма, пневмония: диагностика и лечение.",
    content:
      "Лекция по состояниям, которые часто пересекаются с кардиологической практикой.",
    imageUrl: "/images/videolecture__img__2.png",
    isPremium: false,
  },
  {
    title: "ЭКГ и аритмии",
    slug: "ecg-and-arrhythmias",
    description:
      "Лекции по ЭКГ и аритмиям от базы до сложных патологий простым языком.",
    content:
      "Курс лекций по нарушениям ритма, проводимости и их ЭКГ-признакам.",
    imageUrl: "/images/videolecture__img__3.png",
    isPremium: true,
  },
  {
    title: "Сердечная недостаточность",
    slug: "heart-failure",
    description:
      "Диагностика, классификация и базовая терапия сердечной недостаточности.",
    content:
      "Материал по хронической и острой сердечной недостаточности, симптомам, обследованию и лечению.",
    imageUrl: "/images/videolecture__img__4.png",
    isPremium: true,
  },
  {
    title: "Артериальная гипертензия",
    slug: "arterial-hypertension",
    description:
      "Разбор диагностики, стратификации риска и лечения гипертонической болезни.",
    content:
      "Лекция по гипертонической болезни, факторам риска, целевым значениям давления и терапии.",
    imageUrl: "/images/videolecture__img__5.png",
    isPremium: false,
  },
  {
    title: "Острый коронарный синдром",
    slug: "acute-coronary-syndrome",
    description:
      "Клиника, ЭКГ-признаки, маршрутизация и базовая тактика при ОКС.",
    content:
      "Лекция по инфаркту миокарда, нестабильной стенокардии и неотложным решениям.",
    imageUrl: "/images/videolecture__img__6.png",
    isPremium: true,
  },
];

async function main() {
  const category = await prisma.category.upsert({
    where: {
      slug: "video-lectures",
    },
    update: {
      title: "Видеолекции",
      description: "Образовательные видеолекции по кардиологии.",
    },
    create: {
      title: "Видеолекции",
      slug: "video-lectures",
      description: "Образовательные видеолекции по кардиологии.",
    },
  });

  for (const lecture of videoLectures) {
    await prisma.material.upsert({
      where: {
        slug: lecture.slug,
      },
      update: {
        title: lecture.title,
        description: lecture.description,
        content: lecture.content,
        type: "VIDEO_LECTURE",
        imageUrl: lecture.imageUrl,
        videoUrl: null,
        isPremium: lecture.isPremium,
        isPublished: true,
        categoryId: category.id,
      },
      create: {
        title: lecture.title,
        slug: lecture.slug,
        description: lecture.description,
        content: lecture.content,
        type: "VIDEO_LECTURE",
        imageUrl: lecture.imageUrl,
        videoUrl: null,
        isPremium: lecture.isPremium,
        isPublished: true,
        categoryId: category.id,
      },
    });
  }

  console.log("Video lectures seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });