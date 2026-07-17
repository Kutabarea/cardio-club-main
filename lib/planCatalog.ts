import { prisma } from "@/lib/prisma";

export type CorePlanDefinition = {
  code: string;
  title: string;
  description: string;
  durationDays: number | null;
  priceMinor: number;
  monthlyPriceMinor: number | null;
  currency: string;
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
};

export const corePlanDefinitions = [
  {
    code: "FREE",
    title: "Бесплатный",
    description: "Базовый бесплатный доступ к материалам CardioClub.",
    durationDays: null,
    priceMinor: 0,
    monthlyPriceMinor: null,
    currency: "RUB",
    isPremium: false,
    isActive: true,
    sortOrder: 0,
  },
  {
    code: "PREMIUM_MONTH",
    title: "Premium на месяц",
    description: "Полный доступ ко всем материалам CardioClub на 30 дней.",
    durationDays: 30,
    priceMinor: 98_000,
    monthlyPriceMinor: 98_000,
    currency: "RUB",
    isPremium: true,
    isActive: true,
    sortOrder: 10,
  },
  {
    code: "PREMIUM_3_MONTH",
    title: "Premium на 3 месяца",
    description: "Полный доступ ко всем материалам CardioClub на 90 дней.",
    durationDays: 90,
    priceMinor: 195_000,
    monthlyPriceMinor: 65_000,
    currency: "RUB",
    isPremium: true,
    isActive: true,
    sortOrder: 20,
  },
  {
    code: "PREMIUM_YEAR",
    title: "Premium на год",
    description: "Полный доступ ко всем материалам CardioClub на 365 дней.",
    durationDays: 365,
    priceMinor: 516_000,
    monthlyPriceMinor: 43_000,
    currency: "RUB",
    isPremium: true,
    isActive: true,
    sortOrder: 30,
  },
] as const satisfies readonly CorePlanDefinition[];

export type CorePlanCode = (typeof corePlanDefinitions)[number]["code"];

export const premiumPlanCodes = [
  "PREMIUM_MONTH",
  "PREMIUM_3_MONTH",
  "PREMIUM_YEAR",
] as const;

export type PremiumPlanCode = (typeof premiumPlanCodes)[number];

export function isPremiumPlanCode(value: string): value is PremiumPlanCode {
  return premiumPlanCodes.some((code) => code === value);
}

export function getCorePlanDefinition(code: CorePlanCode) {
  const definition = corePlanDefinitions.find((plan) => plan.code === code);

  if (!definition) {
    throw new Error(`Core plan definition is missing: ${code}`);
  }

  return definition;
}

export async function ensureCorePlan(code: CorePlanCode) {
  const definition = getCorePlanDefinition(code);
  const { code: planCode, ...data } = definition;

  return prisma.plan.upsert({
    where: {
      code: planCode,
    },
    update: data,
    create: definition,
  });
}

export async function upsertCorePlans() {
  const plans = [];

  for (const definition of corePlanDefinitions) {
    plans.push(await ensureCorePlan(definition.code));
  }

  return plans;
}