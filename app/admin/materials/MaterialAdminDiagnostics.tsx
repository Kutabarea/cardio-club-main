import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";

import styles from "@/app/styles/Admin.module.css";

type MaterialWithCategory = Prisma.MaterialGetPayload<{
  include: {
    category: true;
  };
}>;

type MaterialAdminDiagnosticsProps = {
  material: MaterialWithCategory;
};

function getImageStatus(material: MaterialWithCategory) {
  if (material.imageUrl) {
    return {
      label: "Из БД",
      text: material.imageUrl,
      isOk: true,
    };
  }

  return {
    label: "Fallback",
    text: "Картинка не задана — на главной будет шаблонная.",
    isOk: false,
  };
}

function getVisibilityStatus(material: MaterialWithCategory) {
  const publicHref = getMaterialPublicHref(material);
  const hasPublicPage = Boolean(material.isPublished && publicHref);
  const canAppearOnHome = hasPublicPage;

  const issues: string[] = [];

  if (!material.isPublished) {
    issues.push("Материал в черновике. Он не появится на сайте и на главной.");
  }

  if (!publicHref) {
    issues.push("Для материала не найден публичный маршрут. Проверь тип и категорию.");
  }

  if (!material.imageUrl) {
    issues.push("Картинка не задана. Будет использована шаблонная картинка.");
  }

  if (material.isPremium) {
    issues.push("Материал Premium. Контент откроется только пользователям с подпиской.");
  }

  if (issues.length === 0) {
    issues.push("Материал готов к публичному отображению.");
  }

  return {
    publicHref,
    hasPublicPage,
    canAppearOnHome,
    issues,
  };
}

export default function MaterialAdminDiagnostics({
  material,
}: MaterialAdminDiagnosticsProps) {
  const visibility = getVisibilityStatus(material);
  const image = getImageStatus(material);

  return (
    <section className={styles.materialDiagnostics}>
      <div className={styles.materialDiagnosticsHeader}>
        <span
          className={
            visibility.hasPublicPage
              ? styles.materialDiagnosticsStatusOk
              : styles.materialDiagnosticsStatusWarning
          }
        >
          {visibility.hasPublicPage ? "Публично доступен" : "Не виден на сайте"}
        </span>

        <span
          className={
            visibility.canAppearOnHome
              ? styles.materialDiagnosticsStatusOk
              : styles.materialDiagnosticsStatusWarning
          }
        >
          Главная: {visibility.canAppearOnHome ? "да" : "нет"}
        </span>
      </div>

      <dl className={styles.materialDiagnosticsList}>
        <div>
          <dt>Публичный URL</dt>
          <dd>
            {visibility.publicHref ? (
              <Link href={visibility.publicHref} target="_blank" rel="noreferrer">
                {visibility.publicHref}
              </Link>
            ) : (
              "Нет"
            )}
          </dd>
        </div>

        <div>
          <dt>Картинка</dt>
          <dd>
            <span
              className={
                image.isOk
                  ? styles.materialDiagnosticsInlineOk
                  : styles.materialDiagnosticsInlineWarning
              }
            >
              {image.label}
            </span>
            {" "}
            {image.text}
          </dd>
        </div>

        <div>
          <dt>Категория</dt>
          <dd>{material.category?.title ?? "Без категории"}</dd>
        </div>

        <div>
          <dt>Доступ</dt>
          <dd>{material.isPremium ? "Premium" : "Free"}</dd>
        </div>
      </dl>

      <ul className={styles.materialDiagnosticsIssues}>
        {visibility.issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </section>
  );
}