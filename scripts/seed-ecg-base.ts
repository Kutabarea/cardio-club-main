import "dotenv/config";
import { prisma } from "../lib/prisma";

const ecgBaseTopics = [
  "Частота ЭКГ",
  "ЭКГ ритм",
  "Интервалы на ЭКГ",
  "Электрическая ось сердца",
  "V1 и V2",
  "Основы детской ЭКГ",
  "ЭКГ при неотложной помощи",
  "Интерпретация ЭКГ",
  "Расположение электродов",
  "Зубцы на ЭКГ",
  "Зубец T",
  "Зубец R",
  "Зубец Q",
  "Зубец U",
  "Дельта волна",
  "Волна эпсилон",
  "Зубец Осборна",
  "Интервал PR",
  "Сегмент PR",
  "Интервал QT",
  "Сегмент ST",
  "Точка J",
  "Комплекс QRS",
  "Увеличение левого предсердия",
  "Увеличение правого предсердия",
  "Гипертрофия обоих предсердий",
  "Патология от А до Я",
];

function createSlug(title: string) {
  return title
    .toLowerCase()
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
    .replaceAll(/[^a-z0-9-]/g, "");
}

async function main() {
  const category = await prisma.category.upsert({
    where: {
      slug: "ecg-base",
    },
    update: {
      title: "ЭКГ база",
      description:
        "Вся база ЭКГ, которую надо знать врачу. Зубцы, сегменты, интервалы, патологии, реальные примеры и клиническая интерпретация.",
    },
    create: {
      title: "ЭКГ база",
      slug: "ecg-base",
      description:
        "Вся база ЭКГ, которую надо знать врачу. Зубцы, сегменты, интервалы, патологии, реальные примеры и клиническая интерпретация.",
    },
  });

  for (const topic of ecgBaseTopics) {
    const slug = createSlug(topic);

    await prisma.material.upsert({
      where: {
        slug,
      },
      update: {
        title: topic,
        description: `Краткий материал по теме «${topic}».`,
        content: [
          `Раздел «${topic}» относится к базовой интерпретации ЭКГ.`,
          "Здесь будет основной учебный текст: определение, нормальные значения, клиническое значение и частые ошибки при анализе.",
          "Позже этот материал можно заменить на полноценную медицинскую статью с изображениями, примерами ЭКГ и проверочными вопросами.",
        ].join("\n"),
        type: "ECG_ARTICLE",
        imageUrl: null,
        videoUrl: null,
        isPremium: false,
        isPublished: true,
        categoryId: category.id,
      },
      create: {
        title: topic,
        slug,
        description: `Краткий материал по теме «${topic}».`,
        content: [
          `Раздел «${topic}» относится к базовой интерпретации ЭКГ.`,
          "Здесь будет основной учебный текст: определение, нормальные значения, клиническое значение и частые ошибки при анализе.",
          "Позже этот материал можно заменить на полноценную медицинскую статью с изображениями, примерами ЭКГ и проверочными вопросами.",
        ].join("\n"),
        type: "ECG_ARTICLE",
        imageUrl: null,
        videoUrl: null,
        isPremium: false,
        isPublished: true,
        categoryId: category.id,
      },
    });
  }

  console.log("ECG base seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });