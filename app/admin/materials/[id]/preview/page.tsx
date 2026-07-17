import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import MarkdownContent from "@/app/components/MarkdownContent";
import styles from "@/app/styles/Admin.module.css";
import { getCurrentUser } from "@/lib/auth";
import {
  getMaterialForViewer,
  getPremiumAccessStateForUser,
  isSafeDatabaseId,
} from "@/lib/materialAccess";
import { getMaterialPublicHref } from "@/lib/materialPublicHref";

export const dynamic = "force-dynamic";

type MaterialPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MaterialPreviewPage({
  params,
}: MaterialPreviewPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  if (!isSafeDatabaseId(id)) {
    notFound();
  }

  const result = await getMaterialForViewer({
    where: {
      id,
    },
    viewer: getPremiumAccessStateForUser(user),
    mode: "ADMIN_PREVIEW",
  });

  if (!result) {
    notFound();
  }

  const { material } = result;
  const publicHref = getMaterialPublicHref(material);
  const isLocalImage = Boolean(material.imageUrl?.startsWith("/"));

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link href="/admin/materials" className={styles.backLink}>
          ← Назад к материалам
        </Link>

        <h2 className={styles.pageTitle}>Предпросмотр материала</h2>
        <p className={styles.pageDescription}>
          Так материал будет выглядеть по содержанию перед публикацией.
        </p>

        <div className={styles.pageActions}>
          <Link
            href={`/admin/materials/${material.id}/edit`}
            className={styles.editLink}
          >
            Редактировать
          </Link>

          {publicHref && material.isPublished && (
            <Link href={publicHref} className={styles.openLink} target="_blank">
              Открыть на сайте
            </Link>
          )}
        </div>
      </div>

      <section className={styles.previewShell}>
        <div className={styles.previewBadges}>
          <span>{material.category?.title ?? "Без категории"}</span>
          <span>{material.type}</span>
          <span>{material.isPublished ? "Опубликовано" : "Черновик"}</span>
          <span>{material.isPremium ? "Premium" : "Free"}</span>
        </div>

        <h1 className={styles.previewTitle}>{material.title}</h1>

        {material.description && (
          <p className={styles.previewDescription}>{material.description}</p>
        )}

        {material.imageUrl && isLocalImage && (
          <div className={styles.previewImageWrap}>
            <Image
              src={material.imageUrl}
              alt={material.title}
              width={1200}
              height={620}
              className={styles.previewImage}
            />
          </div>
        )}

        {material.imageUrl && !isLocalImage && (
          <div className={styles.previewExternalImage}>
            Картинка указана внешней ссылкой:{" "}
            <a href={material.imageUrl} target="_blank" rel="noreferrer">
              открыть изображение
            </a>
          </div>
        )}

        {material.videoUrl && (
          <div className={styles.previewVideoBox}>
            <div>
              <strong>Видео:</strong>{" "}
              <a href={material.videoUrl} target="_blank" rel="noreferrer">
                {material.videoUrl}
              </a>
            </div>
          </div>
        )}

        {!material.isPublished && (
          <div className={styles.previewNotice}>
            Это черновик. Публичная страница будет недоступна, пока материал не опубликован.
          </div>
        )}

        <article className={styles.previewContent}>
          <MarkdownContent content={material.content} />
        </article>
      </section>
    </div>
  );
}