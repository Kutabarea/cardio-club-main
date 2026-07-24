import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import {
  createContentAreaAction,
  createStructureCategoryAction,
  createSubsectionAction,
  deleteContentAreaAction,
  deleteStructureCategoryAction,
  deleteSubsectionAction,
  updateContentAreaAction,
  updateStructureCategoryAction,
  updateSubsectionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(
  error?: string,
  success?: string,
) {
  const successMessages: Record<string, string> = {
    "area-created": "Раздел сайта создан.",
    "area-updated": "Раздел сайта обновлён.",
    "area-deleted": "Раздел сайта удалён.",
    "category-created": "Категория создана.",
    "category-updated": "Категория обновлена.",
    "category-deleted": "Категория удалена.",
    "subsection-created": "Подраздел создан.",
    "subsection-updated": "Подраздел обновлён.",
    "subsection-deleted": "Подраздел удалён.",
  };

  const errorMessages: Record<string, string> = {
    "invalid-area": "Проверь данные раздела сайта.",
    "invalid-category": "Проверь данные категории.",
    "invalid-subsection": "Проверь данные подраздела.",
    "slug-exists": "Такой slug уже используется.",
    "not-found": "Запись не найдена.",
    "delete-not-confirmed": "Удаление не подтверждено.",
    "area-not-empty": "Сначала удали или перенеси категории этого раздела.",
    "category-not-empty": "Категория содержит материалы или подразделы.",
    "subsection-not-empty": "Подраздел содержит материалы.",
    "area-type-in-use": "Нельзя менять тип раздела, пока в нём есть материалы.",
    "category-type-in-use": "Нельзя переносить категорию в раздел другого типа, пока в ней есть материалы.",
    "category-has-subsections": "Сначала удали или перенеси существующие подразделы.",
  };

  if (success && successMessages[success]) {
    return {
      type: "success",
      text: successMessages[success],
    };
  }

  if (error) {
    return {
      type: "error",
      text:
        errorMessages[error] ??
        "Не удалось выполнить действие.",
    };
  }

  return null;
}

function getMaterialTypeLabel(type: string) {
  if (type === "NEWS") return "Новости";
  if (type === "VIDEO_LECTURE") return "Видеолекции";
  if (type === "ECG_ARTICLE") return "ЭКГ и статьи";
  if (type === "VIDEO_COURSE") return "Видеокурсы";
  if (type === "LITERATURE") return "Литература";
  if (type === "HELPER") return "Полезные ресурсы";

  return type;
}

function getSubsectionKindLabel(kind: string) {
  if (kind === "ECG") return "Подразделы ЭКГ";
  if (kind === "VIDEO_LECTURE") {
    return "Тематики видеолекций";
  }

  return "Без дополнительного уровня";
}

export default async function ContentStructurePage({
  searchParams,
}: PageProps) {
  const { error, success } = await searchParams;
  const message = getMessage(error, success);

  const contentAreas =
    await prisma.contentArea.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
      include: {
        categories: {
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
                ecgSections: true,
                videoLectureSections: true,
              },
            },
            ecgSections: {
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
            },
            videoLectureSections: {
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
            },
          },
        },
      },
    });

  const totalCategories = contentAreas.reduce(
    (total, area) =>
      total + area.categories.length,
    0,
  );

  const totalSubsections = contentAreas.reduce(
    (total, area) =>
      total +
      area.categories.reduce(
        (categoryTotal, category) =>
          categoryTotal +
          category.ecgSections.length +
          category.videoLectureSections.length,
        0,
      ),
    0,
  );

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>
            Структура контента
          </h1>

          <p className={styles.pageDescription}>
            Управление разделами сайта, категориями,
            подразделами и их порядком.
          </p>
        </div>

        <Link
          href="/admin/materials/new"
          className={styles.primaryAdminAction}
        >
          Добавить материал
        </Link>
      </div>

      <div className={styles.structureStats}>
        <div>
          <span>Разделов сайта</span>
          <strong>{contentAreas.length}</strong>
        </div>

        <div>
          <span>Категорий</span>
          <strong>{totalCategories}</strong>
        </div>

        <div>
          <span>Подразделов</span>
          <strong>{totalSubsections}</strong>
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
            <p className={styles.editorStep}>
              Верхний уровень
            </p>

            <h2>
              Создать раздел сайта
            </h2>
          </div>

          <p>
            Например: Новости, ЭКГ, Курсы или
            Помощник кардиолога.
          </p>
        </div>

        <form
          action={createContentAreaAction}
          className={styles.structureForm}
        >
          <div className={styles.formGrid}>
            <label className={styles.formGroup}>
              <span className={styles.label}>
                Название
              </span>

              <input
                className={styles.input}
                name="title"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>
                Slug
              </span>

              <input
                className={styles.input}
                name="slug"
                placeholder="ecg"
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>
                Тип материалов
              </span>

              <select
                className={styles.input}
                name="materialType"
                defaultValue="ECG_ARTICLE"
              >
                <option value="NEWS">Новости</option>
                <option value="VIDEO_LECTURE">
                  Видеолекции
                </option>
                <option value="ECG_ARTICLE">
                  ЭКГ и статьи
                </option>
                <option value="VIDEO_COURSE">
                  Видеокурсы
                </option>
                <option value="LITERATURE">
                  Литература
                </option>
                <option value="HELPER">
                  Полезные ресурсы
                </option>
              </select>
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>
                Позиция
              </span>

              <input
                className={styles.input}
                name="sortOrder"
                type="number"
                defaultValue="100"
              />
            </label>
          </div>

          <label className={styles.formGroup}>
            <span className={styles.label}>
              Описание
            </span>

            <textarea
              className={styles.textareaSmall}
              name="description"
            />
          </label>

          <label className={styles.structureCheckbox}>
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
            />

            Активен
          </label>

          <button
            className={styles.primaryAdminAction}
            type="submit"
          >
            Создать раздел
          </button>
        </form>
      </section>

      <div className={styles.structureTree}>
        {contentAreas.map((area) => (
          <details
            key={area.id}
            className={styles.structureArea}
            open
          >
            <summary className={styles.structureAreaSummary}>
              <div>
                <strong>{area.title}</strong>

                <span>
                  {getMaterialTypeLabel(area.materialType)}
                  {" · "}
                  категорий: {area.categories.length}
                </span>
              </div>

              <span
                className={
                  area.isActive
                    ? styles.statusBadgeSuccess
                    : styles.statusBadgeNeutral
                }
              >
                {area.isActive
                  ? "Активен"
                  : "Отключён"}
              </span>
            </summary>

            <div className={styles.structureAreaBody}>
              <form
                action={updateContentAreaAction}
                className={styles.structureForm}
              >
                <input
                  type="hidden"
                  name="id"
                  value={area.id}
                />

                <div className={styles.formGrid}>
                  <label className={styles.formGroup}>
                    <span className={styles.label}>
                      Название
                    </span>

                    <input
                      className={styles.input}
                      name="title"
                      defaultValue={area.title}
                      required
                    />
                  </label>

                  <label className={styles.formGroup}>
                    <span className={styles.label}>
                      Slug
                    </span>

                    <input
                      className={styles.input}
                      name="slug"
                      defaultValue={area.slug}
                      required
                    />
                  </label>

                  <label className={styles.formGroup}>
                    <span className={styles.label}>
                      Тип материалов
                    </span>

                    <select
                      className={styles.input}
                      name="materialType"
                      defaultValue={area.materialType}
                    >
                      <option value="NEWS">Новости</option>
                      <option value="VIDEO_LECTURE">
                        Видеолекции
                      </option>
                      <option value="ECG_ARTICLE">
                        ЭКГ и статьи
                      </option>
                      <option value="VIDEO_COURSE">
                        Видеокурсы
                      </option>
                      <option value="LITERATURE">
                        Литература
                      </option>
                      <option value="HELPER">
                        Полезные ресурсы
                      </option>
                    </select>
                  </label>

                  <label className={styles.formGroup}>
                    <span className={styles.label}>
                      Позиция
                    </span>

                    <input
                      className={styles.input}
                      name="sortOrder"
                      type="number"
                      defaultValue={area.sortOrder}
                    />
                  </label>
                </div>

                <label className={styles.formGroup}>
                  <span className={styles.label}>
                    Описание
                  </span>

                  <textarea
                    className={styles.textareaSmall}
                    name="description"
                    defaultValue={area.description ?? ""}
                  />
                </label>

                <label className={styles.structureCheckbox}>
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={area.isActive}
                  />

                  Активен
                </label>

                <button
                  className={styles.primaryAdminAction}
                  type="submit"
                >
                  Сохранить раздел
                </button>
              </form>

              <form action={deleteContentAreaAction}>
                <input
                  type="hidden"
                  name="id"
                  value={area.id}
                />

                <input
                  type="hidden"
                  name="confirmation"
                  value="DELETE_CONTENT_AREA"
                />

                <button
                  className={styles.deleteButton}
                  type="submit"
                  disabled={area.categories.length > 0}
                  title={
                    area.categories.length > 0
                      ? "Сначала удали или перенеси категории"
                      : undefined
                  }
                >
                  Удалить раздел
                </button>
              </form>

              <section className={styles.structureCreateBox}>
                <h3>
                  Новая категория в разделе «{area.title}»
                </h3>

                <form
                  action={createStructureCategoryAction}
                  className={styles.structureForm}
                >
                  <input
                    type="hidden"
                    name="contentAreaId"
                    value={area.id}
                  />

                  <div className={styles.formGrid}>
                    <label className={styles.formGroup}>
                      <span className={styles.label}>
                        Название
                      </span>

                      <input
                        className={styles.input}
                        name="title"
                        required
                      />
                    </label>

                    <label className={styles.formGroup}>
                      <span className={styles.label}>
                        Slug
                      </span>

                      <input
                        className={styles.input}
                        name="slug"
                      />
                    </label>

                    <label className={styles.formGroup}>
                      <span className={styles.label}>
                        Тип подразделов
                      </span>

                      <select
                        className={styles.input}
                        name="subsectionKind"
                        defaultValue="NONE"
                      >
                        <option value="NONE">
                          Без подразделов
                        </option>

                        <option value="ECG">
                          Подразделы ЭКГ
                        </option>

                        <option value="VIDEO_LECTURE">
                          Тематики видеолекций
                        </option>
                      </select>
                    </label>

                    <label className={styles.formGroup}>
                      <span className={styles.label}>
                        Позиция
                      </span>

                      <input
                        className={styles.input}
                        name="sortOrder"
                        type="number"
                        defaultValue="100"
                      />
                    </label>
                  </div>

                  <label className={styles.formGroup}>
                    <span className={styles.label}>
                      Описание
                    </span>

                    <textarea
                      className={styles.textareaSmall}
                      name="description"
                    />
                  </label>

                  <label className={styles.structureCheckbox}>
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked
                    />

                    Активна
                  </label>

                  <button
                    className={styles.secondaryAdminAction}
                    type="submit"
                  >
                    Создать категорию
                  </button>
                </form>
              </section>

              <div className={styles.structureCategories}>
                {area.categories.map((category) => {
                  const subsections =
                    category.subsectionKind === "ECG"
                      ? category.ecgSections.map(
                          (section) => ({
                            ...section,
                            kind: "ECG" as const,
                          }),
                        )
                      : category.videoLectureSections.map(
                          (section) => ({
                            ...section,
                            kind: "VIDEO_LECTURE" as const,
                          }),
                        );

                  return (
                    <details
                      key={category.id}
                      className={styles.structureCategory}
                    >
                      <summary
                        className={styles.structureCategorySummary}
                      >
                        <div>
                          <strong>
                            {category.title}
                          </strong>

                          <span>
                            {getSubsectionKindLabel(
                              category.subsectionKind,
                            )}
                            {" · "}
                            материалов: {
                              category._count.materials
                            }
                          </span>
                        </div>

                        <span
                          className={
                            category.isActive
                              ? styles.statusBadgeSuccess
                              : styles.statusBadgeNeutral
                          }
                        >
                          {category.isActive
                            ? "Активна"
                            : "Отключена"}
                        </span>
                      </summary>

                      <div
                        className={
                          styles.structureCategoryBody
                        }
                      >
                        <form
                          action={
                            updateStructureCategoryAction
                          }
                          className={styles.structureForm}
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={category.id}
                          />

                          <div className={styles.formGrid}>
                            <label
                              className={styles.formGroup}
                            >
                              <span
                                className={styles.label}
                              >
                                Раздел сайта
                              </span>

                              <select
                                className={styles.input}
                                name="contentAreaId"
                                defaultValue={area.id}
                              >
                                {contentAreas.map(
                                  (targetArea) => (
                                    <option
                                      key={targetArea.id}
                                      value={targetArea.id}
                                    >
                                      {targetArea.title}
                                    </option>
                                  ),
                                )}
                              </select>
                            </label>

                            <label
                              className={styles.formGroup}
                            >
                              <span
                                className={styles.label}
                              >
                                Название
                              </span>

                              <input
                                className={styles.input}
                                name="title"
                                defaultValue={
                                  category.title
                                }
                                required
                              />
                            </label>

                            <label
                              className={styles.formGroup}
                            >
                              <span
                                className={styles.label}
                              >
                                Slug
                              </span>

                              <input
                                className={styles.input}
                                name="slug"
                                defaultValue={
                                  category.slug
                                }
                                required
                              />
                            </label>

                            <label
                              className={styles.formGroup}
                            >
                              <span
                                className={styles.label}
                              >
                                Тип подразделов
                              </span>

                              <select
                                className={styles.input}
                                name="subsectionKind"
                                defaultValue={
                                  category.subsectionKind
                                }
                              >
                                <option value="NONE">
                                  Без подразделов
                                </option>

                                <option value="ECG">
                                  Подразделы ЭКГ
                                </option>

                                <option value="VIDEO_LECTURE">
                                  Тематики видеолекций
                                </option>
                              </select>
                            </label>

                            <label
                              className={styles.formGroup}
                            >
                              <span
                                className={styles.label}
                              >
                                Позиция
                              </span>

                              <input
                                className={styles.input}
                                name="sortOrder"
                                type="number"
                                defaultValue={
                                  category.sortOrder
                                }
                              />
                            </label>
                          </div>

                          <label
                            className={styles.formGroup}
                          >
                            <span
                              className={styles.label}
                            >
                              Описание
                            </span>

                            <textarea
                              className={styles.textareaSmall}
                              name="description"
                              defaultValue={
                                category.description ?? ""
                              }
                            />
                          </label>

                          <label
                            className={
                              styles.structureCheckbox
                            }
                          >
                            <input
                              name="isActive"
                              type="checkbox"
                              defaultChecked={
                                category.isActive
                              }
                            />

                            Активна
                          </label>

                          <button
                            className={
                              styles.secondaryAdminAction
                            }
                            type="submit"
                          >
                            Сохранить категорию
                          </button>
                        </form>

                        <form
                          action={
                            deleteStructureCategoryAction
                          }
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={category.id}
                          />

                          <input
                            type="hidden"
                            name="confirmation"
                            value="DELETE_STRUCTURE_CATEGORY"
                          />

                          <button
                            className={styles.deleteButton}
                            type="submit"
                            disabled={
                              category._count.materials > 0 ||
                              category._count.ecgSections > 0 ||
                              category._count
                                .videoLectureSections > 0
                            }
                          >
                            Удалить категорию
                          </button>
                        </form>

                        {category.subsectionKind !==
                        "NONE" ? (
                          <section
                            className={
                              styles.structureCreateBox
                            }
                          >
                            <h3>
                              Новый подраздел
                            </h3>

                            <form
                              action={createSubsectionAction}
                              className={
                                styles.structureForm
                              }
                            >
                              <input
                                type="hidden"
                                name="categoryId"
                                value={category.id}
                              />

                              <input
                                type="hidden"
                                name="kind"
                                value={
                                  category.subsectionKind
                                }
                              />

                              <div
                                className={styles.formGrid}
                              >
                                <label
                                  className={
                                    styles.formGroup
                                  }
                                >
                                  <span
                                    className={
                                      styles.label
                                    }
                                  >
                                    Название
                                  </span>

                                  <input
                                    className={styles.input}
                                    name="title"
                                    required
                                  />
                                </label>

                                <label
                                  className={
                                    styles.formGroup
                                  }
                                >
                                  <span
                                    className={
                                      styles.label
                                    }
                                  >
                                    Slug
                                  </span>

                                  <input
                                    className={styles.input}
                                    name="slug"
                                  />
                                </label>

                                <label
                                  className={
                                    styles.formGroup
                                  }
                                >
                                  <span
                                    className={
                                      styles.label
                                    }
                                  >
                                    Позиция
                                  </span>

                                  <input
                                    className={styles.input}
                                    name="sortOrder"
                                    type="number"
                                    defaultValue="100"
                                  />
                                </label>
                              </div>

                              <label
                                className={
                                  styles.formGroup
                                }
                              >
                                <span
                                  className={
                                    styles.label
                                  }
                                >
                                  Описание
                                </span>

                                <textarea
                                  className={
                                    styles.textareaSmall
                                  }
                                  name="description"
                                />
                              </label>

                              <label
                                className={
                                  styles.structureCheckbox
                                }
                              >
                                <input
                                  name="isActive"
                                  type="checkbox"
                                  defaultChecked
                                />

                                Активен
                              </label>

                              <button
                                className={
                                  styles.secondaryAdminAction
                                }
                                type="submit"
                              >
                                Создать подраздел
                              </button>
                            </form>
                          </section>
                        ) : null}

                        <div
                          className={
                            styles.structureSubsections
                          }
                        >
                          {subsections.map((section) => (
                            <article
                              key={section.id}
                              className={
                                styles.structureSubsection
                              }
                            >
                              <div
                                className={
                                  styles.structureSubsectionHeader
                                }
                              >
                                <div>
                                  <strong>
                                    {section.title}
                                  </strong>

                                  <span>
                                    Материалов: {
                                      section._count
                                        .materials
                                    }
                                  </span>
                                </div>

                                <span
                                  className={
                                    section.isActive
                                      ? styles.statusBadgeSuccess
                                      : styles.statusBadgeNeutral
                                  }
                                >
                                  {section.isActive
                                    ? "Активен"
                                    : "Отключён"}
                                </span>
                              </div>

                              <form
                                action={
                                  updateSubsectionAction
                                }
                                className={
                                  styles.structureForm
                                }
                              >
                                <input
                                  type="hidden"
                                  name="id"
                                  value={section.id}
                                />

                                <input
                                  type="hidden"
                                  name="kind"
                                  value={section.kind}
                                />

                                <label
                                  className={
                                    styles.formGroup
                                  }
                                >
                                  <span
                                    className={
                                      styles.label
                                    }
                                  >
                                    Категория
                                  </span>

                                  <select
                                    className={styles.input}
                                    name="categoryId"
                                    defaultValue={
                                      category.id
                                    }
                                  >
                                    {contentAreas.flatMap(
                                      (targetArea) =>
                                        targetArea.categories
                                          .filter(
                                            (
                                              targetCategory,
                                            ) =>
                                              targetCategory
                                                .subsectionKind ===
                                              section.kind,
                                          )
                                          .map(
                                            (
                                              targetCategory,
                                            ) => (
                                              <option
                                                key={
                                                  targetCategory.id
                                                }
                                                value={
                                                  targetCategory.id
                                                }
                                              >
                                                {
                                                  targetArea.title
                                                }
                                                {" → "}
                                                {
                                                  targetCategory.title
                                                }
                                              </option>
                                            ),
                                          ),
                                    )}
                                  </select>
                                </label>

                                <div
                                  className={styles.formGrid}
                                >
                                  <label
                                    className={
                                      styles.formGroup
                                    }
                                  >
                                    <span
                                      className={
                                        styles.label
                                      }
                                    >
                                      Название
                                    </span>

                                    <input
                                      className={
                                        styles.input
                                      }
                                      name="title"
                                      defaultValue={
                                        section.title
                                      }
                                      required
                                    />
                                  </label>

                                  <label
                                    className={
                                      styles.formGroup
                                    }
                                  >
                                    <span
                                      className={
                                        styles.label
                                      }
                                    >
                                      Slug
                                    </span>

                                    <input
                                      className={
                                        styles.input
                                      }
                                      name="slug"
                                      defaultValue={
                                        section.slug
                                      }
                                      required
                                    />
                                  </label>

                                  <label
                                    className={
                                      styles.formGroup
                                    }
                                  >
                                    <span
                                      className={
                                        styles.label
                                      }
                                    >
                                      Позиция
                                    </span>

                                    <input
                                      className={
                                        styles.input
                                      }
                                      name="sortOrder"
                                      type="number"
                                      defaultValue={
                                        section.sortOrder
                                      }
                                    />
                                  </label>
                                </div>

                                <label
                                  className={
                                    styles.formGroup
                                  }
                                >
                                  <span
                                    className={
                                      styles.label
                                    }
                                  >
                                    Описание
                                  </span>

                                  <textarea
                                    className={
                                      styles.textareaSmall
                                    }
                                    name="description"
                                    defaultValue={
                                      section.description ??
                                      ""
                                    }
                                  />
                                </label>

                                <label
                                  className={
                                    styles.structureCheckbox
                                  }
                                >
                                  <input
                                    name="isActive"
                                    type="checkbox"
                                    defaultChecked={
                                      section.isActive
                                    }
                                  />

                                  Активен
                                </label>

                                <button
                                  className={
                                    styles.secondaryAdminAction
                                  }
                                  type="submit"
                                >
                                  Сохранить подраздел
                                </button>
                              </form>

                              <form
                                action={
                                  deleteSubsectionAction
                                }
                              >
                                <input
                                  type="hidden"
                                  name="id"
                                  value={section.id}
                                />

                                <input
                                  type="hidden"
                                  name="kind"
                                  value={section.kind}
                                />

                                <input
                                  type="hidden"
                                  name="confirmation"
                                  value="DELETE_SUBSECTION"
                                />

                                <button
                                  className={
                                    styles.deleteButton
                                  }
                                  type="submit"
                                  disabled={
                                    section._count
                                      .materials > 0
                                  }
                                >
                                  Удалить подраздел
                                </button>
                              </form>
                            </article>
                          ))}

                          {category.subsectionKind !==
                            "NONE" &&
                          subsections.length === 0 ? (
                            <div
                              className={
                                styles.emptyEditorState
                              }
                            >
                              Подразделов пока нет.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  );
                })}

                {area.categories.length === 0 ? (
                  <div
                    className={
                      styles.emptyEditorState
                    }
                  >
                    В этом разделе пока нет категорий.
                  </div>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}