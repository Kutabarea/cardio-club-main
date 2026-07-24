import "dotenv/config";

import { prisma } from "@/lib/prisma";

const requiredCategories = [
  {
    title: "Новости",
    slug: "news",
    description: "Новости Cardio Club и профессиональные обновления.",
  },
  {
    title: "Курсы",
    slug: "video-courses",
    description: "Обучающие видеокурсы и программы для врачей.",
  },
  {
    title: "Литература",
    slug: "literature",
    description: "Книги, рекомендации и образовательные материалы.",
  },
] as const;

async function main() {
  for (const category of requiredCategories) {
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

  console.log("");
  console.log("Внутренние категории навигации созданы.");
  console.log(`Обработано категорий: ${requiredCategories.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });