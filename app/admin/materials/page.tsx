/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import DeleteMaterialButton from "./DeleteMaterialButton";

export const dynamic = "force-dynamic";

type MaterialsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    access?: string | string[];
    type?: string | string[];
    categoryId?: string | string[];
    error?: string | string[];
    success?: string | string[];
  }>;
};

function getSingleParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getMessage(error?: string, success?: string) {
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

  if (error === "id-required") {
    return {
      type: "error",
      text: "ID материала не найден.",
    };
  }

  if (error === "not-found") {
    return {
      type: "error",
      text: "Материал не найден. Возможно, он уже удалён.",
    };
  }

  if (error === "delete-not-confirmed") {
    return {
      type: "error",
      text: "Удаление материала не подтверждено.",
    };
  }

  return null;
}

function getMaterialTypeLabel(type: string) {
  if (type === "ECG_ARTICLE") return "Статья";
  if (type === "VIDEO_LECTURE") return "Видеолекция";
  if (type === "HELPER") return "Ресурс";

  return type;
}

function createCurrentPath(params: {
  q: string;
  status: string;
  access: string;
  type: string;
  categoryId: string;
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.access && params.access !== "all") query.set("access", params.access);
  if (params.type && params.type !== "all") query.set("type", params.type);
  if (params.categoryId && params.categoryId !== "all") {
    query.set("categoryId", params.categoryId);
  }

  const queryString = query.toString();

  return queryString ? `/admin/materials?${queryString}` : "/admin/materials";
}

export default async function AdminMaterialsPage({
  searchParams,
}: MaterialsPageProps) {
  const resolvedSearchParams = await searchParams;

  const q = getSingleParam(resolvedSearchParams.q).trim();
  const status = getSingleParam(resolvedSearchParams.status) || "all";
  const access = getSingleParam(resolvedSearchParams.access) || "all";
  const type = getSingleParam(resolvedSearchParams.type) || "all";
  const categoryId = getSingleParam(resolvedSearchParams.categoryId) || "all";
  const error = getSingleParam(resolvedSearchParams.error);
  const success = getSingleParam(resolvedSearchParams.success);

  const whereParts: Prisma.MaterialWhereInput[] = [];

  if (q) {
    whereParts.push({
      OR: [
        {
          title: {
            contains: q,
          },
        },
        {
          slug: {
            contains: q,
          },
        },
        {
          description: {
            contains: q,
          },
        },
        {
          content: {
            contains: q,
          },
        },
        {
          category: {
            is: {
              title: {
                contains: q,
              },
            },
          },
        },
      ],
    });
  }

  if (status === "published") {
    whereParts.push({
      isPublished: true,
    });
  }

  if (status === "draft") {
    whereParts.push({
      isPublished: false,
    });
  }

  if (access === "premium") {
    whereParts.push({
      isPremium: true,
    });
  }

  if (access === "free") {
    whereParts.push({
      isPremium: false,
    });
  }

  if (type !== "all") {
    whereParts.push({
      type,
    });
  }

  if (categoryId !== "all") {
    whereParts.push({
      categoryId,
    });
  }

  const where: Prisma.MaterialWhereInput =
    whereParts.length > 0
      ? {
          AND: whereParts,
        }
      : {};

  const [
    materials,
    categories,
    totalMaterials,
    publishedMaterials,
    draftMaterials,
    premiumMaterials,
    videoLectures,
    filteredMaterials,
  ] = await Promise.all([
    prisma.material.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
    prisma.category.findMany({
      orderBy: {
        title: "asc",
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
    prisma.material.count({
      where: {
        type: "VIDEO_LECTURE",
      },
    }),
    prisma.material.count({
      where,
    }),
  ]);

  const message = getMessage(error, success);
  const currentPath = createCurrentPath({
    q,
    status,
    access,
    type,
    categoryId,
  });

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>Материалы</h1>

          <p className={styles.pageDescription}>
            Управление статьями, видеолекциями, черновиками, premium-доступом и публикацией.
          </p>
        </div>

        <Link href="/admin/materials/new" className={styles.primaryAdminAction}>
          Добавить материал
        </Link>
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

      <section className={styles.materialsStatsGrid}>
        <div className={styles.materialsStatCard}>
          <span>Всего</span>
          <strong>{totalMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Опубликовано</span>
          <strong>{publishedMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Черновики</span>
          <strong>{draftMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Premium</span>
          <strong>{premiumMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Видеолекции</span>
          <strong>{videoLectures}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Найдено</span>
          <strong>{filteredMaterials}</strong>
        </div>
      </section>

      <section className={styles.materialsControlPanel}>
        <div>
          <h2>Фильтры и поиск</h2>
          <p>
            Быстро найди материал по названию, slug, тексту, категории, статусу или типу.
          </p>
        </div>

        <form className={styles.materialsFiltersForm} action="/admin/materials">
          <label className={styles.materialsSearchField}>
            <span>Поиск</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Название, slug, текст или категория"
            />
          </label>

          <label className={styles.materialsFilterField}>
            <span>Статус</span>
            <select name="status" defaultValue={status}>
              <option value="all">Все статусы</option>
              <option value="published">Опубликованные</option>
              <option value="draft">Черновики</option>
            </select>
          </label>

          <label className={styles.materialsFilterField}>
            <span>Доступ</span>
            <select name="access" defaultValue={access}>
              <option value="all">Любой доступ</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          <label className={styles.materialsFilterField}>
            <span>Тип</span>
            <select name="type" defaultValue={type}>
              <option value="all">Все типы</option>
              <option value="ECG_ARTICLE">Статьи</option>
              <option value="VIDEO_LECTURE">Видеолекции</option>
              <option value="HELPER">Ресурсы</option>
            </select>
          </label>

          <label className={styles.materialsFilterField}>
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

          <div className={styles.materialsFilterActions}>
            <button type="submit">Применить</button>
            <Link href="/admin/materials">Сбросить</Link>
          </div>
        </form>
      </section>

      {materials.length > 0 ? (
        <section className={styles.materialsCardsGrid}>
          {materials.map((material) => {
            const publicHref = getMaterialPublicHref(material);

            return (
              <article key={material.id} className={styles.materialCard}>
                <div className={styles.materialCardImage}>
                  {material.imageUrl ? (
                    <img src={material.imageUrl} alt="" />
                  ) : (
                    <div className={styles.materialCardImagePlaceholder}>
                      {material.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className={styles.materialCardBody}>
                  <div className={styles.materialCardBadges}>
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

                    <span className={styles.materialBadgeType}>
                      {getMaterialTypeLabel(material.type)}
                    </span>
                  </div>

                  <h2 className={styles.materialCardTitle}>
                    {material.title}
                  </h2>

                  <p className={styles.materialCardDescription}>
                    {material.description || "Описание пока не заполнено."}
                  </p>

                  <div className={styles.materialCardMeta}>
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

                <div className={styles.materialCardActions}>
                  <Link
                    href={`/admin/materials/${material.id}/edit`}
                    className={styles.materialActionPrimary}
                  >
                    Редактировать
                  </Link>

                  <Link
                    href={`/admin/materials/${material.id}/preview`}
                    className={styles.materialActionSecondary}
                  >
                    Предпросмотр
                  </Link>

                  {material.isPublished && publicHref ? (
                    <Link
                      href={publicHref}
                      className={styles.materialActionSecondary}
                      target="_blank"
                      rel="noreferrer"
                    >
                      На сайте
                    </Link>
                  ) : (
                    <span className={styles.materialActionDisabled}>
                      Не опубликован
                    </span>
                  )}

                  <DeleteMaterialButton
                    materialId={material.id}
                    materialTitle={material.title}
                    redirectPath={currentPath}
                  />
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className={styles.materialsEmptyState}>
          <h2>Материалы не найдены</h2>

          <p>
            Попробуй изменить фильтры или создать новый материал. Если база пустая,
            можно запустить демо-наполнение.
          </p>

          <div className={styles.materialsEmptyActions}>
            <Link href="/admin/materials" className={styles.secondaryAdminAction}>
              Сбросить фильтры
            </Link>

            <Link href="/admin/materials/new" className={styles.primaryAdminAction}>
              Добавить материал
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}