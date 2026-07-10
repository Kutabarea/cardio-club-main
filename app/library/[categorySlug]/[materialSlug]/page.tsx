import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DescriptionText from "@/app/components/DescriptionText";
import HeaderText from "@/app/components/HeaderText";
import styles from "@/app/styles/LibraryPublic.module.css";

export const dynamic = "force-dynamic";

type LibraryMaterialPageProps = {
  params: Promise<{
    categorySlug: string;
    materialSlug: string;
  }>;
};

export default async function LibraryMaterialPage({
  params,
}: LibraryMaterialPageProps) {
  const { categorySlug, materialSlug } = await params;

  const material = await prisma.material.findUnique({
    where: {
      slug: materialSlug,
    },
    include: {
      category: true,
    },
  });

  if (
    !material ||
    !material.isPublished ||
    !material.category ||
    material.category.slug !== categorySlug
  ) {
    notFound();
  }

  if (material.type === "VIDEO_LECTURE") {
    redirect(`/videolecture/${material.slug}`);
  }

  if (material.category.slug === "ecg-base") {
    redirect(`/library/base/${material.slug}`);
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
    <main className={styles.page}>
      <div className="container">
        <div className={styles.articleInner}>
          <div className={styles.breadcrumbs}>
            <Link href="/library">Библиотека</Link>
            <span>›</span>
            <Link href={`/library/${material.category.slug}`}>
              {material.category.title}
            </Link>
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
              <span className={styles.premium}>Premium</span>
            )}
          </div>

          <article className={styles.content}>
            {material.content ? (
              material.content
                .split("\n")
                .filter(Boolean)
                .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p>Материал пока заполняется.</p>
            )}
          </article>

          <Link href={`/library/${material.category.slug}`} className={styles.backLink}>
            ← Назад к категории
          </Link>
        </div>
      </div>
    </main>
  );
}