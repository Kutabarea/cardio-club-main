/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import MarkdownContent from "@/app/components/MarkdownContent";
import PremiumAccessNotice from "@/app/components/PremiumAccessNotice";
import {
  getMaterialForCurrentViewer,
  isSafeRouteSlug,
} from "@/lib/materialAccess";

import styles from "@/app/styles/VideoCourses.module.css";

export const dynamic = "force-dynamic";

type VideoCourseDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VideoCourseDetailPage({
  params,
}: VideoCourseDetailPageProps) {
  const { slug } = await params;

  if (!isSafeRouteSlug(slug)) {
    notFound();
  }

  const result = await getMaterialForCurrentViewer({
    where: {
      slug,
      type: "VIDEO_COURSE",
    },
  });

  if (!result) {
    notFound();
  }

  const { material: course, access } = result;

  return (
    <main className={styles.coursePage}>
      <div className="container">
        <Link href="/videocourses" className={styles.courseBackLink}>
          ← Видеокурсы
        </Link>

        <article className={styles.courseArticle}>
          {course.imageUrl ? (
            <img className={styles.courseHeroImage} src={course.imageUrl} alt={course.title} />
          ) : null}

          <div className={styles.courseArticleHeader}>
            <div className={styles.course__badges}>
              <span className={styles.course__badge}>Видеокурс</span>

              {course.isPremium ? (
                <span className={styles.course__badgePremium}>Premium</span>
              ) : (
                <span className={styles.course__badgeFree}>Free</span>
              )}
            </div>

            <h1>{course.title}</h1>

            {course.description ? <p>{course.description}</p> : null}
          </div>

          <PremiumAccessNotice access={access} />

          {access.canRead ? (
            <div className={styles.courseArticleBody}>
              {course.videoUrl ? (
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.courseVideoLink}
                >
                  Открыть видео курса
                </a>
              ) : null}

              <MarkdownContent content={course.content || "Материал курса пока заполняется."} />
            </div>
          ) : (
            <div className={styles.coursePremiumBox}>
              <h2>Материал доступен по Premium-подписке</h2>
              <p>
                Войдите в аккаунт или оформите подписку в профиле, чтобы открыть курс.
              </p>

              {access.isAuthenticated ? (
                <Link href="/profile/subscription">Перейти к подписке</Link>
              ) : null}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}