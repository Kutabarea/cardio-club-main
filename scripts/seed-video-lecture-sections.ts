import "dotenv/config";

import { prisma } from "@/lib/prisma";
import {
  defaultVideoLectureSections,
  ensureDefaultVideoLectureSections,
} from "@/lib/videoLectureSections";

async function main() {
  await ensureDefaultVideoLectureSections();

  const count = await prisma.videoLectureSection.count();

  console.log("");
  console.log(
    `Разделы видеолекций: ${count}. Ожидалось минимум: ${defaultVideoLectureSections.length}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });