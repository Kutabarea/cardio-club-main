/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import MarkdownContent from "@/app/components/MarkdownContent";
import MaterialVideoPlayer from "@/app/components/MaterialVideoPlayer";
import PremiumAccessNotice from "@/app/components/PremiumAccessNotice";
import {
  getMaterialForCurrentViewer,
  isSafeRouteSlug,
} from "@/lib/materialAccess";

import styles from "@/app/styles/MaterialArticle.module.css";

export const dynamic = "force-dynamic";

type VideoLecturePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VideoLecturePage({ params }: VideoLecturePageProps) {
  const { slug } = await params;

  if (!isSafeRouteSlug(slug)) {
    notFound();
  }

  const result = await getMaterialForCurrentViewer({
    where: {
      slug,
      type: "VIDEO_LECTURE",
    },
  });

  if (!result) {
    notFound();
  }

  const { material, access } = result;

  return (
    <main className={styles.page}>
      <Link href="/videolecture" className={styles.backLink}>
        ← Видеолекции
      </Link>

      <section className={styles.hero}>
        <div className={styles.badges}>
          <span className={styles.badge}>Видеолекция</span>

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
        <>
          {material.videoUrl ? (
            <MaterialVideoPlayer
              url={material.videoUrl}
              title={material.title}
              poster={material.imageUrl}
            />
          ) : null}

          <article className={styles.contentCard}>
            <MarkdownContent content={material.content} />
          </article>
        </>
      ) : (
        <section className={styles.lockedCard}>
          <span>Видеолекция скрыта</span>
          <strong>Оформите Premium, чтобы открыть лекцию.</strong>
          <p>
            Описание видеолекции доступно выше. Видео и материалы откроются после
            входа и активной premium-подписки.
          </p>
        </section>
      )}
    </main>
  );
}