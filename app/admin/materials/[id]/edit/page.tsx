import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { updateMaterialAction } from "../../actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type EditMaterialPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const materialTypes = [
  { value: "ECG_ARTICLE", label: "ЭКГ статья" },
  { value: "VIDEO_LECTURE", label: "Видеолекция" },
  { value: "COURSE", label: "Курс" },
  { value: "HELPER", label: "Справочник" },
];

export default async function EditMaterialPage({
  params,
}: EditMaterialPageProps) {
  const { id } = await params;

  const [material, categories] = await Promise.all([
    prisma.material.findUnique({
      where: {
        id,
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

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link href="/admin/materials" className={styles.backLink}>
          ← Назад к материалам
        </Link>

        <h2 className={styles.pageTitle}>Редактировать материал</h2>
        <p className={styles.pageDescription}>{material.title}</p>
      </div>

      <form action={updateMaterialAction} className={styles.form}>
        <input type="hidden" name="id" value={material.id} />

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Название</span>
            <input
              name="title"
              required
              defaultValue={material.title}
              placeholder="Например: Комплекс QRS"
            />
          </label>

          <label className={styles.field}>
            <span>Slug</span>
            <input
              name="slug"
              defaultValue={material.slug}
              placeholder="complex-qrs"
            />
          </label>

          <label className={styles.field}>
            <span>Тип</span>
            <select name="type" required defaultValue={material.type}>
              {materialTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Категория</span>
            <select name="categoryId" required defaultValue={material.categoryId ?? ""}>
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
            defaultValue={material.description ?? ""}
            placeholder="Описание для карточки материала"
          />
        </label>

        <label className={styles.field}>
          <span>Контент</span>
          <textarea
            name="content"
            rows={12}
            defaultValue={material.content ?? ""}
            placeholder="Основной текст материала"
          />
        </label>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Картинка</span>
            <input
              name="imageUrl"
              defaultValue={material.imageUrl ?? ""}
              placeholder="/images/materials__img__1.png"
            />
          </label>

          <label className={styles.field}>
            <span>Видео</span>
            <input
              name="videoUrl"
              defaultValue={material.videoUrl ?? ""}
              placeholder="https://..."
            />
          </label>
        </div>

        <div className={styles.checks}>
          <label>
            <input
              name="isPremium"
              type="checkbox"
              defaultChecked={material.isPremium}
            />
            Premium
          </label>

          <label>
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={material.isPublished}
            />
            Опубликовано
          </label>
        </div>

        <button className={styles.submitButton} type="submit">
          Сохранить изменения
        </button>
      </form>
    </div>
  );
}