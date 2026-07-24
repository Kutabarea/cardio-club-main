import { prisma } from "@/lib/prisma";

export const defaultVideoLectureSections = [
  {
    title: "Фармакология",
    slug: "pharmacology",
    description: "Лекарственная терапия и клиническая фармакология.",
    sortOrder: 10,
  },
  {
    title: "Пульмонология и ТЭЛА",
    slug: "pulmonology-and-pe",
    description: "Пульмонология и тромбоэмболия лёгочной артерии.",
    sortOrder: 20,
  },
  {
    title: "ЭКГ и аритмии",
    slug: "ecg-and-arrhythmias",
    description: "ЭКГ, нарушения ритма и проводимости.",
    sortOrder: 30,
  },
  {
    title: "Нефрология",
    slug: "nephrology",
    description: "Заболевания почек в практике кардиолога.",
    sortOrder: 40,
  },
  {
    title: "ОКС и инфаркт миокарда",
    slug: "acs-and-myocardial-infarction",
    description: "Острый коронарный синдром и инфаркт миокарда.",
    sortOrder: 50,
  },
  {
    title: "Гематология",
    slug: "hematology",
    description: "Гематологические состояния в кардиологии.",
    sortOrder: 60,
  },
  {
    title: "Сердечная недостаточность и РААС",
    slug: "heart-failure-and-raas",
    description: "Сердечная недостаточность и система РААС.",
    sortOrder: 70,
  },
  {
    title: "Эндокринные причины артериальной гипертензии",
    slug: "endocrine-hypertension",
    description: "Эндокринные причины повышения артериального давления.",
    sortOrder: 80,
  },
  {
    title: "Липиды и атеросклероз",
    slug: "lipids-and-atherosclerosis",
    description: "Дислипидемии, атеросклероз и профилактика.",
    sortOrder: 90,
  },
  {
    title: "Физиология и пропедевтика",
    slug: "physiology-and-propaedeutics",
    description: "Физиология и основы клинического обследования.",
    sortOrder: 100,
  },
  {
    title: "Воспалительные болезни сердца и ревматология",
    slug: "inflammatory-heart-diseases-and-rheumatology",
    description: "Миокардиты, перикардиты и ревматология.",
    sortOrder: 110,
  },
  {
    title: "Доказательная медицина, обучение и карьера",
    slug: "evidence-medicine-education-career",
    description: "Доказательная медицина и профессиональное развитие.",
    sortOrder: 120,
  },
] as const;

export function createVideoLectureSectionSlug(value: string) {
  const transliteration: Record<string, string> = {
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
  };

  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((character) => transliteration[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureDefaultVideoLectureSections() {
  for (const section of defaultVideoLectureSections) {
    await prisma.videoLectureSection.upsert({
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
type ResolveMaterialVideoLectureSectionInput = {
  type: string;
  videoLectureSectionId: string;
};

export async function resolveMaterialVideoLectureSectionId({
  type,
  videoLectureSectionId,
}: ResolveMaterialVideoLectureSectionInput) {
  if (
    type !== "VIDEO_LECTURE" ||
    !videoLectureSectionId
  ) {
    return null;
  }

  const section = await prisma.videoLectureSection.findUnique({
    where: {
      id: videoLectureSectionId,
    },
    select: {
      id: true,
    },
  });

  return section?.id ?? null;
}