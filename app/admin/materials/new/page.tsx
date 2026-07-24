import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import MaterialContentEditor from "../MaterialContentEditor";
import MaterialSectionFields from "../MaterialSectionFields";
import { createMaterialAction } from "../actions";

export const dynamic = "force-dynamic";

type NewMaterialPageProps = {
  searchParams: Promise<{
    error?: string;
    categorySlug?: string;
    ecgSectionId?: string;
    videoLectureSectionId?: string;
    type?: string;
    sortOrder?: string;
    returnTo?: string;
  }>;
};

function getMessage(error?: string) {
  if (error === "required-fields") {
    return "Заполни название и выбери размещение материала.";
  }

  if (error === "slug-required") {
    return "Не удалось создать slug. Укажи slug вручную.";
  }

  if (error === "slug-exists") {
    return "Материал с таким slug уже существует.";
  }

  if (error === "invalid-image") {
    return "Можно загружать только JPG, PNG, WEBP или GIF.";
  }

  if (error === "image-too-large") {
    return "Картинка слишком большая. Максимум — 5 МБ.";
  }

  if (error === "invalid-url") {
    return "Проверь ссылку на изображение или видео.";
  }

  if (error === "content-too-large") {
    return "Текст материала слишком большой.";
  }

  if (error === "category-not-found") {
    return "Выбранная категория не найдена.";
  }

  if (error === "invalid-classification") {
    return "Выбранное размещение не соответствует типу материала.";
  }

  return null;
}

function parseSortOrder(value?: string) {
  const sortOrder = Number.parseInt(
    value ?? "100",
    10,
  );

  return Number.isFinite(sortOrder)
    ? sortOrder
    : 100;
}

export default async function NewMaterialPage({
  searchParams,
}: NewMaterialPageProps) {
  const {
    error,
    categorySlug,
    ecgSectionId,
    videoLectureSectionId,
    type,
    sortOrder,
    returnTo,
  } = await searchParams;

  const [
    contentAreas,
    ecgSections,
    videoLectureSections,
    preselectedCategory,
  ] = await Promise.all([
    prisma.contentArea.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
      include: {
        categories: {
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
            subsectionKind: true,
            sortOrder: true,
            isActive: true,
          },
        },
      },
    }),

    prisma.ecgSection.findMany({
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
        description: true,
        categoryId: true,
        isActive: true,
      },
    }),

    prisma.videoLectureSection.findMany({
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
        description: true,
        categoryId: true,
        isActive: true,
      },
    }),

    categorySlug
      ? prisma.category.findUnique({
          where: {
            slug: categorySlug,
          },
          select: {
            id: true,
            contentArea: {
              select: {
                materialType: true,
              },
            },
          },
        })
      : null,
  ]);

  const message = getMessage(error);

  const defaultCategoryId =
    preselectedCategory?.id ?? "";

  const defaultType =
    type ||
    preselectedCategory?.contentArea?.materialType ||
    "ECG_ARTICLE";

  const defaultSortOrder =
    parseSortOrder(sortOrder);

  const safeReturnTo =
    returnTo?.startsWith("/admin")
      ? returnTo
      : "/admin/materials";

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link
            href="/admin/materials"
            className={styles.backLink}
          >
            ← Материалы
          </Link>

          <h1 className={styles.pageTitle}>
            Новый материал
          </h1>

          <p className={styles.pageDescription}>
            Сначала выбери раздел, категорию и подраздел,
            затем заполни материал.
          </p>
        </div>
      </div>

      {message ? (
        <div className={styles.adminNoticeError}>
          {message}
        </div>
      ) : null}

      <form
        action={createMaterialAction}
        className={styles.simpleEditLayout}
      >
        <input
          type="hidden"
          name="redirectPath"
          value="/admin/materials/new"
        />

        <input
          type="hidden"
          name="afterCreatePath"
          value={safeReturnTo}
        />

        <main className={styles.simpleEditMain}>
          <MaterialSectionFields
            contentAreas={contentAreas}
            ecgSections={ecgSections}
            videoLectureSections={
              videoLectureSections
            }
            initialCategoryId={defaultCategoryId}
            initialType={defaultType}
            currentEcgSectionId={
              ecgSectionId ?? ""
            }
            currentVideoLectureSectionId={
              videoLectureSectionId ?? ""
            }
            currentSortOrder={defaultSortOrder}
          />

          <section className={styles.simpleEditCard}>
            <div
              className={
                styles.simpleEditCardHeader
              }
            >
              <h2>Содержание материала</h2>

              <p>
                Название, описание и основной текст.
              </p>
            </div>

            <label className={styles.formGroup}>
              <span className={styles.label}>
                Название
              </span>

              <input
                className={styles.input}
                name="title"
                placeholder="Например: Частота ЭКГ"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>
                Короткое описание
              </span>

              <textarea
                className={styles.textareaSmall}
                name="description"
                placeholder="1–2 предложения для карточки материала."
              />
            </label>

            <MaterialContentEditor defaultValue="" />
          </section>

          <details
            className={styles.simpleEditDetails}
          >
            <summary>
              Служебные настройки
            </summary>

            <div
              className={
                styles.simpleEditDetailsBody
              }
            >
              <label className={styles.formGroup}>
                <span className={styles.label}>
                  Slug
                </span>

                <input
                  className={styles.input}
                  name="slug"
                  placeholder="ecg-frequency"
                />

                <span className={styles.formHint}>
                  Если оставить поле пустым, slug
                  создастся из названия.
                </span>
              </label>
            </div>
          </details>

          <details
            className={styles.simpleEditDetails}
          >
            <summary>
              Изображение и видео
            </summary>

            <div
              className={
                styles.simpleEditDetailsBody
              }
            >
              <label className={styles.formGroup}>
                <span className={styles.label}>
                  Загрузить картинку
                </span>

                <input
                  className={styles.input}
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>
                  URL изображения
                </span>

                <input
                  className={styles.input}
                  name="imageUrl"
                  placeholder="/images/materials__img__1.png"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>
                  Видео URL
                </span>

                <input
                  className={styles.input}
                  name="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
            </div>
          </details>
        </main>

        <aside className={styles.simpleEditSide}>
          <section className={styles.simpleEditCard}>
            <div
              className={
                styles.simplePublishControls
              }
            >
              <label
                className={styles.simpleCheckbox}
              >
                <input
                  name="isPublished"
                  type="checkbox"
                />

                <span>Опубликован</span>
              </label>

              <p className={styles.formHint}>
                Материал появится на сайте только
                после публикации.
              </p>

              <label
                className={styles.simpleCheckbox}
              >
                <input
                  name="isPremium"
                  type="checkbox"
                />

                <span>Premium-доступ</span>
              </label>
            </div>

            <button
              className={styles.simpleSaveButton}
              type="submit"
            >
              Создать материал
            </button>

            <Link
              href="/admin/materials"
              className={
                styles.simplePreviewButton
              }
            >
              Отмена
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}