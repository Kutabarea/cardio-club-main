import Link from "next/link";

import { prisma } from "@/lib/prisma";

import { createCategoryAction, deleteCategoryAction } from "./actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type AdminCategoriesPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (error === "slug-exists") {
    return {
      type: "error",
      text: "Категория с таким slug уже существует. Укажи другой slug.",
    };
  }

  if (error === "title-required") {
    return {
      type: "error",
      text: "Название категории обязательно.",
    };
  }

  if (error === "id-required") {
    return {
      type: "error",
      text: "ID категории не найден.",
    };
  }

  if (success === "created") {
    return {
      type: "success",
      text: "Категория создана.",
    };
  }

  if (success === "updated") {
    return {
      type: "success",
      text: "Категория обновлена.",
    };
  }

  if (success === "deleted") {
    return {
      type: "success",
      text: "Категория удалена.",
    };
  }

  return null;
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const params = await searchParams;
  const message = getMessage(params?.error, params?.success);

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          materials: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Категории</h2>
        <p className={styles.pageDescription}>
          Здесь можно создавать и редактировать разделы для материалов, статей, лекций и курсов.
        </p>
      </div>

      {message && (
        <div
          className={
            message.type === "error"
              ? styles.adminMessageError
              : styles.adminMessageSuccess
          }
        >
          {message.text}
        </div>
      )}

      <form action={createCategoryAction} className={styles.form}>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Название</span>
            <input name="title" required placeholder="Например: ЭКГ тренажёр" />
          </label>

          <label className={styles.field}>
            <span>Slug</span>
            <input name="slug" placeholder="ecg-trainer" />
          </label>
        </div>

        <label className={styles.field}>
          <span>Описание</span>
          <textarea
            name="description"
            rows={4}
            placeholder="Краткое описание категории"
          />
        </label>

        <button className={styles.submitButton} type="submit">
          Добавить категорию
        </button>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Материалов</th>
              <th>Описание</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className={styles.materialTitle}>{category.title}</div>
                </td>
                <td>
                  <div className={styles.materialSlug}>{category.slug}</div>
                </td>
                <td>{category._count.materials}</td>
                <td>{category.description ?? "—"}</td>
                <td>
                  <div className={styles.tableActions}>
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className={styles.editLink}
                    >
                      Редактировать
                    </Link>

                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="id" value={category.id} />
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