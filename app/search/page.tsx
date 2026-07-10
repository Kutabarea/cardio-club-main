import Link from "next/link";

import { prisma } from "@/lib/prisma";

import DescriptionText from "@/app/components/DescriptionText";
import HeaderText from "@/app/components/HeaderText";
import styles from "@/app/styles/SearchPage.module.css";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function getMaterialHref(material: {
  slug: string;
  type: string;
  category: {
    slug: string;
  } | null;
}) {
  if (material.type === "VIDEO_LECTURE") {
    return `/videolecture/${material.slug}`;
  }

  if (material.category?.slug === "ecg-base") {
    return `/library/base/${material.slug}`;
  }

  if (material.category?.slug) {
    return `/library/${material.category.slug}/${material.slug}`;
  }

  return "/library";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";

  const materials = query
    ? await prisma.material.findMany({
        where: {
          isPublished: true,
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              description: {
                contains: query,
              },
            },
            {
              content: {
                contains: query,
              },
            },
            {
              category: {
                title: {
                  contains: query,
                },
              },
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <main className={styles.search}>
      <div className="container">
        <div className={styles.inner}>
          <HeaderText color="#000" className={styles.title}>
            Поиск по сайту
          </HeaderText>

          <DescriptionText className={styles.description}>
            Найдите статьи, материалы ЭКГ базы, видеолекции и другие разделы Cardio Club.
          </DescriptionText>

          <form action="/search" method="get" className={styles.form}>
            <input
              className={styles.input}
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Введите запрос"
            />

            <button className={styles.button} type="submit">
              Найти
            </button>

            {query && (
              <Link href="/search" className={styles.reset}>
                Сбросить
              </Link>
            )}
          </form>

          {query ? (
            <section className={styles.results}>
              <h2 className={styles.resultsTitle}>
                Результаты поиска: {materials.length}
              </h2>

              {materials.length > 0 ? (
                <div className={styles.list}>
                  {materials.map((material) => (
                    <Link
                      key={material.id}
                      href={getMaterialHref(material)}
                      className={styles.card}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.type}>{material.type}</span>

                        {material.category && (
                          <span className={styles.category}>
                            {material.category.title}
                          </span>
                        )}

                        {material.isPremium && (
                          <span className={styles.premium}>Premium</span>
                        )}
                      </div>

                      <h3 className={styles.cardTitle}>{material.title}</h3>

                      {material.description && (
                        <p className={styles.cardDescription}>
                          {material.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>
                  По запросу «{query}» ничего не найдено.
                </p>
              )}
            </section>
          ) : (
            <p className={styles.empty}>
              Введите запрос, например: «QRS», «ритм», «фармакология».
            </p>
          )}
        </div>
      </div>
    </main>
  );
}