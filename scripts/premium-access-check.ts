import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import {
  getMaterialAccessState,
  getPremiumAccessStateForUser,
} from "@/lib/materialAccess";
import { premiumPlans } from "@/lib/subscriptions";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

function assertAudit(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function listFilesRecursively(directory: string): string[] {
  const absoluteDirectory = path.join(process.cwd(), directory);

  if (!fs.existsSync(absoluteDirectory)) {
    return [];
  }

  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listFilesRecursively(relativePath);
    }

    return [relativePath];
  });
}

function auditAccessPolicy() {
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const guest = getPremiumAccessStateForUser(null);
  const regularUser = getPremiumAccessStateForUser({
    role: "USER",
    subscriptions: [],
  });
  const premiumUser = getPremiumAccessStateForUser({
    role: "USER",
    subscriptions: [
      {
        plan: "PREMIUM_MONTH",
        status: "ACTIVE",
        endsAt: futureDate,
      },
    ],
  });
  const expiredPremiumUser = getPremiumAccessStateForUser({
    role: "USER",
    subscriptions: [
      {
        plan: "PREMIUM_MONTH",
        status: "ACTIVE",
        endsAt: pastDate,
      },
    ],
  });
  const admin = getPremiumAccessStateForUser({
    role: "ADMIN",
    subscriptions: [],
  });

  const freeForGuest = getMaterialAccessState(
    { isPremium: false, isPublished: true },
    guest,
  );
  assertAudit(freeForGuest.canReadContent, "Free material must be readable without login.");
  assertAudit(freeForGuest.reason === "PUBLIC", "Free material must use PUBLIC reason.");

  const premiumForGuest = getMaterialAccessState(
    { isPremium: true, isPublished: true },
    guest,
  );
  assertAudit(!premiumForGuest.canReadContent, "Guest must not read premium content.");
  assertAudit(
    !premiumForGuest.canAccessProtectedMedia,
    "Guest must not receive premium videoUrl.",
  );
  assertAudit(
    premiumForGuest.reason === "LOGIN_REQUIRED",
    "Guest premium reason must be LOGIN_REQUIRED.",
  );

  const premiumForRegularUser = getMaterialAccessState(
    { isPremium: true, isPublished: true },
    regularUser,
  );
  assertAudit(
    !premiumForRegularUser.canReadContent,
    "Authenticated free user must not read premium content.",
  );
  assertAudit(
    premiumForRegularUser.reason === "PREMIUM_REQUIRED",
    "Authenticated free user must receive PREMIUM_REQUIRED.",
  );

  const premiumForSubscriber = getMaterialAccessState(
    { isPremium: true, isPublished: true },
    premiumUser,
  );
  assertAudit(premiumForSubscriber.canReadContent, "Active premium user must read content.");
  assertAudit(
    premiumForSubscriber.canAccessProtectedMedia,
    "Active premium user must receive protected media.",
  );

  const premiumForExpiredSubscriber = getMaterialAccessState(
    { isPremium: true, isPublished: true },
    expiredPremiumUser,
  );
  assertAudit(
    !premiumForExpiredSubscriber.canReadContent,
    "Expired premium user must not read premium content.",
  );

  const premiumForAdmin = getMaterialAccessState(
    { isPremium: true, isPublished: true },
    admin,
  );
  assertAudit(premiumForAdmin.canReadContent, "ADMIN must read published premium content.");
  assertAudit(premiumForAdmin.reason === "ADMIN", "ADMIN access reason must be ADMIN.");

  const draftForAdminOnPublicRoute = getMaterialAccessState(
    { isPremium: false, isPublished: false },
    admin,
    "PUBLIC",
  );
  assertAudit(
    !draftForAdminOnPublicRoute.canViewMetadata,
    "Unpublished material must stay hidden on public routes, including for ADMIN.",
  );

  const draftForAdminPreview = getMaterialAccessState(
    { isPremium: true, isPublished: false },
    admin,
    "ADMIN_PREVIEW",
  );
  assertAudit(
    draftForAdminPreview.canReadContent,
    "ADMIN must read unpublished material only in ADMIN_PREVIEW mode.",
  );

  const draftForRegularPreview = getMaterialAccessState(
    { isPremium: false, isPublished: false },
    regularUser,
    "ADMIN_PREVIEW",
  );
  assertAudit(
    !draftForRegularPreview.canViewMetadata,
    "Non-admin must not preview unpublished material.",
  );
}

function auditRouteIntegration() {
  const publicDetailRoutes = [
    "app/library/base/[slug]/page.tsx",
    "app/library/[categorySlug]/[materialSlug]/page.tsx",
    "app/videolecture/[slug]/page.tsx",
    "app/videocourses/[slug]/page.tsx",
  ];

  for (const routePath of publicDetailRoutes) {
    const source = readProjectFile(routePath);

    assertAudit(
      source.includes("getMaterialForCurrentViewer"),
      `${routePath} does not use the unified material access service.`,
    );
    assertAudit(
      !source.includes('from "@/lib/prisma"'),
      `${routePath} imports Prisma directly and can bypass access sanitization.`,
    );
    assertAudit(
      !/prisma\.material\./.test(source),
      `${routePath} queries Material directly and can bypass access sanitization.`,
    );
  }

  const serviceSource = readProjectFile("lib/materialAccess.ts");
  assertAudit(
    serviceSource.includes("materialProtectedSelect"),
    "materialAccess service must separate protected fields from public metadata.",
  );
  assertAudit(
    serviceSource.includes("content: true") && serviceSource.includes("videoUrl: true"),
    "materialAccess service must explicitly select protected content and videoUrl.",
  );
  assertAudit(
    serviceSource.includes("canReadContent") &&
      serviceSource.includes("canAccessProtectedMedia"),
    "materialAccess service must gate content and protected media separately.",
  );

  const previewSource = readProjectFile("app/admin/materials/[id]/preview/page.tsx");
  assertAudit(
    previewSource.includes('user.role !== "ADMIN"'),
    "Admin material preview must verify ADMIN role inside the page.",
  );
  assertAudit(
    previewSource.includes('mode: "ADMIN_PREVIEW"'),
    "Admin material preview must use ADMIN_PREVIEW access mode.",
  );

  const allPublicPages = listFilesRecursively("app")
    .filter((filePath) => filePath.endsWith("page.tsx"))
    .filter((filePath) => !filePath.startsWith(`app${path.sep}admin${path.sep}`));

  const suspiciousPages = allPublicPages.filter((filePath) => {
    const source = readProjectFile(filePath);
    const directlyQueriesMaterial = /prisma\.material\.(findFirst|findUnique)/.test(source);
    const rendersProtectedData =
      /<MarkdownContent\s+content=/.test(source) || /\.videoUrl\b/.test(source);

    return directlyQueriesMaterial && rendersProtectedData;
  });

  assertAudit(
    suspiciousPages.length === 0,
    `Public pages bypass unified access service: ${suspiciousPages.join(", ")}`,
  );
}

async function auditDatabaseState() {
  const now = new Date();

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
                in: premiumPlans,
              },
              OR: [
                {
                  endsAt: null,
                },
                {
                  endsAt: {
                    gt: now,
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
            in: premiumPlans,
          },
          endsAt: {
            lt: now,
          },
        },
      }),
    ]);

  assertAudit(
    expiredPremiumSubscriptions === 0,
    "Expired premium subscriptions are still ACTIVE. Run: npm run subscriptions:expire",
  );

  return {
    premiumMaterials,
    freeMaterials,
    activePremiumUsers,
    expiredPremiumSubscriptions,
  };
}

async function main() {
  auditAccessPolicy();
  auditRouteIntegration();
  const databaseState = await auditDatabaseState();

  console.log("");
  console.log("Premium access audit");
  console.log("--------------------");
  console.log(`Premium materials: ${databaseState.premiumMaterials}`);
  console.log(`Free materials: ${databaseState.freeMaterials}`);
  console.log(`Users with active premium: ${databaseState.activePremiumUsers}`);
  console.log(
    `Expired premium subscriptions still active: ${databaseState.expiredPremiumSubscriptions}`,
  );
  console.log("Policy scenarios: OK");
  console.log("Public route integration: OK");
  console.log("Protected fields sanitization: OK");
  console.log("");
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown premium audit error";
    console.error(`Premium access audit failed: ${message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });