import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

type CheckResult = {
  label: string;
  ok: boolean;
  value: string | number;
  hint?: string;
};

function printResult(result: CheckResult) {
  const mark = result.ok ? "OK" : "FAIL";
  const line = `[${mark}] ${result.label}: ${result.value}`;

  console.log(line);

  if (!result.ok && result.hint) {
    console.log(`     ${result.hint}`);
  }
}

async function main() {
  const [
    totalUsers,
    adminUsers,
    totalCategories,
    totalMaterials,
    publishedMaterials,
    draftMaterials,
    premiumMaterials,
    videoLectures,
    activePremiumSubscriptions,
    ecgBase,
    demoDraft,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),
    prisma.category.count(),
    prisma.material.count(),
    prisma.material.count({
      where: {
        isPublished: true,
      },
    }),
    prisma.material.count({
      where: {
        isPublished: false,
      },
    }),
    prisma.material.count({
      where: {
        isPremium: true,
      },
    }),
    prisma.material.count({
      where: {
        type: "VIDEO_LECTURE",
      },
    }),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        plan: {
          not: "FREE",
        },
      },
    }),
    prisma.category.findUnique({
      where: {
        slug: "ecg-base",
      },
      select: {
        id: true,
      },
    }),
    prisma.material.findUnique({
      where: {
        slug: "ecg-reading-algorithm-draft",
      },
      select: {
        id: true,
      },
    }),
  ]);

  const results: CheckResult[] = [
    {
      label: "Users in database",
      ok: totalUsers > 0,
      value: totalUsers,
      hint: "Создай хотя бы одного пользователя через регистрацию.",
    },
    {
      label: "Admin users",
      ok: adminUsers > 0,
      value: adminUsers,
      hint: "Сделай свой аккаунт админом через npm run admin:make -- email@example.com",
    },
    {
      label: "Categories",
      ok: totalCategories >= 5,
      value: totalCategories,
      hint: "Запусти npm run db:seed:demo",
    },
    {
      label: "Materials",
      ok: totalMaterials >= 8,
      value: totalMaterials,
      hint: "Запусти npm run db:seed:demo",
    },
    {
      label: "Published materials",
      ok: publishedMaterials > 0,
      value: publishedMaterials,
      hint: "Опубликуй хотя бы один материал.",
    },
    {
      label: "Draft materials",
      ok: draftMaterials > 0,
      value: draftMaterials,
      hint: "Для показа нужен хотя бы один черновик.",
    },
    {
      label: "Premium materials",
      ok: premiumMaterials > 0,
      value: premiumMaterials,
      hint: "Для показа нужен хотя бы один Premium материал.",
    },
    {
      label: "Video lectures",
      ok: videoLectures > 0,
      value: videoLectures,
      hint: "Для показа нужны видеолекции.",
    },
    {
      label: "Active premium subscriptions",
      ok: activePremiumSubscriptions >= 0,
      value: activePremiumSubscriptions,
    },
    {
      label: "ECG base category",
      ok: Boolean(ecgBase),
      value: ecgBase ? "exists" : "missing",
      hint: "Запусти npm run db:seed:demo",
    },
    {
      label: "Demo draft material",
      ok: Boolean(demoDraft),
      value: demoDraft ? "exists" : "missing",
      hint: "Запусти npm run db:seed:demo",
    },
  ];

  console.log("");
  console.log("Cardio Club demo readiness check");
  console.log("--------------------------------");
  console.log("");

  for (const result of results) {
    printResult(result);
  }

  const failed = results.filter((result) => !result.ok);

  console.log("");
  console.log("--------------------------------");

  if (failed.length > 0) {
    console.log(`Demo is NOT ready. Failed checks: ${failed.length}`);
    process.exit(1);
  }

  console.log("Demo is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });