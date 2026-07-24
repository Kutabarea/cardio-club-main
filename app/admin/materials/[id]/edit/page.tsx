/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import MaterialContentEditor from "../../MaterialContentEditor";
import MaterialSectionFields from "../../MaterialSectionFields";
import { updateMaterialAction } from "../../actions";

type EditMaterialPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(
  error?: string,
  success?: string,
) {
  if (success === "updated") {
    return {
      type: "success",
      text: "Материал сохранён.",
    };
  }

  if (error === "required-fields") {
    return {
      type: "error",
      text: "Заполни название и выбери размещение материала.",
    };
  }

  if (error === "slug-required") {
    return {
      type: "error",
      text: "Не удалось создать slug. Укажи slug вручную.",
    };
  }

  if (error === "slug-exists") {
    return {
      type: "error",
      text: "Материал с таким slug уже существует.",
    };
  }

  if (error === "invalid-image") {
    return {
      type: "error",
      text: "Можно загружать только JPG, PNG, WEBP или GIF.",
    };
  }

  if (error === "image-too-large") {
    return {
      type: "error",
      text: "Картинка слишком большая. Максимум — 5 МБ.",
    };
  }

  if (error === "invalid-url") {
    return {
      type: "error",
      text: "Проверь ссылку на изображение или видео.",
    };
  }

  if (error === "content-too-large") {
    return {
      type: "error",
      text: "Текст материала слишком большой.",
    };
  }

  if (error === "not-found") {
    return {
      type: "error",
      text: "Материал не найден.",
    };
  }

  if (error === "category-not-found") {
    return {
      type: "error",
      text: "Выбранная категория не найдена.",
    };
  }

  if (error === "invalid-classification") {
    return {
      type: "error",
      text: "Выбранное размещение не соответствует типу материала.",
    };
  }

  return null;
}

function getMaterialTypeLabel(type: string) {
  if (type === "ECG_ARTICLE") {
    return "Статья";
  }

  if (type === "VIDEO_LECTURE") {
    return "Видеолекция";
  }

  if (type === "VIDEO_COURSE") {
    return "Видеокурс";
  }

  if (type === "HELPER") {
    return "Полезный ресурс";
  }

  if (type === "NEWS") {
    return "Новость";
  }

  if (type === "LITERATURE") {
    return "Литература";
  }

  return type;
}

export default async function EditMaterialPage({
  params,
  searchParams,
}: EditMaterialPageProps) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [
    material,
    contentAreas,
    ecgSections,
    videoLectureSections,
  ] = await Promise.all([
    prisma.material.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        ecgSection: true,
        videoLectureSection: true,
      },
    }),

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
  ]);

  if (!material) {
    notFound();
  }

  const message = getMessage(error, success);

  const currentPath =
    `/admin/materials/${material.id}/edit`;

  const publicHref =
    getMaterialPublicHref(material);

  const selectedSubsection =
    material.ecgSection?.title ??
    material.videoLectureSection?.title ??
    "Без подраздела";

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
            Редактирование материала
          </h1>

          <p className={styles.pageDescription}>
            Измени размещение, текст, медиа и
            настройки публикации.
          </p>
        </div>

        <div
          className={
            styles.simpleEditHeaderActions
          }
        >
          <Link
            href={`/admin/materials/${material.id}/preview`}
            className={
              styles.secondaryAdminAction
            }
          >
            Предпросмотр
          </Link>

          {material.isPublished &&
          publicHref ? (
            <Link
              href={publicHref}
              className={
                styles.primaryAdminAction
              }
              target="_blank"
              rel="noreferrer"
            >
              На сайте
            </Link>
          ) : null}
        </div>
      </div>

      {message ? (
        <div
          className={
            message.type === "success"
              ? styles.adminNoticeSuccess
              : styles.adminNoticeError
          }
        >
          {message.text}
        </div>
      ) : null}

      <form
        action={updateMaterialAction}
        className={styles.simpleEditLayout}
      >
        <input
          type="hidden"
          name="id"
          value={material.id}
        />

        <input
          type="hidden"
          name="redirectPath"
          value={currentPath}
        />

        <main className={styles.simpleEditMain}>
          <MaterialSectionFields
            contentAreas={contentAreas}
            ecgSections={ecgSections}
            videoLectureSections={
              videoLectureSections
            }
            initialCategoryId={
              material.categoryId
            }
            initialType={material.type}
            currentEcgSectionId={
              material.ecgSectionId
            }
            currentVideoLectureSectionId={
              material.videoLectureSectionId
            }
            currentSortOrder={
              material.sortOrder
            }
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
                defaultValue={material.title}
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
                defaultValue={
                  material.description ?? ""
                }
              />
            </label>

            <MaterialContentEditor
              defaultValue={
                material.content ?? ""
              }
            />
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
                  defaultValue={material.slug}
                />

                <span className={styles.formHint}>
                  Используется в публичной ссылке.
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
              {material.imageUrl ? (
                <div
                  className={
                    styles.simpleImagePreview
                  }
                >
                  <img
                    src={material.imageUrl}
                    alt=""
                  />

                  <div>
                    <span>
                      Текущее изображение
                    </span>

                    <strong>
                      {material.imageUrl}
                    </strong>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    styles.emptyEditorState
                  }
                >
                  У материала пока нет изображения.
                </div>
              )}

              <label className={styles.formGroup}>
                <span className={styles.label}>
                  Загрузить новую картинку
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
                  defaultValue={
                    material.imageUrl ?? ""
                  }
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>
                  Видео URL
                </span>

                <input
                  className={styles.input}
                  name="videoUrl"
                  defaultValue={
                    material.videoUrl ?? ""
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
            </div>
          </details>
        </main>

        <aside className={styles.simpleEditSide}>
          <section className={styles.simpleEditCard}>
            <div className={styles.simpleStatusLine}>
              <span
                className={
                  material.isPublished
                    ? styles.materialBadgePublished
                    : styles.materialBadgeDraft
                }
              >
                {material.isPublished
                  ? "Опубликован"
                  : "Черновик"}
              </span>

              <span
                className={
                  material.isPremium
                    ? styles.materialBadgePremium
                    : styles.materialBadgeFree
                }
              >
                {material.isPremium
                  ? "Premium"
                  : "Free"}
              </span>
            </div>

            <div className={styles.simpleEditMeta}>
              <div>
                <span>Тип</span>

                <strong>
                  {getMaterialTypeLabel(
                    material.type,
                  )}
                </strong>
              </div>

              <div>
                <span>Категория</span>

                <strong>
                  {material.category?.title ??
                    "Без категории"}
                </strong>
              </div>

              <div>
                <span>Подраздел</span>

                <strong>
                  {selectedSubsection}
                </strong>
              </div>
            </div>

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
                  defaultChecked={
                    material.isPublished
                  }
                />

                <span>Опубликован</span>
              </label>

              <label
                className={styles.simpleCheckbox}
              >
                <input
                  name="isPremium"
                  type="checkbox"
                  defaultChecked={
                    material.isPremium
                  }
                />

                <span>Premium-доступ</span>
              </label>
            </div>

            <button
              className={styles.simpleSaveButton}
              type="submit"
            >
              Сохранить
            </button>

            <Link
              href={`/admin/materials/${material.id}/preview`}
              className={
                styles.simplePreviewButton
              }
            >
              Открыть предпросмотр
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}