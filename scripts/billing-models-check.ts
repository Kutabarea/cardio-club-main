import "dotenv/config";

import { corePlanDefinitions } from "../lib/planCatalog";
import { prisma } from "../lib/prisma";

async function main() {
  const [plans, subscriptions, invalidPayments] = await Promise.all([
    prisma.plan.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
    prisma.subscription.findMany({
      select: {
        id: true,
        plan: true,
        planId: true,
        planRecord: {
          select: {
            code: true,
          },
        },
      },
    }),
    prisma.payment.count({
      where: {
        OR: [
          {
            amountMinor: {
              lt: 0,
            },
          },
          {
            currency: "",
          },
        ],
      },
    }),
  ]);

  const problems: string[] = [];

  for (const definition of corePlanDefinitions) {
    const storedPlan = plans.find((plan) => plan.code === definition.code);

    if (!storedPlan) {
      problems.push(`Missing plan: ${definition.code}`);
      continue;
    }

    if (storedPlan.priceMinor !== definition.priceMinor) {
      problems.push(`Wrong price for plan: ${definition.code}`);
    }

    if (storedPlan.currency !== definition.currency) {
      problems.push(`Wrong currency for plan: ${definition.code}`);
    }

    if (storedPlan.durationDays !== definition.durationDays) {
      problems.push(`Wrong duration for plan: ${definition.code}`);
    }
  }

  for (const subscription of subscriptions) {
    if (!subscription.planId || !subscription.planRecord) {
      problems.push(`Subscription without Plan relation: ${subscription.id}`);
      continue;
    }

    if (subscription.plan !== subscription.planRecord.code) {
      problems.push(`Subscription plan snapshot mismatch: ${subscription.id}`);
    }
  }

  if (invalidPayments > 0) {
    problems.push(`Invalid payments: ${invalidPayments}`);
  }

  console.log("");
  console.log("Billing models audit");
  console.log("--------------------");
  console.log(`Plans: ${plans.length}`);
  console.log(`Subscriptions: ${subscriptions.length}`);
  console.log(`Invalid payments: ${invalidPayments}`);

  if (problems.length > 0) {
    console.log("");
    console.log("Problems:");

    for (const problem of problems) {
      console.log(`- ${problem}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Billing models state is OK.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });