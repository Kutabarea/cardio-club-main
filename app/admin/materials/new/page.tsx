import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import EcgSectionFields from "../EcgSectionFields";
import MaterialContentEditor from "../MaterialContentEditor";
import { createMaterialAction } from "../actions";

export const dynamic = "force-dynamic";

type NewMaterialPageProps = {
  searchParams: Promise<{
    error?: string;
    categorySlug?: string;
    ecgSectionId?: string;
    type?: string;
    sortOrder?: string;
    returnTo?: string;
  }>;
};

function getMessage(error?: string) {
  if (error === "required-fields") return "Заполни название, тип и категорию материала.";
  if (error === "slug-required") return "Не удалось создать slug. Укажи slug вручную.";
  if (error === "slug-exists") return "Материал с таким slug уже существует.";
  if (error === "invalid-image") return "Можно загружать только JPG, PNG, WEBP или GIF.";
  if (error === "image-too-large") return "Картинка слишком большая. Максимум — 5 МБ.";
  if (error === "invalid-url") return "Проверь ссылку на изображение или видео. Разрешены только безопасные URL.";
  if (error === "content-too-large") return "Текст материала слишком большой. Раздели его на несколько частей.";

  return null;
}

function parseSortOrder(value?: string) {
  const sortOrder = Number.parseInt(value ?? "100", 10);

  return Number.isFinite(sortOrder) ? sortOrder : 100;
}

export default async function NewMaterialPage({
  searchParams,
}: NewMaterialPageProps) {
  const { error, categorySlug, ecgSectionId, type, sortOrder, returnTo } = await searchParams;

  const [categories, ecgSections, preselectedCategory] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        title: "asc",
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
    }),
    categorySlug
      ? prisma.category.findUnique({
          where: {
            slug: categorySlug,
          },
          select: {
            id: true,
          },
        })
      : null,
  ]);

  const message = getMessage(error);
  const defaultCategoryId = preselectedCategory?.id ?? "";
  const defaultType = type || "ECG_ARTICLE";
  const defaultSortOrder = parseSortOrder(sortOrder);
  const safeReturnTo = returnTo?.startsWith("/admin") ? returnTo : "/admin/materials";

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link href="/admin/materials" className={styles.backLink}>
            ← Материалы
          </Link>

          <h1 className={styles.pageTitle}>Новый материал</h1>

          <p className={styles.pageDescription}>
            Создание статьи, видеолекции или полезного ресурса.
          </p>
        </div>
      </div>

      {message ? (
        <div className={styles.adminNoticeError}>
          {message}
        </div>
      ) : null}

      <form action={createMaterialAction} className={styles.simpleEditLayout}>
        <input type="hidden" name="redirectPath" value="/admin/materials/new" />
        <input type="hidden" name="afterCreatePath" value={safeReturnTo} />

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
                placeholder="Например: Зубец T"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>Короткое описание</span>
              <textarea
                className={styles.textareaSmall}
                name="description"
                placeholder="1–2 предложения для карточки материала."
              />
            </label>

            <MaterialContentEditor defaultValue="" />
          </section>

          <details className={styles.simpleEditDetails} open>
            <summary>Служебные настройки</summary>

            <div className={styles.simpleEditDetailsBody}>
              <div className={styles.formGrid}>
                <label className={styles.formGroup}>
                  <span className={styles.label}>Slug</span>
                  <input
                    className={styles.input}
                    name="slug"
                    placeholder="zubec-t"
                  />
                  <span className={styles.formHint}>
                    Если оставить пустым, slug создастся из названия.
                  </span>
                </label>

                <label className={styles.formGroup}>
                  <span className={styles.label}>Тип материала</span>
                  <select
                    className={styles.input}
                    name="type"
                    defaultValue={defaultType}
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
                  defaultValue={defaultCategoryId}
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

          <EcgSectionFields
            sections={ecgSections}
            currentSectionId={ecgSectionId ?? ""}
            currentSortOrder={defaultSortOrder}
          />

          <details className={styles.simpleEditDetails}>
            <summary>Изображение и видео</summary>

            <div className={styles.simpleEditDetailsBody}>
              <label className={styles.formGroup}>
                <span className={styles.label}>Загрузить картинку</span>
                <input
                  className={styles.input}
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>URL изображения</span>
                <input
                  className={styles.input}
                  name="imageUrl"
                  placeholder="/images/materials__img__1.png"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>Видео URL</span>
                <input
                  className={styles.input}
                  name="videoUrl"
                  placeholder="https://example.com/video"
                />
              </label>
            </div>
          </details>
        </main>

        <aside className={styles.simpleEditSide}>
          <section className={styles.simpleEditCard}>
            <div className={styles.simplePublishControls}>
              <label className={styles.simpleCheckbox}>
                <input name="isPublished" type="checkbox" />
                <span>Опубликован</span>
              </label>

              <label className={styles.simpleCheckbox}>
                <input name="isPremium" type="checkbox" />
                <span>Premium-доступ</span>
              </label>
            </div>

            <button className={styles.simpleSaveButton} type="submit">
              Создать материал
            </button>

            <Link href="/admin/materials" className={styles.simplePreviewButton}>
              Отмена
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}