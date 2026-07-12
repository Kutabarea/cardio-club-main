import { prisma } from "@/lib/prisma";

export const defaultEcgSections = [
  {
    title: "Основы ЭКГ",
    slug: "ecg-basics",
    description: "Частота, ритм, электрическая ось, расположение электродов и базовая интерпретация.",
    sortOrder: 10,
  },
  {
    title: "Зубцы и волны",
    slug: "ecg-waves",
    description: "Зубцы P, Q, R, S, T, U, дельта-волна, эпсилон-волна и другие элементы ЭКГ.",
    sortOrder: 20,
  },
  {
    title: "Интервалы и сегменты",
    slug: "ecg-intervals-segments",
    description: "PR, QT, ST, точка J и другие интервалы и сегменты.",
    sortOrder: 30,
  },
  {
    title: "Комплексы и отведения",
    slug: "ecg-complexes-leads",
    description: "Комплекс QRS, грудные отведения, V1/V2 и особенности регистрации.",
    sortOrder: 40,
  },
  {
    title: "Перегрузки и гипертрофии",
    slug: "ecg-hypertrophy",
    description: "Увеличение предсердий, гипертрофии и признаки перегрузки камер сердца.",
    sortOrder: 50,
  },
  {
    title: "Клиническая интерпретация",
    slug: "ecg-clinical-interpretation",
    description: "Неотложные состояния, патологии, клинические сценарии и итоговая интерпретация.",
    sortOrder: 60,
  },
];

export function createEcgSectionSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll("э", "e")
    .replaceAll("ё", "e")
    .replaceAll(" ", "-")
    .replaceAll("ь", "")
    .replaceAll("ъ", "")
    .replaceAll("й", "y")
    .replaceAll("ц", "c")
    .replaceAll("у", "u")
    .replaceAll("к", "k")
    .replaceAll("е", "e")
    .replaceAll("н", "n")
    .replaceAll("г", "g")
    .replaceAll("ш", "sh")
    .replaceAll("щ", "sch")
    .replaceAll("з", "z")
    .replaceAll("х", "h")
    .replaceAll("ф", "f")
    .replaceAll("ы", "y")
    .replaceAll("в", "v")
    .replaceAll("а", "a")
    .replaceAll("п", "p")
    .replaceAll("р", "r")
    .replaceAll("о", "o")
    .replaceAll("л", "l")
    .replaceAll("д", "d")
    .replaceAll("ж", "zh")
    .replaceAll("я", "ya")
    .replaceAll("ч", "ch")
    .replaceAll("с", "s")
    .replaceAll("м", "m")
    .replaceAll("и", "i")
    .replaceAll("т", "t")
    .replaceAll("б", "b")
    .replaceAll("ю", "yu")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replaceAll(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureDefaultEcgSections() {
  for (const section of defaultEcgSections) {
    await prisma.ecgSection.upsert({
      where: {
        slug: section.slug,
      },
      update: {
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
      },
      create: section,
    });
  }
}

export async function isEcgBaseCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      slug: true,
    },
  });

  return category?.slug === "ecg-base";
}

type ResolveMaterialEcgSectionInput = {
  categoryId: string;
  ecgSectionId: string;
  newEcgSectionTitle: string;
  newEcgSectionDescription: string;
};

export async function resolveMaterialEcgSectionId({
  categoryId,
  ecgSectionId,
  newEcgSectionTitle,
  newEcgSectionDescription,
}: ResolveMaterialEcgSectionInput) {
  const categoryIsEcgBase = await isEcgBaseCategory(categoryId);

  if (!categoryIsEcgBase) {
    return null;
  }

  const cleanNewTitle = newEcgSectionTitle.trim();
  const cleanDescription = newEcgSectionDescription.trim();

  if (cleanNewTitle) {
    const slug = createEcgSectionSlug(cleanNewTitle);

    if (!slug) {
      return null;
    }

    const createdSection = await prisma.ecgSection.upsert({
      where: {
        slug,
      },
      update: {
        title: cleanNewTitle,
        description: cleanDescription || null,
      },
      create: {
        title: cleanNewTitle,
        slug,
        description: cleanDescription || null,
        sortOrder: 100,
      },
      select: {
        id: true,
      },
    });

    return createdSection.id;
  }

  if (!ecgSectionId) {
    return null;
  }

  const existingSection = await prisma.ecgSection.findUnique({
    where: {
      id: ecgSectionId,
    },
    select: {
      id: true,
    },
  });

  return existingSection?.id ?? null;
}