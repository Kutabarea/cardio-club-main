import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "../styles/Library.module.css";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import Search from "./Search";
import SubHeaderText from "./SubHeaderText";

const categoryOrder = [
  "ecg-base",
  "ecg-trainer",
  "pathology-a-z",
  "useful-resources",
];

const categoryLinks: Record<string, string> = {
  "ecg-base": "/library/base",
  "ecg-trainer": "/library/trainer",
  "pathology-a-z": "/library/pathology",
  "useful-resources": "/library/resources",
};

export default async function Library() {
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: categoryOrder,
      },
    },
    include: {
      _count: {
        select: {
          materials: true,
        },
      },
    },
  });

  const sortedCategories = categoryOrder
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is (typeof categories)[number] => Boolean(category));

  return (
    <div className={styles.library}>
      <div className="container">
        <div className={styles.library__inner}>
          <HeaderText color="#000">Библиотека ЭКГ</HeaderText>

          <div className={styles.library__items}>
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={categoryLinks[category.slug]}
                className={styles.library__item__link}
              >
                <article className={styles.library__item}>
                  <SubHeaderText className={styles.library__item__header}>
                    {category.title}
                  </SubHeaderText>

                  <DescriptionText className={styles.library__item__description}>
                    {category.description}
                  </DescriptionText>

                  <span className={styles.library__item__count}>
                    Материалов: {category._count.materials}
                  </span>
                </article>
              </Link>
            ))}
          </div>

          <Search title="" className={styles.search} />
        </div>
      </div>
    </div>
  );
}
