import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import MarkdownContent from "@/app/components/MarkdownContent";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DescriptionText from "@/app/components/DescriptionText";
import HeaderText from "@/app/components/HeaderText";
import styles from "@/app/styles/EcgArticle.module.css";

export const dynamic = "force-dynamic";

type EcgArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EcgArticlePage({ params }: EcgArticlePageProps) {
  const { slug } = await params;

  const material = await prisma.material.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
    },
  });

  if (!material || !material.isPublished || material.category?.slug !== "ecg-base") {
    notFound();
  }

  if (material.isPremium) {
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
    <main className={styles.article}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.breadcrumbs}>
            <Link href="/library">Библиотека ЭКГ</Link>
            <span>›</span>
            <Link href="/library/base">ЭКГ база</Link>
            <span>›</span>
            <span>{material.title}</span>
          </div>

          <div className={styles.articleHeader}>
            <div>
              <HeaderText color="#000" className={styles.title}>
                {material.title}
              </HeaderText>

              {material.description && (
                <DescriptionText className={styles.description}>
                  {material.description}
                </DescriptionText>
              )}
            </div>

            {material.isPremium && (
              <span className={styles.premiumBadge}>Premium</span>
            )}
          </div>

          <article className={styles.content}>
            <MarkdownContent content={material.content} />
          </article>

          <Link href="/library/base" className={styles.backLink}>
            ← Назад к ЭКГ базе
          </Link>
        </div>
      </div>
    </main>
  );
}