import Link from "next/link";

import { prisma } from "@/lib/prisma";

import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import styles from "../styles/LibraryHome.module.css";

const categoryOrder = [
  "ecg-base",
  "ecg-trainer",
  "pathology-a-z",
  "useful-resources",
  "video-lectures",
];

const categoryLinks: Record<string, string> = {
  "ecg-base": "/library/base",
  "ecg-trainer": "/library/trainer",
  "pathology-a-z": "/library/pathology",
  "useful-resources": "/library/resources",
  "video-lectures": "/videolecture",
};

function getCategoryHref(slug: string) {
  return categoryLinks[slug] ?? `/library/${slug}`;
}

export default async function Library() {
  const categories = await prisma.category.findMany({
    include: {
      materials: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const sortedCategories = categories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.slug);
    const bIndex = categoryOrder.indexOf(b.slug);

    if (aIndex === -1 && bIndex === -1) {
      return a.title.localeCompare(b.title);
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  return (
    <main className={styles.library}>
      <div className="container">
        <div className={styles.inner}>
          <HeaderText color="#000" className={styles.title}>
            Библиотека
          </HeaderText>

          <DescriptionText className={styles.description}>
            Разделы с материалами, статьями, видеолекциями и учебными блоками.
          </DescriptionText>

          {sortedCategories.length > 0 ? (
            <div className={styles.grid}>
              {sortedCategories.map((category) => (
                <Link
                  key={category.id}
                  href={getCategoryHref(category.slug)}
                  className={styles.card}
                >
                  <span className={styles.cardLabel}>Раздел</span>

                  <h2 className={styles.cardTitle}>{category.title}</h2>

                  <p className={styles.cardDescription}>
                    {category.description ?? "Материалы этого раздела."}
                  </p>

                  <span className={styles.cardCount}>
                    {category.materials.length} опубликованных материалов
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <DescriptionText className={styles.empty}>
              Категорий пока нет.
            </DescriptionText>
          )}
        </div>
      </div>
    </main>
  );
}