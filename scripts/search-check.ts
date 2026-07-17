import fs from "node:fs";
import path from "node:path";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import {
  parseSearchQuery,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_RESULT_LIMIT,
  searchPublishedMaterials,
  searchResultContainsProtectedFields,
} from "@/lib/materialSearch";
import { prisma } from "@/lib/prisma";

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const emptyQuery = parseSearchQuery("   ");
  const shortQuery = parseSearchQuery("a");
  const longQuery = parseSearchQuery(
    "a".repeat(SEARCH_QUERY_MAX_LENGTH + 1),
  );
  const normalizedQuery = parseSearchQuery("  Ёлка   QRS  ");

  assertCondition(
    emptyQuery.isEmpty && emptyQuery.isValid,
    "Empty query policy failed",
  );

  assertCondition(
    !shortQuery.isValid && shortQuery.error === "TOO_SHORT",
    "Short query policy failed",
  );

  assertCondition(
    !longQuery.isValid && longQuery.error === "TOO_LONG",
    "Long query policy failed",
  );

  assertCondition(
    normalizedQuery.normalized === "елка qrs",
    "Query normalization failed",
  );

  const searchPagePath = path.join(
    process.cwd(),
    "app",
    "search",
    "page.tsx",
  );

  const searchPageSource = fs.readFileSync(searchPagePath, "utf8");

  assertCondition(
    searchPageSource.includes('from "@/lib/materialSearch"'),
    "Search page does not use materialSearch service",
  );

  assertCondition(
    !searchPageSource.includes('from "@/lib/prisma"'),
    "Search page still accesses Prisma directly",
  );

  const publishedMaterials = await prisma.material.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
  });

  const publishedProbe = publishedMaterials.find((material) => {
    const href = getMaterialPublicHref(material);
    const query = parseSearchQuery(
      material.title.slice(0, SEARCH_QUERY_MAX_LENGTH),
    );

    return Boolean(href && query.isValid);
  });

  if (publishedProbe) {
    const response = await searchPublishedMaterials(
      publishedProbe.title.slice(0, SEARCH_QUERY_MAX_LENGTH),
    );

    assertCondition(
      response.results.some(
        (result) => result.id === publishedProbe.id,
      ),
      "Published material was not found by its title",
    );

    assertCondition(
      response.results.length <= SEARCH_RESULT_LIMIT,
      "Search result limit failed",
    );

    for (const result of response.results) {
      assertCondition(
        !searchResultContainsProtectedFields(result),
        `Protected fields leaked for material ${result.id}`,
      );

      assertCondition(
        result.href.startsWith("/"),
        `Unsafe public href for material ${result.id}`,
      );
    }
  }

  const draftMaterial = await prisma.material.findFirst({
    where: {
      isPublished: false,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (
    draftMaterial &&
    parseSearchQuery(
      draftMaterial.title.slice(0, SEARCH_QUERY_MAX_LENGTH),
    ).isValid
  ) {
    const response = await searchPublishedMaterials(
      draftMaterial.title.slice(0, SEARCH_QUERY_MAX_LENGTH),
    );

    assertCondition(
      !response.results.some(
        (result) => result.id === draftMaterial.id,
      ),
      "Unpublished material leaked into search results",
    );
  }

  console.log("");
  console.log("Material search audit");
  console.log("---------------------");
  console.log("Query validation: OK");
  console.log("Search page integration: OK");
  console.log("Published material lookup: OK");
  console.log("Unpublished material isolation: OK");
  console.log("Protected fields sanitization: OK");
  console.log(`Result limit: ${SEARCH_RESULT_LIMIT}`);
  console.log("");
  console.log("Material search state is OK.");
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Unknown material search audit error",
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });