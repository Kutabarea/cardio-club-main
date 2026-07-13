import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import {
  createEcgSectionAction,
  deleteEcgSectionAction,
  updateEcgSectionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type EcgSectionsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (success === "created") return { type: "success", text: "Подраздел создан." };
  if (success === "updated") return { type: "success", text: "Подраздел обновлён." };
  if (success === "deleted") return { type: "success", text: "Подраздел удалён. Материалы остались, но стали без подраздела." };
  if (success === "material-moved") return { type: "success", text: "Материал обновлён." };
  if (error === "required-fields") return { type: "error", text: "Заполни название подраздела." };
  if (error === "slug-exists") return { type: "error", text: "Подраздел с таким названием уже существует." };
  if (error === "delete-not-confirmed") return { type: "error", text: "Удаление не подтверждено." };
  if (error === "material-required") return { type: "error", text: "Материал не выбран." };
  if (error === "material-not-found") return { type: "error", text: "Материал не найден." };
  if (error === "not-ecg-base") return { type: "error", text: "Этот материал не относится к ЭКГ базе." };
  if (error === "section-not-found") return { type: "error", text: "Подраздел не найден." };

  return null;
}

export default async function AdminEcgSectionsPage({
  searchParams,
}: EcgSectionsPageProps) {
  const { error, success } = await searchParams;
  const message = getMessage(error, success);

  const [sections, unassignedCount] = await Promise.all([
    prisma.ecgSection.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
      include: {
        _count: {
          select: {
            materials: true,
          },
        },
      },
    }),
    prisma.material.count({
      where: {
        ecgSectionId: null,
        category: {
          slug: "ecg-base",
        },
      },
    }),
  ]);

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>ЭКГ подразделы</h1>

          <p className={styles.pageDescription}>
            Здесь редактируются подразделы страницы «ЭКГ база» и материалы внутри них.
          </p>
        </div>

        <div className={styles.ecgSectionTopActions}>
          <Link href="/admin/ecg-sections/unassigned" className={styles.secondaryAdminAction}>
            Материалы без подраздела: {unassignedCount}
          </Link>

          <Link href="/admin/materials/new" className={styles.primaryAdminAction}>
            Добавить материал
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
            <p className={styles.editorStep}>Новый подраздел</p>
            <h2>Создать подраздел ЭКГ базы</h2>
          </div>

          <p>
            Новый подраздел появится на странице ЭКГ базы.
          </p>
        </div>

        <form action={createEcgSectionAction} className={styles.formGrid}>
          <label className={styles.formGroup}>
            <span className={styles.label}>Название</span>
            <input
              className={styles.input}
              name="title"
              placeholder="Например: Нарушения проводимости"
              required
            />
          </label>

          <label className={styles.formGroup}>
            <span className={styles.label}>Позиция</span>
            <input
              className={styles.input}
              name="sortOrder"
              type="number"
              defaultValue="100"
            />
          </label>

          <label className={styles.formGroup}>
            <span className={styles.label}>Описание</span>
            <textarea
              className={styles.textareaSmall}
              name="description"
              placeholder="Короткое описание подраздела"
            />
          </label>

          <button className={styles.primaryAdminAction} type="submit">
            Создать подраздел
          </button>
        </form>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <p className={styles.editorStep}>Список</p>
            <h2>Подразделы ЭКГ базы</h2>
          </div>

          <p>
            Нажми «Открыть материалы», чтобы переносить пункты между подразделами и менять порядок.
          </p>
        </div>

        <div className={styles.adminList}>
          {sections.map((section) => (
            <article key={section.id} className={styles.adminListItem}>
              <div className={styles.ecgSectionCardHeader}>
                <div>
                  <h3 className={styles.adminListTitle}>{section.title}</h3>

                  <p className={styles.pageDescription}>
                    {section.description || "Описание не заполнено."}
                  </p>
                </div>

                <div className={styles.ecgSectionCardActions}>
                  <Link
                    href={`/admin/ecg-sections/${section.id}`}
                    className={styles.primaryAdminAction}
                  >
                    Открыть материалы · {section._count.materials}
                  </Link>

                  <Link
                    href={`/library/base/section/${section.slug}`}
                    className={styles.secondaryAdminAction}
                    target="_blank"
                    rel="noreferrer"
                  >
                    На сайте
                  </Link>
                </div>
              </div>

              <form action={updateEcgSectionAction} className={styles.formGrid}>
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="redirectPath" value="/admin/ecg-sections" />

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
                  <span className={styles.label}>Позиция подраздела</span>
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

              <form action={deleteEcgSectionAction}>
                <input type="hidden" name="id" value={section.id} />
                <input
                  type="hidden"
                  name="confirmDelete"
                  value="DELETE_ECG_SECTION"
                />

                <button className={styles.deleteButton} type="submit">
                  Удалить подраздел
                </button>
              </form>
            </article>
          ))}

          {sections.length === 0 ? (
            <div className={styles.emptyEditorState}>
              Подразделов пока нет.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}