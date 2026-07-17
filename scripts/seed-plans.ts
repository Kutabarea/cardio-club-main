import "dotenv/config";

import { upsertCorePlans } from "../lib/planCatalog";
import { prisma } from "../lib/prisma";

async function main() {
  const plans = await upsertCorePlans();
  let backfilledSubscriptions = 0;

  for (const plan of plans) {
    const result = await prisma.subscription.updateMany({
      where: {
        plan: plan.code,
        planId: null,
      },
      data: {
        planId: plan.id,
      },
    });

    backfilledSubscriptions += result.count;
  }

  console.log("");
  console.log("Billing plans seeded.");
  console.log(`Plans: ${plans.length}`);
  console.log(`Subscriptions backfilled: ${backfilledSubscriptions}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });