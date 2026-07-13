import Link from "next/link";

import {
  getMaterialContentStatusLabel,
  isMaterialContentFilled,
} from "@/lib/materialContentStatus";
import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import { moveMaterialEcgSectionAction } from "../ecg-sections/actions";
import { updateEcgMaterialVisibilityAction } from "./actions";

export const dynamic = "force-dynamic";

type EcgMaterialsPageProps = {
  searchParams: Promise<{
    q?: string;
    section?: string;
    status?: string;
    content?: string;
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

  if (success === "visibility-updated") {
    return {
      type: "success",
      text: "Публикация и premium-доступ обновлены.",
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

function getCurrentPath(q: string, section: string, status: string, content: string) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (section) params.set("section", section);
  if (status) params.set("status", status);
  if (content) params.set("content", content);

  const query = params.toString();

  return query ? `/admin/ecg-materials?${query}` : "/admin/ecg-materials";
}

export default async function AdminEcgMaterialsPage({
  searchParams,
}: EcgMaterialsPageProps) {
  const {
    q = "",
    section = "",
    status = "",
    content = "",
    error,
    success,
  } = await searchParams;

  const cleanQuery = q.trim();
  const cleanSection = section.trim();
  const cleanStatus = status.trim();
  const cleanContent = content.trim();
  const currentPath = getCurrentPath(cleanQuery, cleanSection, cleanStatus, cleanContent);
  const message = getMessage(error, success);

  const [sections, rawMaterials, allEcgMaterials, unassignedCount] = await Promise.all([
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
        ...(cleanStatus === "published"
          ? {
              isPublished: true,
            }
          : cleanStatus === "draft"
            ? {
                isPublished: false,
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

    prisma.material.findMany({
      where: {
        category: {
          slug: "ecg-base",
        },
      },
      select: {
        id: true,
        content: true,
        isPublished: true,
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

  const materials = rawMaterials.filter((material) => {
    if (cleanContent === "filled") {
      return isMaterialContentFilled(material.content);
    }

    if (cleanContent === "empty") {
      return !isMaterialContentFilled(material.content);
    }

    return true;
  });

  const emptyCount = allEcgMaterials.filter((material) => {
    return !isMaterialContentFilled(material.content);
  }).length;

  const draftCount = allEcgMaterials.filter((material) => {
    return !material.isPublished;
  }).length;

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>ЭКГ материалы</h1>

          <p className={styles.pageDescription}>
            Единый список материалов ЭКГ базы. Здесь видно, что заполнено, что
            опубликовано и какие материалы ещё нужно дописать.
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
          <strong>{allEcgMaterials.length}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Найдено</span>
          <strong>{materials.length}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Пустые</span>
          <strong>{emptyCount}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Черновики</span>
          <strong>{draftCount}</strong>
        </div>

        <div className={styles.adminStatCard}>
          <span>Без подраздела</span>
          <strong>{unassignedCount}</strong>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Фильтры</p>
            <h2>Найти материал</h2>
          </div>

          <p>
            Можно быстро найти пустые материалы, черновики или материалы конкретного подраздела.
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

          <label className={styles.formGroup}>
            <span className={styles.label}>Публикация</span>

            <select className={styles.input} name="status" defaultValue={cleanStatus}>
              <option value="">Все</option>
              <option value="published">Опубликованные</option>
              <option value="draft">Черновики</option>
            </select>
          </label>

          <label className={styles.formGroup}>
            <span className={styles.label}>Заполненность</span>

            <select className={styles.input} name="content" defaultValue={cleanContent}>
              <option value="">Все</option>
              <option value="filled">Заполненные</option>
              <option value="empty">Пустые</option>
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
            Если материал пустой, его нужно открыть через «Редактировать» и заполнить текст.
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

                    <span
                      className={
                        isMaterialContentFilled(material.content)
                          ? styles.materialBadgePublished
                          : styles.materialBadgeDraft
                      }
                    >
                      {getMaterialContentStatusLabel(material.content)}
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
                    Позиция
                  </button>
                </form>

                <form
                  action={updateEcgMaterialVisibilityAction}
                  className={styles.ecgMaterialVisibilityForm}
                >
                  <input type="hidden" name="materialId" value={material.id} />
                  <input type="hidden" name="redirectPath" value={currentPath} />

                  <label className={styles.simpleCheckbox}>
                    <input
                      name="isPublished"
                      type="checkbox"
                      defaultChecked={material.isPublished}
                    />
                    <span>Опубликован</span>
                  </label>

                  <label className={styles.simpleCheckbox}>
                    <input
                      name="isPremium"
                      type="checkbox"
                      defaultChecked={material.isPremium}
                    />
                    <span>Premium</span>
                  </label>

                  <button className={styles.secondaryAdminAction} type="submit">
                    Доступ
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