import Link from "next/link";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import { moveMaterialEcgSectionAction } from "../ecg-sections/actions";

export const dynamic = "force-dynamic";

type EcgMaterialsPageProps = {
  searchParams: Promise<{
    q?: string;
    section?: string;
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (success === "material-moved") {
    return {
      type: "success",
      text: "Материал обновлён.",
    };
  }

  if (error === "material-required") {
    return {
      type: "error",
      text: "Материал не выбран.",
    };
  }

  if (error === "material-not-found") {
    return {
      type: "error",
      text: "Материал не найден.",
    };
  }

  if (error === "not-ecg-base") {
    return {
      type: "error",
      text: "Этот материал не относится к ЭКГ базе.",
    };
  }

  if (error === "section-not-found") {
    return {
      type: "error",
      text: "Подраздел не найден.",
    };
  }

  return null;
}

function getCurrentPath(q: string, section: string) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (section) params.set("section", section);

  const query = params.toString();

  return query ? `/admin/ecg-materials?${query}` : "/admin/ecg-materials";
}

export default async function AdminEcgMaterialsPage({
  searchParams,
}: EcgMaterialsPageProps) {
  const { q = "", section = "", error, success } = await searchParams;

  const cleanQuery = q.trim();
  const cleanSection = section.trim();
  const currentPath = getCurrentPath(cleanQuery, cleanSection);
  const message = getMessage(error, success);

  const [sections, materials, totalMaterials, unassignedCount] = await Promise.all([
    prisma.ecgSection.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
      select: {
        id: true,
        title: true,
      },
    }),

    prisma.material.findMany({
      where: {
        category: {
          slug: "ecg-base",
        },
        ...(cleanSection === "unassigned"
          ? {
              ecgSectionId: null,
            }
          : cleanSection
            ? {
                ecgSectionId: cleanSection,
              }
            : {}),
        ...(cleanQuery
          ? {
              OR: [
                {
                  title: {
                    contains: cleanQuery,
                  },
                },
                {
                  description: {
                    contains: cleanQuery,
                  },
                },
                {
                  content: {
                    contains: cleanQuery,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [
        {
          ecgSection: {
            sortOrder: "asc",
          },
        },
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
      include: {
        category: true,
        ecgSection: true,
      },
    }),

    prisma.material.count({
      where: {
        category: {
          slug: "ecg-base",
        },
      },
    }),

    prisma.material.count({
      where: {
        category: {
          slug: "ecg-base",
        },
        ecgSectionId: null,
      },
    }),
  ]);

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>ЭКГ материалы</h1>

          <p className={styles.pageDescription}>
            Единый список материалов ЭКГ базы. Здесь удобно искать материалы,
            переносить их между подразделами и менять позицию в списке.
          </p>
        </div>

        <div className={styles.ecgSectionTopActions}>
          <Link
            href={`/admin/materials/new?categorySlug=ecg-base&type=ECG_ARTICLE&sortOrder=100&returnTo=${encodeURIComponent(currentPath)}`}
            className={styles.primaryAdminAction}
          >
            Добавить материал
          </Link>

          <Link href="/admin/ecg-sections" className={styles.secondaryAdminAction}>
            ЭКГ подразделы
          </Link>
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

      <section className={styles.adminStatsGrid}>
        <div className={styles.adminStatCard}>
          <span>Всего материалов</span>
          <strong>{totalMaterials}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Найдено</span>
          <strong>{materials.length}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Без подраздела</span>
          <strong>{unassignedCount}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Подразделов</span>
          <strong>{sections.length}</strong>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Фильтры</p>
            <h2>Найти материал</h2>
          </div>

          <p>
            Поиск работает по названию, описанию и тексту материала.
          </p>
        </div>

        <form className={styles.ecgMaterialsFilters}>
          <label className={styles.formGroup}>
            <span className={styles.label}>Поиск</span>
            <input
              className={styles.input}
              name="q"
              defaultValue={cleanQuery}
              placeholder="Например: дельта волна"
            />
          </label>

          <label className={styles.formGroup}>
            <span className={styles.label}>Подраздел</span>

            <select className={styles.input} name="section" defaultValue={cleanSection}>
              <option value="">Все подразделы</option>
              <option value="unassigned">Без подраздела</option>

              {sections.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <button className={styles.primaryAdminAction} type="submit">
            Применить
          </button>

          <Link href="/admin/ecg-materials" className={styles.secondaryAdminAction}>
            Сбросить
          </Link>
        </form>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Материалы</p>
            <h2>Список ЭКГ базы</h2>
          </div>

          <p>
            Меньшая позиция означает более высокое место в списке на странице ЭКГ базы.
          </p>
        </div>

        <div className={styles.ecgMaterialsList}>
          {materials.map((material) => {
            const publicHref = getMaterialPublicHref(material);

            return (
              <article key={material.id} className={styles.ecgMaterialRow}>
                <div className={styles.ecgMaterialMain}>
                  <div>
                    <h3 className={styles.adminListTitle}>{material.title}</h3>

                    <p className={styles.pageDescription}>
                      {material.description || "Описание не заполнено."}
                    </p>
                  </div>

                  <div className={styles.ecgMaterialBadges}>
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

                    <span className={styles.materialBadgeCategory}>
                      {material.ecgSection?.title ?? "Без подраздела"}
                    </span>
                  </div>
                </div>

                <form action={moveMaterialEcgSectionAction} className={styles.ecgMaterialMoveForm}>
                  <input type="hidden" name="materialId" value={material.id} />
                  <input type="hidden" name="redirectPath" value={currentPath} />

                  <label className={styles.formGroup}>
                    <span className={styles.label}>Подраздел</span>

                    <select
                      className={styles.input}
                      name="ecgSectionId"
                      defaultValue={material.ecgSectionId ?? ""}
                    >
                      <option value="">Без подраздела</option>

                      {sections.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.formGroup}>
                    <span className={styles.label}>Позиция</span>

                    <input
                      className={styles.input}
                      name="sortOrder"
                      type="number"
                      defaultValue={material.sortOrder}
                    />
                  </label>

                  <button className={styles.primaryAdminAction} type="submit">
                    Сохранить
                  </button>
                </form>

                <div className={styles.ecgMaterialActions}>
                  <Link
                    href={`/admin/materials/${material.id}/edit`}
                    className={styles.primaryAdminAction}
                  >
                    Редактировать
                  </Link>

                  {publicHref ? (
                    <Link
                      href={publicHref}
                      className={styles.secondaryAdminAction}
                      target="_blank"
                      rel="noreferrer"
                    >
                      На сайте
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}

          {materials.length === 0 ? (
            <div className={styles.emptyEditorState}>
              Материалы по выбранным фильтрам не найдены.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}