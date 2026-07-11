import Link from "next/link";
import { Prisma } from "@prisma/client";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import { deleteMaterialAction } from "./actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type AdminMaterialsPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
    categoryId?: string;
    status?: string;
    access?: string;
    error?: string;
    success?: string;
  }>;
};

const materialTypes = [
  { value: "ECG_ARTICLE", label: "ЭКГ статья" },
  { value: "VIDEO_LECTURE", label: "Видеолекция" },
  { value: "COURSE", label: "Курс" },
  { value: "HELPER", label: "Справочник" },
];

function getMessage(error?: string, success?: string) {
  if (error === "slug-exists") {
    return {
      type: "error",
      text: "Материал с таким slug уже существует. Укажи другой slug.",
    };
  }

  if (error === "required-fields") {
    return {
      type: "error",
      text: "Название, тип и категория обязательны.",
    };
  }

  if (error === "slug-required") {
    return {
      type: "error",
      text: "Slug не сформировался. Укажи slug вручную.",
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
      text: "Файл слишком большой. Максимум 5 МБ.",
    };
  }

  if (error === "id-required") {
    return {
      type: "error",
      text: "ID материала не найден.",
    };
  }

  if (success === "created") {
    return {
      type: "success",
      text: "Материал создан.",
    };
  }

  if (success === "updated") {
    return {
      type: "success",
      text: "Материал обновлён.",
    };
  }

  if (success === "deleted") {
    return {
      type: "success",
      text: "Материал удалён.",
    };
  }

  return null;
}

function getMaterialWhere(params: {
  q: string;
  type: string;
  categoryId: string;
  status: string;
  access: string;
}) {
  const where: Prisma.MaterialWhereInput = {};

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
      {
        content: {
          contains: params.q,
        },
      },
    ];
  }

  if (params.type && params.type !== "all") {
    where.type = params.type;
  }

  if (params.categoryId && params.categoryId !== "all") {
    where.categoryId = params.categoryId;
  }

  if (params.status === "published") {
    where.isPublished = true;
  }

  if (params.status === "draft") {
    where.isPublished = false;
  }

  if (params.access === "premium") {
    where.isPremium = true;
  }

  if (params.access === "free") {
    where.isPremium = false;
  }

  return where;
}

function getCurrentFiltersPath(params: {
  q: string;
  type: string;
  categoryId: string;
  status: string;
  access: string;
}) {
  const search = new URLSearchParams();

  if (params.q) {
    search.set("q", params.q);
  }

  if (params.type !== "all") {
    search.set("type", params.type);
  }

  if (params.categoryId !== "all") {
    search.set("categoryId", params.categoryId);
  }

  if (params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.access !== "all") {
    search.set("access", params.access);
  }

  const query = search.toString();

  return query ? `/admin/materials?${query}` : "/admin/materials";
}

export default async function AdminMaterialsPage({
  searchParams,
}: AdminMaterialsPageProps) {
  const params = await searchParams;

  const message = getMessage(params?.error, params?.success);

  const q = params?.q?.trim() ?? "";
  const type = params?.type ?? "all";
  const categoryId = params?.categoryId ?? "all";
  const status = params?.status ?? "all";
  const access = params?.access ?? "all";

  const where = getMaterialWhere({
    q,
    type,
    categoryId,
    status,
    access,
  });

  const [
    categories,
    materials,
    totalMaterials,
    publishedMaterials,
    draftMaterials,
    premiumMaterials,
  ] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        title: "asc",
      },
    }),
    prisma.material.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.material.count(),
    prisma.material.count({
      where: {
        isPublished: true,
      },
    }),
    prisma.material.count({
      where: {
        isPublished: false,
      },
    }),
    prisma.material.count({
      where: {
        isPremium: true,
      },
    }),
  ]);

  const hasActiveFilters =
    Boolean(q) ||
    type !== "all" ||
    categoryId !== "all" ||
    status !== "all" ||
    access !== "all";

  const currentPath = getCurrentFiltersPath({
    q,
    type,
    categoryId,
    status,
    access,
  });

  return (
    <div>
      <div className={styles.adminTopbar}>
        <div>
          <h2 className={styles.pageTitle}>Материалы</h2>
          <p className={styles.pageDescription}>
            Управление статьями, видеолекциями, курсами и справочными материалами.
          </p>
        </div>

        <Link href="/admin/materials/new" className={styles.primaryAdminAction}>
          + Создать материал
        </Link>
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

      <section className={styles.adminStatsCompact}>
        <div>
          <span>Всего</span>
          <strong>{totalMaterials}</strong>
        </div>

        <div>
          <span>Опубликовано</span>
          <strong>{publishedMaterials}</strong>
        </div>

        <div>
          <span>Черновики</span>
          <strong>{draftMaterials}</strong>
        </div>

        <div>
          <span>Premium</span>
          <strong>{premiumMaterials}</strong>
        </div>
      </section>

      <section className={styles.adminHelpCard}>
        <strong>Как работать с материалами</strong>
        <p>
          Нажми «Создать материал», заполни название, категорию, текст и картинку.
          Сначала можно сохранить как черновик, открыть предпросмотр, а затем опубликовать.
        </p>
      </section>

      <section className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <div>
            <h3 className={styles.filterTitle}>Поиск и фильтры</h3>
            <p className={styles.filterDescription}>
              Сейчас показано: {materials.length} из {totalMaterials}
            </p>
          </div>

          {hasActiveFilters && (
            <Link href="/admin/materials" className={styles.resetLink}>
              Сбросить фильтры
            </Link>
          )}
        </div>

        <form action="/admin/materials" method="get" className={styles.filtersForm}>
          <label className={styles.field}>
            <span>Поиск</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Название, slug, описание, текст"
            />
          </label>

          <label className={styles.field}>
            <span>Тип</span>
            <select name="type" defaultValue={type}>
              <option value="all">Все типы</option>
              {materialTypes.map((materialType) => (
                <option key={materialType.value} value={materialType.value}>
                  {materialType.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Категория</span>
            <select name="categoryId" defaultValue={categoryId}>
              <option value="all">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Статус</span>
            <select name="status" defaultValue={status}>
              <option value="all">Все статусы</option>
              <option value="published">Опубликовано</option>
              <option value="draft">Черновик</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Доступ</span>
            <select name="access" defaultValue={access}>
              <option value="all">Весь доступ</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.submitButton} type="submit">
              Применить
            </button>
          </div>
        </form>
      </section>

      <section className={styles.adminContentCard}>
        <div className={styles.adminSectionHeader}>
          <div>
            <h3>Список материалов</h3>
            <p>Открой предпросмотр, отредактируй или удали материал.</p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Тип</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Доступ</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => {
                  const publicHref = getMaterialPublicHref(material);

                  return (
                    <tr key={material.id}>
                      <td>
                        <div className={styles.materialTitle}>{material.title}</div>
                        <div className={styles.materialSlug}>{material.slug}</div>
                      </td>

                      <td>{material.type}</td>
                      <td>{material.category?.title ?? "Без категории"}</td>

                      <td>
                        <span
                          className={
                            material.isPublished
                              ? styles.statusBadgeSuccess
                              : styles.statusBadgeWarning
                          }
                        >
                          {material.isPublished ? "Опубликовано" : "Черновик"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            material.isPremium
                              ? styles.statusBadgePremium
                              : styles.statusBadgeNeutral
                          }
                        >
                          {material.isPremium ? "Premium" : "Free"}
                        </span>
                      </td>

                      <td>
                        <div className={styles.tableActions}>
                          <Link
                            href={`/admin/materials/${material.id}/preview`}
                            className={styles.previewLink}
                          >
                            Предпросмотр
                          </Link>

                          {publicHref && material.isPublished && (
                            <Link
                              href={publicHref}
                              className={styles.openLink}
                              target="_blank"
                            >
                              На сайте
                            </Link>
                          )}

                          <Link
                            href={`/admin/materials/${material.id}/edit`}
                            className={styles.editLink}
                          >
                            Редактировать
                          </Link>

                          <form action={deleteMaterialAction}>
                            <input type="hidden" name="id" value={material.id} />
                            <input type="hidden" name="redirectPath" value={currentPath} />
                            <button className={styles.deleteButton} type="submit">
                              Удалить
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    Материалы не найдены. Попробуй сбросить фильтры или создать новый материал.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}