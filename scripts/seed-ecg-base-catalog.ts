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
    title: "База",
    slug: "baza",
    description: "Базовые материалы по ЭКГ.",
    sortOrder: 10,
    materials: [
      "Частота ЭКГ",
      "Основы детской ЭКГ",
      "ЭКГ ритм",
      "ЭКГ при неотложной помощи",
      "Интервалы на ЭКГ",
      "Интрерпретация ЭКГ",
      "Электрическая ось сердца",
      "Расположение электродов",
      "V1 и V2",
      "Зубцы на ЭКГ",
    ],
  },
  {
    title: "Зубцы",
    slug: "zubcy",
    description: "Зубцы, волны и отдельные элементы ЭКГ.",
    sortOrder: 20,
    materials: [
      "Зубец Т",
      "Дельта волна",
      "Зубец R",
      "Волна эпсилон",
      "Зубец Q",
      "Зубец Осборна",
      "Зубец U",
    ],
  },
  {
    title: "Сегменты и интервалы",
    slug: "segmenty-i-intervaly",
    description: "Интервалы, сегменты и комплексы ЭКГ.",
    sortOrder: 30,
    materials: [
      "Интервал PR",
      "Сегмент ST",
      "Сегмент PR",
      "Точка J",
      "Интервал QT",
      "Комплекс QRS",
    ],
  },
  {
    title: "Анатомия ЭКГ",
    slug: "anatomiya-ekg",
    description: "ЭКГ-признаки увеличения и гипертрофии камер сердца.",
    sortOrder: 40,
    materials: [
      "Увеличение левого предсердия",
      "Гипертрофия обоих предсердий",
      "Увеличение правого предсердия",
    ],
  },
  {
    title: "Клиническая интерпретация",
    slug: "klinicheskaya-interpretaciya",
    description: "Клинические материалы и переходы к патологиям.",
    sortOrder: 50,
    materials: [
      "Паталогия от А до Я",
    ],
  },
];

const oldSectionSlugMap = new Map([
  ["ecg-basics", "baza"],
  ["ecg-waves", "zubcy"],
  ["ecg-intervals-segments", "segmenty-i-intervaly"],
  ["ecg-complexes-leads", "segmenty-i-intervaly"],
  ["ecg-hypertrophy", "anatomiya-ekg"],
  ["ecg-clinical-interpretation", "klinicheskaya-interpretaciya"],
]);

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  ь: "",
  ъ: "",
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replaceAll(" ", "-")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replaceAll(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const ecgBaseCategory = await prisma.category.upsert({
    where: {
      slug: "ecg-base",
    },
    update: {
      title: "ЭКГ база",
    },
    create: {
      title: "ЭКГ база",
      slug: "ecg-base",
    },
    select: {
      id: true,
    },
  });

  const sectionIds = new Map<string, string>();

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

    sectionIds.set(savedSection.slug, savedSection.id);
  }

  for (const [oldSlug, newSlug] of oldSectionSlugMap.entries()) {
    const oldSection = await prisma.ecgSection.findUnique({
      where: {
        slug: oldSlug,
      },
      select: {
        id: true,
      },
    });

    const newSectionId = sectionIds.get(newSlug);

    if (!oldSection || !newSectionId) continue;

    await prisma.material.updateMany({
      where: {
        ecgSectionId: oldSection.id,
        category: {
          slug: "ecg-base",
        },
      },
      data: {
        ecgSectionId: newSectionId,
      },
    });
  }

  let createdOrUpdatedMaterials = 0;

  for (const section of sections) {
    const sectionId = sectionIds.get(section.slug);

    if (!sectionId) continue;

    for (const title of section.materials) {
      const slug = createSlug(title);

      const existingMaterial = await prisma.material.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

      if (existingMaterial) {
        await prisma.material.update({
          where: {
            id: existingMaterial.id,
          },
          data: {
            title,
            type: "ECG_ARTICLE",
            categoryId: ecgBaseCategory.id,
            ecgSectionId: sectionId,
            isPublished: true,
          },
        });
      } else {
        await prisma.material.create({
          data: {
            title,
            slug,
            description: `Материал раздела «${section.title}».`,
            content: "Материал пока заполняется через админку.",
            type: "ECG_ARTICLE",
            categoryId: ecgBaseCategory.id,
            ecgSectionId: sectionId,
            isPublished: true,
            isPremium: false,
          },
        });
      }

      createdOrUpdatedMaterials += 1;
    }
  }

  for (const oldSlug of oldSectionSlugMap.keys()) {
    const oldSection = await prisma.ecgSection.findUnique({
      where: {
        slug: oldSlug,
      },
      include: {
        _count: {
          select: {
            materials: true,
          },
        },
      },
    });

    if (oldSection && oldSection._count.materials === 0) {
      await prisma.ecgSection.delete({
        where: {
          id: oldSection.id,
        },
      });
    }
  }

  console.log("ECG base catalog seed completed.");
  console.log(`Sections synced: ${sections.length}`);
  console.log(`Materials synced: ${createdOrUpdatedMaterials}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });