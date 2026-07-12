/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import MaterialContentEditor from "../../MaterialContentEditor";
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

function getMessage(error?: string, success?: string) {
  if (success === "updated") {
    return {
      type: "success",
      text: "Материал сохранён.",
    };
  }

  if (error === "required-fields") {
    return {
      type: "error",
      text: "Заполни название, тип и категорию материала.",
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
      text: "Можно загружать только изображения.",
    };
  }

  if (error === "image-too-large") {
    return {
      type: "error",
      text: "Картинка слишком большая. Максимум — 5 МБ.",
    };
  }

  if (error === "not-found") {
    return {
      type: "error",
      text: "Материал не найден.",
    };
  }

  return null;
}

function getMaterialTypeLabel(type: string) {
  if (type === "ECG_ARTICLE") return "Статья";
  if (type === "VIDEO_LECTURE") return "Видеолекция";
  if (type === "HELPER") return "Полезный ресурс";

  return type;
}

export default async function EditMaterialPage({
  params,
  searchParams,
}: EditMaterialPageProps) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [material, categories] = await Promise.all([
    prisma.material.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    }),
    prisma.category.findMany({
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  if (!material) {
    notFound();
  }

  const message = getMessage(error, success);
  const currentPath = `/admin/materials/${material.id}/edit`;
  const publicHref = getMaterialPublicHref(material);

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link href="/admin/materials" className={styles.backLink}>
            ← Материалы
          </Link>

          <h1 className={styles.pageTitle}>Редактирование материала</h1>

          <p className={styles.pageDescription}>
            Рабочий экран для редактора: текст, предпросмотр, публикация и служебные настройки.
          </p>
        </div>

        <div className={styles.simpleEditHeaderActions}>
          <Link
            href={`/admin/materials/${material.id}/preview`}
            className={styles.secondaryAdminAction}
          >
            Отдельный предпросмотр
          </Link>

          {material.isPublished && publicHref ? (
            <Link
              href={publicHref}
              className={styles.primaryAdminAction}
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

      <form action={updateMaterialAction} className={styles.simpleEditLayout}>
        <input type="hidden" name="id" value={material.id} />
        <input type="hidden" name="redirectPath" value={currentPath} />

        <main className={styles.simpleEditMain}>
          <section className={styles.simpleEditCard}>
            <div className={styles.simpleEditCardHeader}>
              <h2>Основное</h2>
              <p>Название, описание и содержание материала.</p>
            </div>

            <label className={styles.formGroup}>
              <span className={styles.label}>Название</span>
              <input
                className={styles.input}
                name="title"
                defaultValue={material.title}
                placeholder="Например: Комплекс QRS"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>Короткое описание</span>
              <textarea
                className={styles.textareaSmall}
                name="description"
                defaultValue={material.description ?? ""}
                placeholder="1–2 предложения для карточки материала."
              />
            </label>

            <MaterialContentEditor defaultValue={material.content ?? ""} />
          </section>

          <details className={styles.simpleEditDetails}>
            <summary>Служебные настройки</summary>

            <div className={styles.simpleEditDetailsBody}>
              <div className={styles.formGrid}>
                <label className={styles.formGroup}>
                  <span className={styles.label}>Slug</span>
                  <input
                    className={styles.input}
                    name="slug"
                    defaultValue={material.slug}
                    placeholder="complex-qrs"
                  />
                  <span className={styles.formHint}>
                    Используется в ссылке. Лучше латиница, цифры и дефисы.
                  </span>
                </label>

                <label className={styles.formGroup}>
                  <span className={styles.label}>Тип материала</span>
                  <select
                    className={styles.input}
                    name="type"
                    defaultValue={material.type}
                    required
                  >
                    <option value="ECG_ARTICLE">Статья / ЭКГ материал</option>
                    <option value="VIDEO_LECTURE">Видеолекция</option>
                    <option value="HELPER">Полезный ресурс</option>
                  </select>
                </label>
              </div>

              <label className={styles.formGroup}>
                <span className={styles.label}>Категория</span>
                <select
                  className={styles.input}
                  name="categoryId"
                  defaultValue={material.categoryId ?? ""}
                  required
                >
                  <option value="">Выбери категорию</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </details>

          <details className={styles.simpleEditDetails}>
            <summary>Изображение и видео</summary>

            <div className={styles.simpleEditDetailsBody}>
              {material.imageUrl ? (
                <div className={styles.simpleImagePreview}>
                  <img src={material.imageUrl} alt="" />

                  <div>
                    <span>Текущее изображение</span>
                    <strong>{material.imageUrl}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyEditorState}>
                  У материала пока нет изображения.
                </div>
              )}

              <label className={styles.formGroup}>
                <span className={styles.label}>Загрузить новую картинку</span>
                <input
                  className={styles.input}
                  name="imageFile"
                  type="file"
                  accept="image/*"
                />
                <span className={styles.formHint}>
                  Максимум 5 МБ. Если загрузить новую картинку, старая удалится.
                </span>
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>URL изображения</span>
                <input
                  className={styles.input}
                  name="imageUrl"
                  defaultValue={material.imageUrl ?? ""}
                  placeholder="/images/materials__img__1.png"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>Видео URL</span>
                <input
                  className={styles.input}
                  name="videoUrl"
                  defaultValue={material.videoUrl ?? ""}
                  placeholder="https://example.com/video"
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
                {material.isPublished ? "Опубликован" : "Черновик"}
              </span>

              <span
                className={
                  material.isPremium
                    ? styles.materialBadgePremium
                    : styles.materialBadgeFree
                }
              >
                {material.isPremium ? "Premium" : "Free"}
              </span>
            </div>

            <div className={styles.simpleEditMeta}>
              <div>
                <span>Тип</span>
                <strong>{getMaterialTypeLabel(material.type)}</strong>
              </div>

              <div>
                <span>Категория</span>
                <strong>{material.category?.title ?? "Без категории"}</strong>
              </div>
            </div>

            <div className={styles.simplePublishControls}>
              <label className={styles.simpleCheckbox}>
                <input
                  name="isPublished"
                  type="checkbox"
                  defaultChecked={material.isPublished}
                />
                <span>Опубликован</span>
              </label>

              <label className={styles.simpleCheckbox}>
                <input
                  name="isPremium"
                  type="checkbox"
                  defaultChecked={material.isPremium}
                />
                <span>Premium-доступ</span>
              </label>
            </div>

            <button className={styles.simpleSaveButton} type="submit">
              Сохранить
            </button>

            <Link
              href={`/admin/materials/${material.id}/preview`}
              className={styles.simplePreviewButton}
            >
              Открыть предпросмотр
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}