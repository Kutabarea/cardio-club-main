/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import MarkdownContent from "@/app/components/MarkdownContent";
import PremiumAccessNotice from "@/app/components/PremiumAccessNotice";
import {
  getMaterialForCurrentViewer,
  isSafeRouteSlug,
} from "@/lib/materialAccess";

import styles from "@/app/styles/MaterialArticle.module.css";

export const dynamic = "force-dynamic";

type BaseMaterialPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BaseMaterialPage({ params }: BaseMaterialPageProps) {
  const { slug } = await params;

  if (!isSafeRouteSlug(slug)) {
    notFound();
  }

  const result = await getMaterialForCurrentViewer({
    where: {
      slug,
      category: {
        slug: "ecg-base",
      },
    },
  });

  if (!result) {
    notFound();
  }

  const { material, access } = result;

  return (
    <main className={styles.page}>
      <Link href="/library/base" className={styles.backLink}>
        ← ЭКГ база
      </Link>

      <section className={styles.hero}>
        <div className={styles.badges}>
          <span className={styles.badge}>
            {material.category?.title ?? "ЭКГ база"}
          </span>

          <span className={material.isPremium ? styles.badgePremium : styles.badgeFree}>
            {material.isPremium ? "Premium" : "Free"}
          </span>
        </div>

        <h1 className={styles.title}>{material.title}</h1>

        {material.description ? (
          <p className={styles.description}>{material.description}</p>
        ) : null}
      </section>

      {material.imageUrl ? (
        <div className={styles.cover}>
          <img src={material.imageUrl} alt="" />
        </div>
      ) : null}

      <PremiumAccessNotice access={access} />

      {access.canRead ? (
        <article className={styles.contentCard}>
          <MarkdownContent content={material.content} />
        </article>
      ) : (
        <section className={styles.lockedCard}>
          <span>Содержание скрыто</span>
          <strong>Оформите Premium, чтобы читать материал полностью.</strong>
          <p>
            Описание материала доступно выше. Полный текст откроется после входа
            и активной premium-подписки.
          </p>
        </section>
      )}
    </main>
  );
}