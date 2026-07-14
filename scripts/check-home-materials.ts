import { getMaterialPublicHref } from "../lib/materialPublicHref";
import { prisma } from "../lib/prisma";

async function main() {
  const latest = await prisma.material.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    take: 20,
    include: {
      category: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  console.log("\nLatest materials in DB:\n");

  console.table(
    latest.map((material) => {
      const href = getMaterialPublicHref(material);

      return {
        title: material.title,
        type: material.type,
        category: material.category?.slug ?? "NO_CATEGORY",
        published: material.isPublished,
        hasPublicHref: Boolean(href),
        href: href ?? "NO_PUBLIC_HREF",
        createdAt: material.createdAt.toISOString(),
      };
    }),
  );

  const homeReady = latest.filter((material) => {
    return material.isPublished && Boolean(getMaterialPublicHref(material));
  });

  console.log("\nMaterials eligible for homepage:\n");

  console.table(
    homeReady.slice(0, 12).map((material) => {
      return {
        title: material.title,
        href: getMaterialPublicHref(material),
        createdAt: material.createdAt.toISOString(),
      };
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });