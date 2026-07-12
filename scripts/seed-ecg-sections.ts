import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

const sections = [
  {
    title: "Основы ЭКГ",
    slug: "ecg-basics",
    description: "Частота, ритм, электрическая ось, расположение электродов и базовая интерпретация.",
    sortOrder: 10,
    keywords: [
      "частота",
      "ритм",
      "ось",
      "электрод",
      "интерпретация",
      "детской",
      "неотложной",
      "v1",
      "v2",
    ],
  },
  {
    title: "Зубцы и волны",
    slug: "ecg-waves",
    description: "Зубцы P, Q, R, S, T, U, дельта-волна, эпсилон-волна и другие элементы ЭКГ.",
    sortOrder: 20,
    keywords: [
      "зубец",
      "зубцы",
      "волна",
      "дельта",
      "эпсилон",
      "осборна",
    ],
  },
  {
    title: "Интервалы и сегменты",
    slug: "ecg-intervals-segments",
    description: "PR, QT, ST, точка J и другие интервалы и сегменты.",
    sortOrder: 30,
    keywords: [
      "интервал",
      "сегмент",
      "точка j",
      "pr",
      "qt",
      "st",
    ],
  },
  {
    title: "Комплексы и отведения",
    slug: "ecg-complexes-leads",
    description: "Комплекс QRS, грудные отведения и особенности регистрации.",
    sortOrder: 40,
    keywords: [
      "qrs",
      "комплекс",
      "отведение",
    ],
  },
  {
    title: "Перегрузки и гипертрофии",
    slug: "ecg-hypertrophy",
    description: "Увеличение предсердий, гипертрофии и признаки перегрузки камер сердца.",
    sortOrder: 50,
    keywords: [
      "предсерд",
      "гипертроф",
      "увеличение",
      "перегруз",
    ],
  },
  {
    title: "Клиническая интерпретация",
    slug: "ecg-clinical-interpretation",
    description: "Неотложные состояния, патологии, клинические сценарии и итоговая интерпретация.",
    sortOrder: 60,
    keywords: [
      "патология",
      "клиничес",
      "помощ",
    ],
  },
];

function findSectionSlugForTitle(title: string) {
  const lowerTitle = title.toLowerCase();

  for (const section of sections) {
    if (section.keywords.some((keyword) => lowerTitle.includes(keyword))) {
      return section.slug;
    }
  }

  return "ecg-basics";
}

async function main() {
  const savedSections = new Map<string, string>();

  for (const section of sections) {
    const savedSection = await prisma.ecgSection.upsert({
      where: {
        slug: section.slug,
      },
      update: {
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
      },
      create: {
        title: section.title,
        slug: section.slug,
        description: section.description,
        sortOrder: section.sortOrder,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    savedSections.set(savedSection.slug, savedSection.id);
  }

  const ecgBaseMaterials = await prisma.material.findMany({
    where: {
      category: {
        slug: "ecg-base",
      },
      ecgSectionId: null,
    },
    select: {
      id: true,
      title: true,
    },
  });

  for (const material of ecgBaseMaterials) {
    const sectionSlug = findSectionSlugForTitle(material.title);
    const sectionId = savedSections.get(sectionSlug);

    if (!sectionId) continue;

    await prisma.material.update({
      where: {
        id: material.id,
      },
      data: {
        ecgSectionId: sectionId,
      },
    });
  }

  console.log("ECG sections seed completed.");
  console.log(`Sections upserted: ${sections.length}`);
  console.log(`Materials assigned: ${ecgBaseMaterials.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });