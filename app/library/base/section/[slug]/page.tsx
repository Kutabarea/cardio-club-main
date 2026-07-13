import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/EcgSectionPage.module.css";

export const dynamic = "force-dynamic";

type EcgSectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EcgSectionPage({ params }: EcgSectionPageProps) {
  const { slug } = await params;

  const section = await prisma.ecgSection.findUnique({
    where: {
      slug,
    },
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
          description: true,
          isPremium: true,
        },
      },
    },
  });

  if (!section) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Link href="/library/base" className={styles.backLink}>
        ← ЭКГ база
      </Link>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>ЭКГ база</p>

        <h1>{section.title}</h1>

        {section.description ? <p>{section.description}</p> : null}
      </section>

      <section className={styles.grid}>
        {section.materials.map((material) => (
          <Link
            key={material.id}
            href={`/library/base/${material.slug}`}
            className={styles.card}
          >
            <div>
              <h2>{material.title}</h2>

              {material.description ? (
                <p>{material.description}</p>
              ) : (
                <p>Материал ЭКГ базы.</p>
              )}
            </div>

            <span className={material.isPremium ? styles.premium : styles.free}>
              {material.isPremium ? "Premium" : "Free"}
            </span>
          </Link>
        ))}

        {section.materials.length === 0 ? (
          <div className={styles.empty}>
            В этом подразделе пока нет опубликованных материалов.
          </div>
        ) : null}
      </section>
    </main>
  );
}