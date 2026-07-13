import Base from "../../components/Base";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BasePage() {
  const sections = await prisma.ecgSection.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        title: "asc",
      },
    ],
    include: {
      materials: {
        where: {
          isPublished: true,
          category: {
            slug: "ecg-base",
          },
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            title: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return <Base sections={sections} />;
}