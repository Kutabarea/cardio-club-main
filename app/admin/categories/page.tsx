import Link from "next/link";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import DeleteCategoryButton from "./DeleteCategoryButton";
import { createCategoryAction } from "./actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type AdminCategoriesPageProps = {
  searchParams?: Promise<{
    q?: string;
    materials?: string;
    error?: string;
    success?: string;
    deletedMaterials?: string;
  }>;
};

function getMessage(error?: string, success?: string, deletedMaterials?: string) {
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

  if (error === "not-found") {
    return {
      type: "error",
      text: "Категория не найдена.",
    };
  }

  if (error === "delete-not-confirmed") {
    return {
      type: "error",
      text: "Удаление категории не подтверждено.",
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
    const count = Number(deletedMaterials ?? 0);

    return {
      type: "success",
      text:
        count > 0
          ? `Категория удалена. Вместе с ней удалено материалов: ${count}.`
          : "Категория удалена.",
    };
  }

  return null;
}

function getCategoryWhere(params: {
  q: string;
}) {
  const where: Prisma.CategoryWhereInput = {};

  if (params.q) {
    where.OR = [
      {
        title: {
          contains: params.q,
        },
      },
      {
        slug: {
          contains: params.q,
        },
      },
      {
        description: {
          contains: params.q,
        },
      },
    ];
  }

  return where;
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const params = await searchParams;

  const q = params?.q?.trim() ?? "";
  const materialsFilter = params?.materials ?? "all";
  const message = getMessage(
    params?.error,
    params?.success,
    params?.deletedMaterials,
  );

  const categoriesRaw = await prisma.category.findMany({
    where: getCategoryWhere({
      q,
    }),
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

  const categories = categoriesRaw.filter((category) => {
    if (materialsFilter === "with-materials") {
      return category._count.materials > 0;
    }

    if (materialsFilter === "empty") {
      return category._count.materials === 0;
    }

    return true;
  });

  const totalCategories = await prisma.category.count();

  const hasActiveFilters = Boolean(q) || materialsFilter !== "all";

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Категории</h2>
        <p className={styles.pageDescription}>
          Здесь можно создавать, искать, фильтровать, редактировать и удалять категории вместе с материалами.
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

      <section className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <div>
            <h3 className={styles.filterTitle}>Фильтры</h3>
            <p className={styles.filterDescription}>
              Показано: {categories.length} из {totalCategories}
            </p>
          </div>

          {hasActiveFilters && (
            <Link href="/admin/categories" className={styles.resetLink}>
              Сбросить фильтры
            </Link>
          )}
        </div>

        <form action="/admin/categories" method="get" className={styles.categoryFiltersForm}>
          <label className={styles.field}>
            <span>Поиск</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Название, slug или описание"
            />
          </label>

          <label className={styles.field}>
            <span>Материалы</span>
            <select name="materials" defaultValue={materialsFilter}>
              <option value="all">Все категории</option>
              <option value="with-materials">С материалами</option>
              <option value="empty">Пустые</option>
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.submitButton} type="submit">
              Применить
            </button>
          </div>
        </form>
      </section>

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
            {categories.length > 0 ? (
              categories.map((category) => (
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

                      <DeleteCategoryButton
                        categoryId={category.id}
                        categoryTitle={category.title}
                        materialsCount={category._count.materials}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Категории не найдены.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}