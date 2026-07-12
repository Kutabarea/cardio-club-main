import Link from "next/link";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import { moveMaterialEcgSectionAction } from "../actions";

export const dynamic = "force-dynamic";

type UnassignedEcgMaterialsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (success === "material-moved") return { type: "success", text: "Материал перенесён." };
  if (error === "material-required") return { type: "error", text: "Материал не выбран." };
  if (error === "material-not-found") return { type: "error", text: "Материал не найден." };
  if (error === "not-ecg-base") return { type: "error", text: "Этот материал не относится к ЭКГ базе." };
  if (error === "section-not-found") return { type: "error", text: "Подраздел не найден." };

  return null;
}

export default async function UnassignedEcgMaterialsPage({
  searchParams,
}: UnassignedEcgMaterialsPageProps) {
  const { error, success } = await searchParams;
  const message = getMessage(error, success);

  const [materials, sections] = await Promise.all([
    prisma.material.findMany({
      where: {
        ecgSectionId: null,
        category: {
          slug: "ecg-base",
        },
      },
      orderBy: {
        title: "asc",
      },
      include: {
        category: true,
        ecgSection: true,
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

  const currentPath = "/admin/ecg-sections/unassigned";

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link href="/admin/ecg-sections" className={styles.backLink}>
            ← ЭКГ подразделы
          </Link>

          <h1 className={styles.pageTitle}>Материалы без подраздела</h1>

          <p className={styles.pageDescription}>
            Это материалы категории «ЭКГ база», которым ещё не назначен внутренний подраздел.
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

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Разбор</p>
            <h2>Распределить материалы</h2>
          </div>

          <p>
            Перенеси материалы в нужные подразделы, чтобы они правильно отображались на странице ЭКГ базы.
          </p>
        </div>

        <div className={styles.adminList}>
          {materials.map((material) => {
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
                    <span className={styles.label}>Назначить подраздел</span>

                    <select className={styles.input} name="ecgSectionId" defaultValue="">
                      <option value="">Без подраздела</option>

                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className={styles.primaryAdminAction} type="submit">
                    Перенести
                  </button>
                </form>
              </article>
            );
          })}

          {materials.length === 0 ? (
            <div className={styles.emptyEditorState}>
              Все материалы ЭКГ базы уже распределены по подразделам.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}