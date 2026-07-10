import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DescriptionText from "@/app/components/DescriptionText";
import HeaderText from "@/app/components/HeaderText";
import styles from "@/app/styles/VideoLectureArticle.module.css";

export const dynamic = "force-dynamic";

type VideoLectureArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VideoLectureArticlePage({
  params,
}: VideoLectureArticlePageProps) {
  const { slug } = await params;

  const lecture = await prisma.material.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
    },
  });

  if (!lecture || !lecture.isPublished || lecture.type !== "VIDEO_LECTURE") {
    notFound();
  }

  if (lecture.isPremium) {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    const hasActiveSubscription = user.subscriptions.some((subscription) => {
      if (subscription.status !== "ACTIVE") {
        return false;
      }

      if (!subscription.endsAt) {
        return true;
      }

      return new Date(subscription.endsAt) > new Date();
    });

    if (!hasActiveSubscription) {
      redirect("/profile/subscription");
    }
  }

  return (
    <main className={styles.lecture}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.breadcrumbs}>
            <Link href="/videolecture">Видеолекции</Link>
            <span>›</span>
            <span>{lecture.title}</span>
          </div>

          <div className={styles.header}>
            <div>
              <HeaderText color="#000" className={styles.title}>
                {lecture.title}
              </HeaderText>

              {lecture.description && (
                <DescriptionText className={styles.description}>
                  {lecture.description}
                </DescriptionText>
              )}
            </div>

            {lecture.isPremium && (
              <span className={styles.premiumBadge}>Premium</span>
            )}
          </div>

          {lecture.imageUrl && (
            <Image
              src={lecture.imageUrl}
              alt=""
              width={960}
              height={420}
              className={styles.cover}
            />
          )}

          <section className={styles.playerBox}>
            {lecture.videoUrl ? (
              <a
                href={lecture.videoUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.videoLink}
              >
                Открыть видео
              </a>
            ) : (
              <p>Видео пока не прикреплено. Здесь позже будет плеер или ссылка на видеоматериал.</p>
            )}
          </section>

          <article className={styles.content}>
            {lecture.content ? (
              lecture.content
                .split("\n")
                .filter(Boolean)
                .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p>Описание лекции пока заполняется.</p>
            )}
          </article>

          <Link href="/videolecture" className={styles.backLink}>
            ← Назад к видеолекциям
          </Link>
        </div>
      </div>
    </main>
  );
}