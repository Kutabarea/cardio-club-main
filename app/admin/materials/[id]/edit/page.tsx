/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

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
      <div className={styles.adminTopbar}>
        <div>
          <Link href="/admin/materials" className={styles.backLink}>
            ← К списку материалов
          </Link>

          <h1 className={styles.pageTitle}>Редактирование материала</h1>

          <p className={styles.pageDescription}>
            Обнови текст, статус публикации, premium-доступ, изображение и связь с категорией.
          </p>
        </div>

        <div className={styles.editorHeaderActions}>
          <Link
            href={`/admin/materials/${material.id}/preview`}
            className={styles.secondaryAdminAction}
          >
            Предпросмотр
          </Link>

          {material.isPublished && publicHref ? (
            <Link
              href={publicHref}
              className={styles.primaryAdminAction}
              target="_blank"
            >
              Открыть на сайте
            </Link>
          ) : (
            <span className={styles.disabledAdminAction}>
              Не опубликовано
            </span>
          )}
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

      <div className={styles.editorLayout}>
        <aside className={styles.editorGuide}>
          <div className={styles.editorGuideCard}>
            <p className={styles.editorGuideEyebrow}>Статус</p>

            <h2 className={styles.editorGuideTitle}>
              {material.isPublished ? "Материал опубликован" : "Материал в черновике"}
            </h2>

            <p className={styles.editorGuideText}>
              {material.isPublished
                ? "Материал виден пользователям на публичной части сайта."
                : "Черновик виден только в админке и preview-режиме."}
            </p>

            <div className={styles.editorMetaList}>
              <div>
                <span>Тип</span>
                <strong>{getMaterialTypeLabel(material.type)}</strong>
              </div>

              <div>
                <span>Доступ</span>
                <strong>{material.isPremium ? "Premium" : "Free"}</strong>
              </div>

              <div>
                <span>Категория</span>
                <strong>{material.category?.title ?? "Без категории"}</strong>
              </div>

              <div>
                <span>Slug</span>
                <strong>{material.slug}</strong>
              </div>
            </div>
          </div>

          <div className={styles.editorGuideCard}>
            <p className={styles.editorGuideEyebrow}>Как заполнять</p>

            <h2 className={styles.editorGuideTitle}>Минимальный стандарт статьи</h2>

            <ul className={styles.editorGuideList}>
              <li>Название — короткое и понятное.</li>
              <li>Описание — 1–2 предложения для карточки.</li>
              <li>Контент — через Markdown: заголовки, списки, цитаты.</li>
              <li>Premium включай только для закрытых материалов.</li>
              <li>Публикуй только после проверки через предпросмотр.</li>
            </ul>
          </div>

          <div className={styles.editorGuideCard}>
            <p className={styles.editorGuideEyebrow}>Безопасность</p>

            <h2 className={styles.editorGuideTitle}>Не вставляй опасный HTML</h2>

            <p className={styles.editorGuideText}>
              Пока используем Markdown. Не нужно вставлять скрипты, iframe и чужой HTML-код.
              Позже добавим дополнительную очистку и ограничения.
            </p>
          </div>
        </aside>

        <form action={updateMaterialAction} className={styles.editorForm}>
          <input type="hidden" name="id" value={material.id} />
          <input type="hidden" name="redirectPath" value={currentPath} />

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <div>
                <p className={styles.editorStep}>Шаг 1</p>
                <h2>Основная информация</h2>
              </div>

              <p>
                Эти данные используются в карточках, поиске, списках и публичных страницах.
              </p>
            </div>

            <div className={styles.formGrid}>
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
            </div>

            <label className={styles.formGroup}>
              <span className={styles.label}>Описание</span>
              <textarea
                className={styles.textareaSmall}
                name="description"
                defaultValue={material.description ?? ""}
                placeholder="Короткое описание для карточки материала."
              />
            </label>
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <div>
                <p className={styles.editorStep}>Шаг 2</p>
                <h2>Тип, категория и доступ</h2>
              </div>

              <p>
                От этих настроек зависит, где материал появится на сайте и кому он будет доступен.
              </p>
            </div>

            <div className={styles.formGrid}>
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

            <div className={styles.publishBox}>
              <label className={styles.checkboxLabel}>
                <input
                  name="isPremium"
                  type="checkbox"
                  defaultChecked={material.isPremium}
                />
                <span>
                  Premium-материал
                  <small>Будет закрыт для пользователей без активной premium-подписки.</small>
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  name="isPublished"
                  type="checkbox"
                  defaultChecked={material.isPublished}
                />
                <span>
                  Опубликован
                  <small>Материал появится на публичной части сайта.</small>
                </span>
              </label>
            </div>
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <div>
                <p className={styles.editorStep}>Шаг 3</p>
                <h2>Изображение и видео</h2>
              </div>

              <p>
                Картинка нужна для карточек. Видео-ссылка используется только для видеолекций.
              </p>
            </div>

            {material.imageUrl ? (
              <div className={styles.currentImageBox}>
                <div>
                  <span>Текущее изображение</span>
                  <strong>{material.imageUrl}</strong>
                </div>

                <img
                  src={material.imageUrl}
                  alt=""
                  className={styles.previewThumb}
                />
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
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <div>
                <p className={styles.editorStep}>Шаг 4</p>
                <h2>Содержание материала</h2>
              </div>

              <p>
                Сейчас используется Markdown. Следующим шагом добавим нормальные кнопки редактора.
              </p>
            </div>

            <label className={styles.formGroup}>
              <span className={styles.label}>Текст материала</span>
              <textarea
                className={styles.markdownTextarea}
                name="content"
                defaultValue={material.content ?? ""}
                placeholder={"## Заголовок\n\nТекст материала...\n\n- пункт списка\n- пункт списка\n\n> важная заметка"}
              />
            </label>

            <div className={styles.markdownHelp}>
              <span>Markdown-подсказка:</span>
              <code>## Заголовок</code>
              <code>**жирный текст**</code>
              <code>- список</code>
              <code>{"> цитата"}</code>
            </div>
          </section>

          <div className={styles.editorFooter}>
            <Link href="/admin/materials" className={styles.modalCancelButton}>
              Отмена
            </Link>

            <button className={styles.primaryAdminAction} type="submit">
              Сохранить материал
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}