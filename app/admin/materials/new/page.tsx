import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { createMaterialAction } from "../actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type NewMaterialPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const materialTypes = [
  { value: "ECG_ARTICLE", label: "ЭКГ статья" },
  { value: "VIDEO_LECTURE", label: "Видеолекция" },
  { value: "COURSE", label: "Курс" },
  { value: "HELPER", label: "Справочник" },
];

function getMessage(error?: string) {
  if (error === "slug-exists") {
    return "Материал с таким slug уже существует. Укажи другой slug.";
  }

  if (error === "required-fields") {
    return "Название, тип и категория обязательны.";
  }

  if (error === "slug-required") {
    return "Slug не сформировался. Укажи slug вручную.";
  }

  if (error === "invalid-image") {
    return "Можно загружать только изображения.";
  }

  if (error === "image-too-large") {
    return "Файл слишком большой. Максимум 5 МБ.";
  }

  return null;
}

export default async function NewMaterialPage({
  searchParams,
}: NewMaterialPageProps) {
  const params = await searchParams;
  const message = getMessage(params?.error);

  const categories = await prisma.category.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return (
    <div>
      <div className={styles.adminTopbar}>
        <div>
          <Link href="/admin/materials" className={styles.backLink}>
            ← Назад к материалам
          </Link>

          <h2 className={styles.pageTitle}>Создать материал</h2>
          <p className={styles.pageDescription}>
            Отдельная страница для редактора: сначала основная информация, потом текст, медиа и публикация.
          </p>
        </div>
      </div>

      {message && <div className={styles.adminMessageError}>{message}</div>}

      <div className={styles.editorLayout}>
        <aside className={styles.editorGuide}>
          <h3>Порядок заполнения</h3>

          <ol>
            <li>
              <strong>Основное</strong>
              <span>Название, тип и категория.</span>
            </li>

            <li>
              <strong>Описание</strong>
              <span>Короткий текст для карточки материала.</span>
            </li>

            <li>
              <strong>Контент</strong>
              <span>Основная статья. Можно использовать Markdown.</span>
            </li>

            <li>
              <strong>Медиа</strong>
              <span>Картинка или ссылка на видео.</span>
            </li>

            <li>
              <strong>Публикация</strong>
              <span>Черновик, Premium или открытый материал.</span>
            </li>
          </ol>
        </aside>

        <form action={createMaterialAction} className={styles.editorForm}>
          <input type="hidden" name="redirectPath" value="/admin/materials/new" />

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <span>Шаг 1</span>
              <div>
                <h3>Основная информация</h3>
                <p>Эти поля определяют, где материал будет отображаться на сайте.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Название</span>
                <input name="title" required placeholder="Например: Комплекс QRS" />
              </label>

              <label className={styles.field}>
                <span>Slug</span>
                <input name="slug" placeholder="complex-qrs" />
              </label>

              <label className={styles.field}>
                <span>Тип</span>
                <select name="type" required defaultValue="ECG_ARTICLE">
                  {materialTypes.map((materialType) => (
                    <option key={materialType.value} value={materialType.value}>
                      {materialType.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Категория</span>
                <select name="categoryId" required defaultValue="">
                  <option value="" disabled>
                    Выбери категорию
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <span>Шаг 2</span>
              <div>
                <h3>Описание</h3>
                <p>Короткое описание видно в карточках, поиске и списках.</p>
              </div>
            </div>

            <label className={styles.field}>
              <span>Краткое описание</span>
              <textarea
                name="description"
                rows={4}
                placeholder="Напиши 1–2 предложения, чтобы было понятно, о чём материал."
              />
            </label>
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <span>Шаг 3</span>
              <div>
                <h3>Контент</h3>
                <p>
                  Основной текст статьи. Поддерживается Markdown: заголовки, списки, жирный текст и ссылки.
                </p>
              </div>
            </div>

            <label className={styles.field}>
              <span>Текст материала</span>
              <textarea
                name="content"
                rows={16}
                placeholder={"## Основные признаки\n\n- Первый пункт\n- Второй пункт\n\n**Важно:** текст можно выделять жирным."}
              />
            </label>
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <span>Шаг 4</span>
              <div>
                <h3>Медиа</h3>
                <p>Можно загрузить картинку с компьютера или указать ссылку.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Картинка по ссылке</span>
                <input name="imageUrl" placeholder="/images/materials__img__1.png" />
              </label>

              <label className={styles.field}>
                <span>Загрузить картинку</span>
                <input name="imageFile" type="file" accept="image/*" />
              </label>

              <label className={styles.field}>
                <span>Видео</span>
                <input name="videoUrl" placeholder="https://..." />
              </label>
            </div>
          </section>

          <section className={styles.editorSection}>
            <div className={styles.editorSectionHeader}>
              <span>Шаг 5</span>
              <div>
                <h3>Доступ и публикация</h3>
                <p>Для проверки лучше сначала оставить черновик, потом открыть предпросмотр и опубликовать.</p>
              </div>
            </div>

            <div className={styles.publishBox}>
              <label>
                <input name="isPremium" type="checkbox" />
                <span>Premium материал</span>
              </label>

              <label>
                <input name="isPublished" type="checkbox" />
                <span>Опубликовать сразу</span>
              </label>
            </div>
          </section>

          <div className={styles.editorFooter}>
            <Link href="/admin/materials" className={styles.modalCancelButton}>
              Отмена
            </Link>

            <button className={styles.submitButton} type="submit">
              Создать материал
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}