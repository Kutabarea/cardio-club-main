import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import styles from "../styles/Library.module.css";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import SubHeaderText from "./SubHeaderText";

type LibraryCategoryMaterialsProps = {
  categorySlug: string;
};

const materialTypeLabels: Record<string, string> = {
  ECG_ARTICLE: "ЭКГ",
  VIDEO_LECTURE: "Видеолекция",
  COURSE: "Курс",
  HELPER: "Справочник",
};

export default async function LibraryCategoryMaterials({
  categorySlug,
}: LibraryCategoryMaterialsProps) {
  const category = await prisma.category.findUnique({
    where: {
      slug: categorySlug,
    },
  });

  if (!category) {
    notFound();
  }

  const materials = await prisma.material.findMany({
    where: {
      isPublished: true,
      category: {
        slug: categorySlug,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className={styles.library}>
      <div className="container">
        <div className={styles.library__inner}>
          <Link href="/library" className={styles.library__back}>
            ← Назад к разделам
          </Link>

          <HeaderText color="#000">{category.title}</HeaderText>

          {category.description && (
            <DescriptionText className={styles.library__categoryDescription}>
              {category.description}
            </DescriptionText>
          )}

          <section className={styles.library__materials}>
            {materials.length > 0 ? (
              <div className={styles.materials__grid}>
                {materials.map((material) => (
                  <article key={material.id} className={styles.material__card}>
                    {material.imageUrl && (
                      <Image
                        src={material.imageUrl}
                        alt=""
                        width={320}
                        height={180}
                        className={styles.material__image}
                      />
                    )}

                    <div className={styles.material__content}>
                      <div className={styles.material__meta}>
                        <span className={styles.material__type}>
                          {materialTypeLabels[material.type] ?? material.type}
                        </span>

                        {material.isPremium && (
                          <span className={styles.material__premium}>
                            Premium
                          </span>
                        )}
                      </div>

                      <SubHeaderText className={styles.material__title}>
                        {material.title}
                      </SubHeaderText>

                      {material.description && (
                        <DescriptionText className={styles.material__description}>
                          {material.description}
                        </DescriptionText>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <DescriptionText className={styles.materials__empty}>
                В этом разделе пока нет материалов.
              </DescriptionText>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
