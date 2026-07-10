import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import DescriptionText from "@/app/components/DescriptionText";
import HeaderText from "@/app/components/HeaderText";
import styles from "@/app/styles/LibraryPublic.module.css";

export const dynamic = "force-dynamic";

type LibraryCategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

function getMaterialHref(categorySlug: string, materialSlug: string, type: string) {
  if (type === "VIDEO_LECTURE") {
    return `/videolecture/${materialSlug}`;
  }

  if (categorySlug === "ecg-base") {
    return `/library/base/${materialSlug}`;
  }

  return `/library/${categorySlug}/${materialSlug}`;
}

export default async function LibraryCategoryPage({
  params,
}: LibraryCategoryPageProps) {
  const { categorySlug } = await params;

  const category = await prisma.category.findUnique({
    where: {
      slug: categorySlug,
    },
    include: {
      materials: {
        where: {
          isPublished: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.breadcrumbs}>
            <Link href="/library">Библиотека</Link>
            <span>›</span>
            <span>{category.title}</span>
          </div>

          <HeaderText color="#000" className={styles.title}>
            {category.title}
          </HeaderText>

          {category.description && (
            <DescriptionText className={styles.description}>
              {category.description}
            </DescriptionText>
          )}

          {category.materials.length > 0 ? (
            <div className={styles.grid}>
              {category.materials.map((material) => (
                <Link
                  key={material.id}
                  href={getMaterialHref(category.slug, material.slug, material.type)}
                  className={styles.card}
                >
                  {material.imageUrl && (
                    <Image
                      src={material.imageUrl}
                      alt=""
                      width={520}
                      height={260}
                      className={styles.cardImage}
                    />
                  )}

                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <span className={styles.type}>{material.type}</span>

                      {material.isPremium && (
                        <span className={styles.premium}>Premium</span>
                      )}
                    </div>

                    <h2 className={styles.cardTitle}>{material.title}</h2>

                    {material.description && (
                      <p className={styles.cardDescription}>
                        {material.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <DescriptionText className={styles.empty}>
              В этой категории пока нет опубликованных материалов.
            </DescriptionText>
          )}
        </div>
      </div>
    </main>
  );
}