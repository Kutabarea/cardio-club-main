import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import { moveMaterialEcgSectionAction, updateEcgSectionAction } from "../actions";

export const dynamic = "force-dynamic";

type AdminEcgSectionMaterialsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (success === "updated") return { type: "success", text: "Подраздел обновлён." };
  if (success === "material-moved") return { type: "success", text: "Материал обновлён." };
  if (error === "required-fields") return { type: "error", text: "Заполни название подраздела." };
  if (error === "slug-exists") return { type: "error", text: "Подраздел с таким названием уже существует." };
  if (error === "material-required") return { type: "error", text: "Материал не выбран." };
  if (error === "material-not-found") return { type: "error", text: "Материал не найден." };
  if (error === "not-ecg-base") return { type: "error", text: "Этот материал не относится к ЭКГ базе." };
  if (error === "section-not-found") return { type: "error", text: "Подраздел не найден." };

  return null;
}

export default async function AdminEcgSectionMaterialsPage({
  params,
  searchParams,
}: AdminEcgSectionMaterialsPageProps) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [section, sections] = await Promise.all([
    prisma.ecgSection.findUnique({
      where: {
        id,
      },
      include: {
        materials: {
          where: {
            category: {
              slug: "ecg-base",
            },
          },
          orderBy: [
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
        },
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
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  if (!section) {
    notFound();
  }

  const message = getMessage(error, success);
  const currentPath = `/admin/ecg-sections/${section.id}`;
  const nextSortOrder =
    section.materials.length > 0
      ? Math.max(...section.materials.map((material) => material.sortOrder)) + 10
      : 10;

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link href="/admin/ecg-sections" className={styles.backLink}>
            ← ЭКГ подразделы
          </Link>

          <h1 className={styles.pageTitle}>{section.title}</h1>

          <p className={styles.pageDescription}>
            Здесь можно изменить подраздел и порядок материалов на странице ЭКГ базы.
          </p>
        </div>

        <div className={styles.simpleEditHeaderActions}>
          <Link
            href={`/library/base/section/${section.slug}`}
            className={styles.secondaryAdminAction}
            target="_blank"
            rel="noreferrer"
          >
            На сайте
          </Link>

          <Link
            href={`/admin/materials/new?categorySlug=ecg-base&ecgSectionId=${section.id}&type=ECG_ARTICLE&sortOrder=${nextSortOrder}&returnTo=${encodeURIComponent(currentPath)}`}
            className={styles.primaryAdminAction}
          >
            Добавить материал сюда
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

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Подраздел</p>
            <h2>Настройки подраздела</h2>
          </div>

          <p>
            Название и описание отображаются на странице ЭКГ базы.
          </p>
        </div>

        <form action={updateEcgSectionAction} className={styles.formGrid}>
          <input type="hidden" name="id" value={section.id} />
          <input type="hidden" name="redirectPath" value={currentPath} />

          <label className={styles.formGroup}>
            <span className={styles.label}>Название</span>
            <input
              className={styles.input}
              name="title"
              defaultValue={section.title}
              required
            />
          </label>

          <label className={styles.formGroup}>
            <span className={styles.label}>Порядок подраздела</span>
            <input
              className={styles.input}
              name="sortOrder"
              type="number"
              defaultValue={section.sortOrder}
            />
          </label>

          <label className={styles.formGroup}>
            <span className={styles.label}>Описание</span>
            <textarea
              className={styles.textareaSmall}
              name="description"
              defaultValue={section.description ?? ""}
            />
          </label>

          <button className={styles.primaryAdminAction} type="submit">
            Сохранить подраздел
          </button>
        </form>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Материалы</p>
            <h2>Материалы подраздела</h2>
          </div>

          <p>
            Чем меньше число порядка, тем выше материал отображается в списке.
            Удобно использовать 10, 20, 30, чтобы потом вставлять материалы между ними.
          </p>
        </div>

        <div className={styles.adminList}>
          {section.materials.map((material) => {
            const publicHref = getMaterialPublicHref(material);

            return (
              <article key={material.id} className={styles.adminListItem}>
                <div className={styles.simpleEditHeader}>
                  <div>
                    <h3 className={styles.adminListTitle}>{material.title}</h3>

                    <p className={styles.pageDescription}>
                      {material.description || "Описание не заполнено."}
                    </p>
                  </div>

                  <div className={styles.simpleEditHeaderActions}>
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
                </div>

                <form action={moveMaterialEcgSectionAction} className={styles.formGrid}>
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

                      {sections.map((targetSection) => (
                        <option key={targetSection.id} value={targetSection.id}>
                          {targetSection.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.formGroup}>
                    <span className={styles.label}>Порядок материала</span>
                    <input
                      className={styles.input}
                      name="sortOrder"
                      type="number"
                      defaultValue={material.sortOrder}
                    />
                  </label>

                  <button className={styles.primaryAdminAction} type="submit">
                    Сохранить положение
                  </button>
                </form>
              </article>
            );
          })}

          {section.materials.length === 0 ? (
            <div className={styles.emptyEditorState}>
              В этом подразделе пока нет материалов.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}