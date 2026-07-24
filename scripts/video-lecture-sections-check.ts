import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import {
  defaultVideoLectureSections,
} from "@/lib/videoLectureSections";

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const sections = await prisma.videoLectureSection.findMany({
    select: {
      slug: true,
    },
  });

  assertCondition(
    sections.length >= defaultVideoLectureSections.length,
    "В базе отсутствуют обязательные разделы.",
  );

  const publicPage = fs.readFileSync(
    path.join(
      process.cwd(),
      "app",
      "components",
      "VideoLecture.tsx",
    ),
    "utf8",
  );

  const adminPage = fs.readFileSync(
    path.join(
      process.cwd(),
      "app",
      "admin",
      "video-lecture-sections",
      "page.tsx",
    ),
    "utf8",
  );

  assertCondition(
    publicPage.includes(
      'id={`video-section-${section.slug}`}',
    ),
    "На публичной странице нет якорей разделов.",
  );

  assertCondition(
    publicPage.includes("videoLectureSectionId: null"),
    "Видеолекции без раздела не обрабатываются.",
  );

  assertCondition(
    adminPage.includes(
      "assignVideoLectureSectionAction",
    ),
    "В админке отсутствует распределение видеолекций.",
  );

  console.log("");
  console.log("Разделы видеолекций: OK");
  console.log("Навигация по якорям: OK");
  console.log("Админское распределение: OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });