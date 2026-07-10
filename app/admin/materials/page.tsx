import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { createMaterialAction, deleteMaterialAction } from "./actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

const materialTypes = [
  { value: "ECG_ARTICLE", label: "ЭКГ статья" },
  { value: "VIDEO_LECTURE", label: "Видеолекция" },
  { value: "COURSE", label: "Курс" },
  { value: "HELPER", label: "Справочник" },
];

export default async function AdminMaterialsPage() {
  const [categories, materials] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        title: "asc",
      },
    }),
    prisma.material.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Материалы</h2>
        <p className={styles.pageDescription}>
          Здесь можно добавлять статьи, видеолекции, курсы и справочные материалы.
        </p>
      </div>

      <form action={createMaterialAction} className={styles.form}>
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
              {materialTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
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

        <label className={styles.field}>
          <span>Краткое описание</span>
          <textarea
            name="description"
            rows={3}
            placeholder="Описание для карточки материала"
          />
        </label>

        <label className={styles.field}>
          <span>Контент</span>
          <textarea
            name="content"
            rows={7}
            placeholder="Основной текст материала"
          />
        </label>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Картинка</span>
            <input name="imageUrl" placeholder="/images/materials__img__1.png" />
          </label>

          <label className={styles.field}>
            <span>Видео</span>
            <input name="videoUrl" placeholder="https://..." />
          </label>
        </div>

        <div className={styles.checks}>
          <label>
            <input name="isPremium" type="checkbox" />
            Premium
          </label>

          <label>
            <input name="isPublished" type="checkbox" defaultChecked />
            Опубликовано
          </label>
        </div>

        <button className={styles.submitButton} type="submit">
          Добавить материал
        </button>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Категория</th>
              <th>Статус</th>
              <th>Доступ</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {materials.map((material) => (
              <tr key={material.id}>
                <td>
                  <div className={styles.materialTitle}>{material.title}</div>
                  <div className={styles.materialSlug}>{material.slug}</div>
                </td>
                <td>{material.type}</td>
                <td>{material.category?.title ?? "Без категории"}</td>
                <td>{material.isPublished ? "Опубликовано" : "Черновик"}</td>
                <td>{material.isPremium ? "Premium" : "Free"}</td>
                <td>
                  <div className={styles.tableActions}>
                    <Link
                      href={`/admin/materials/${material.id}/edit`}
                      className={styles.editLink}
                    >
                      Редактировать
                    </Link>

                    <form action={deleteMaterialAction}>
                      <input type="hidden" name="id" value={material.id} />
                      <button className={styles.deleteButton} type="submit">
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}