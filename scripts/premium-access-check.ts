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
  const [premiumMaterials, freeMaterials, activePremiumUsers, expiredPremiumSubscriptions] =
    await Promise.all([
      prisma.material.count({
        where: {
          isPremium: true,
        },
      }),
      prisma.material.count({
        where: {
          isPremium: false,
        },
      }),
      prisma.user.count({
        where: {
          subscriptions: {
            some: {
              status: "ACTIVE",
              plan: {
                not: "FREE",
              },
              OR: [
                {
                  endsAt: null,
                },
                {
                  endsAt: {
                    gt: new Date(),
                  },
                },
              ],
            },
          },
        },
      }),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          plan: {
            not: "FREE",
          },
          endsAt: {
            lt: new Date(),
          },
        },
      }),
    ]);

  console.log("");
  console.log("Premium access audit");
  console.log("--------------------");
  console.log(`Premium materials: ${premiumMaterials}`);
  console.log(`Free materials: ${freeMaterials}`);
  console.log(`Users with active premium: ${activePremiumUsers}`);
  console.log(`Expired premium subscriptions still active: ${expiredPremiumSubscriptions}`);
  console.log("");

  if (expiredPremiumSubscriptions > 0) {
    console.log("Run: npm run subscriptions:expire");
    process.exit(1);
  }

  console.log("Premium access state is OK.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });