/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import MarkdownContent from "@/app/components/MarkdownContent";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActivePremiumAccess } from "@/lib/subscriptions";

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

  const course = await prisma.material.findFirst({
    where: {
      slug,
      type: "VIDEO_COURSE",
      isPublished: true,
    },
  });

  if (!course) {
    notFound();
  }

  const user = await getCurrentUser();
  const hasPremium = user ? hasActivePremiumAccess(user.subscriptions) : false;
  const canRead = !course.isPremium || hasPremium;

  if (course.isPremium && !user) {
    redirect("/login");
  }

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

          {canRead ? (
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
                У этого аккаунта нет активной Premium-подписки. Оформи подписку в
                профиле, чтобы открыть курс.
              </p>

              <Link href="/profile/subscription">Перейти к подписке</Link>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}