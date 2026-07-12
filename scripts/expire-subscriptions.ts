import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  const result = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      plan: {
        not: "FREE",
      },
      endsAt: {
        lt: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });

  console.log(`Expired subscriptions updated: ${result.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });