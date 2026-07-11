import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

const categories = [
  {
    title: "ЭКГ база",
    slug: "ecg-base",
    description: "Базовые материалы по интерпретации ЭКГ для врачей и студентов.",
  },
  {
    title: "ЭКГ тренажёр",
    slug: "ecg-trainer",
    description: "Практические задания и клинические сценарии для тренировки ЭКГ.",
  },
  {
    title: "Патология от А до Я",
    slug: "pathology-a-z",
    description: "Кардиологические патологии, синдромы и клинические разборы.",
  },
  {
    title: "Полезные ресурсы",
    slug: "useful-resources",
    description: "Справочные материалы, алгоритмы, ссылки и памятки.",
  },
  {
    title: "Видеолекции",
    slug: "video-lectures",
    description: "Образовательные видеолекции по кардиологии и ЭКГ.",
  },
];

const materials = [
  {
    title: "Частота ЭКГ",
    slug: "ecg-frequency",
    description:
      "Краткий разбор способов расчёта частоты сердечных сокращений по ЭКГ.",
    content: `## Зачем считать частоту

Частота сердечных сокращений — один из первых параметров, который оценивается при чтении ЭКГ.

## Быстрый способ

- Найди два соседних комплекса QRS.
- Посчитай количество крупных клеток между ними.
- Раздели 300 на количество крупных клеток.

**Пример:** если между комплексами 4 крупные клетки, частота примерно 75 ударов в минуту.

## Когда способ не подходит

При нерегулярном ритме лучше считать количество комплексов QRS за 10 секунд и умножать на 6.

> Важно: частота сама по себе не является диагнозом. Её нужно оценивать вместе с ритмом, проводимостью и клинической картиной.`,
    type: "ECG_ARTICLE",
    categorySlug: "ecg-base",
    imageUrl: "/images/materials__img__1.png",
    videoUrl: null,
    isPremium: false,
    isPublished: true,
  },
  {
    title: "Комплекс QRS",
    slug: "complex-qrs",
    description:
      "Что показывает комплекс QRS, как оценивать его ширину и форму.",
    content: `## Что такое QRS

Комплекс QRS отражает деполяризацию желудочков.

## Что оценивать

- Ширину комплекса.
- Амплитуду зубцов.
- Наличие патологического Q.
- Морфологию в грудных отведениях.

**Нормальная ширина QRS** обычно до 120 мс.

## На что обратить внимание

Широкий QRS может встречаться при блокадах ножек пучка Гиса, желудочковых ритмах, электролитных нарушениях и действии некоторых препаратов.

> Если QRS широкий, всегда оценивай клинику и сравнивай с предыдущими ЭКГ.`,
    type: "ECG_ARTICLE",
    categorySlug: "ecg-base",
    imageUrl: "/images/materials__img__2.png",
    videoUrl: null,
    isPremium: true,
    isPublished: true,
  },
  {
    title: "Фибрилляция предсердий",
    slug: "atrial-fibrillation",
    description:
      "Основные ЭКГ-признаки фибрилляции предсердий и клиническое значение.",
    content: `## Основные признаки

Фибрилляция предсердий — одна из самых частых аритмий в клинической практике.

На ЭКГ обычно видны:

- отсутствие регулярных зубцов P;
- нерегулярные интервалы RR;
- различная частота желудочкового ответа;
- возможные волны f на изолинии.

## Что важно указать в заключении

1. Наличие фибрилляции предсердий.
2. Частоту желудочковых сокращений.
3. Наличие нарушений проводимости.
4. Признаки ишемии или перегрузки, если они есть.

**Клинически важно:** у пациента нужно оценивать риск тромбоэмболий и необходимость антикоагулянтной терапии.`,
    type: "ECG_ARTICLE",
    categorySlug: "pathology-a-z",
    imageUrl: "/images/materials__img__3.png",
    videoUrl: null,
    isPremium: false,
    isPublished: true,
  },
  {
    title: "Острый коронарный синдром",
    slug: "acute-coronary-syndrome-demo",
    description:
      "Демо-материал по ЭКГ-признакам острого коронарного синдрома.",
    content: `## Что искать на ЭКГ

При подозрении на острый коронарный синдром важно быстро оценить:

- подъём сегмента ST;
- депрессию ST;
- инверсию зубца T;
- новые блокады;
- динамику изменений на повторных ЭКГ.

## Почему нужна динамика

Одна ЭКГ может быть недостаточной. При сохраняющихся симптомах ЭКГ повторяют и сопоставляют с клиникой, тропонинами и анамнезом.

> Материал предназначен для образовательных целей и не заменяет клинические протоколы.`,
    type: "ECG_ARTICLE",
    categorySlug: "pathology-a-z",
    imageUrl: "/images/materials__img__4.png",
    videoUrl: null,
    isPremium: true,
    isPublished: true,
  },
  {
    title: "Алгоритм чтения ЭКГ",
    slug: "ecg-reading-algorithm-draft",
    description:
      "Черновик материала с пошаговым алгоритмом чтения ЭКГ.",
    content: `## Черновик алгоритма

Этот материал специально оставлен черновиком, чтобы показать фильтр по статусу.

## Порядок чтения

1. Проверить качество записи.
2. Оценить частоту.
3. Оценить ритм.
4. Проверить интервалы.
5. Оценить электрическую ось.
6. Найти признаки гипертрофии, ишемии или блокады.

**Статус:** материал ещё не опубликован.`,
    type: "ECG_ARTICLE",
    categorySlug: "ecg-base",
    imageUrl: "/images/materials__img__5.png",
    videoUrl: null,
    isPremium: false,
    isPublished: false,
  },
  {
    title: "Видеолекция: ЭКГ и аритмии",
    slug: "demo-video-ecg-arrhythmias",
    description:
      "Демо-видеолекция по базовому разбору аритмий на ЭКГ.",
    content: `## О лекции

В этой лекции разбираются базовые подходы к диагностике аритмий по ЭКГ.

## Темы

- синусовый ритм;
- наджелудочковые аритмии;
- фибрилляция предсердий;
- желудочковые нарушения ритма;
- клинические ошибки при интерпретации.

> Видео-ссылка в демо может быть заменена на реальную запись лекции.`,
    type: "VIDEO_LECTURE",
    categorySlug: "video-lectures",
    imageUrl: "/images/videolecture__img__1.png",
    videoUrl: "https://example.com/video/ecg-arrhythmias",
    isPremium: false,
    isPublished: true,
  },
  {
    title: "Видеолекция: Артериальная гипертензия",
    slug: "demo-video-hypertension",
    description:
      "Демо-видеолекция по диагностике и ведению артериальной гипертензии.",
    content: `## О лекции

Краткий образовательный материал по артериальной гипертензии.

## Внутри лекции

- классификация давления;
- факторы риска;
- поражение органов-мишеней;
- базовые подходы к терапии;
- контроль эффективности лечения.

**Premium:** этот материал можно использовать для демонстрации платного доступа.`,
    type: "VIDEO_LECTURE",
    categorySlug: "video-lectures",
    imageUrl: "/images/videolecture__img__2.png",
    videoUrl: "https://example.com/video/hypertension",
    isPremium: true,
    isPublished: true,
  },
  {
    title: "Полезные ссылки для кардиолога",
    slug: "useful-links-cardiology",
    description:
      "Подборка справочных ресурсов и быстрых ссылок для ежедневной практики.",
    content: `## Что можно добавить сюда

- клинические рекомендации;
- калькуляторы риска;
- шкалы и алгоритмы;
- памятки для пациентов;
- образовательные ресурсы.

## Пример структуры

1. Рекомендации.
2. Калькуляторы.
3. ЭКГ-справочники.
4. Лекции и курсы.

[Пример внешней ссылки](https://example.com)

> Этот раздел удобно использовать как навигационный справочник.`,
    type: "HELPER",
    categorySlug: "useful-resources",
    imageUrl: null,
    videoUrl: null,
    isPremium: false,
    isPublished: true,
  },
];

async function main() {
  const categoryBySlug = new Map<string, { id: string }>();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        title: category.title,
        description: category.description,
      },
      create: category,
      select: {
        id: true,
        slug: true,
      },
    });

    categoryBySlug.set(savedCategory.slug, {
      id: savedCategory.id,
    });
  }

  for (const material of materials) {
    const category = categoryBySlug.get(material.categorySlug);

    if (!category) {
      throw new Error(`Category not found for slug: ${material.categorySlug}`);
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

  console.log("Demo content seed completed.");
  console.log(`Categories upserted: ${categories.length}`);
  console.log(`Materials upserted: ${materials.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });