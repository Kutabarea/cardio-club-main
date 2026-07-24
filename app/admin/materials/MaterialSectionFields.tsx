"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import styles from "@/app/styles/Admin.module.css";

type CategoryOption = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  subsectionKind: string;
  sortOrder: number;
  isActive: boolean;
};

type ContentAreaOption = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  materialType: string;
  sortOrder: number;
  isActive: boolean;
  categories: CategoryOption[];
};

type SectionOption = {
  id: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  isActive: boolean;
};

type MaterialSectionFieldsProps = {
  contentAreas: ContentAreaOption[];
  ecgSections: SectionOption[];
  videoLectureSections: SectionOption[];

  initialCategoryId?: string | null;
  initialType: string;

  currentEcgSectionId?: string | null;
  currentVideoLectureSectionId?: string | null;
  currentSortOrder?: number | null;
};

export default function MaterialSectionFields({
  contentAreas,
  ecgSections,
  videoLectureSections,
  initialCategoryId,
  initialType,
  currentEcgSectionId,
  currentVideoLectureSectionId,
  currentSortOrder,
}: MaterialSectionFieldsProps) {
  const initialArea =
    contentAreas.find((area) =>
      area.categories.some(
        (category) => category.id === initialCategoryId,
      ),
    ) ?? null;

  const initialCategory =
    initialArea?.categories.find(
      (category) => category.id === initialCategoryId,
    ) ?? null;

  const [contentAreaId, setContentAreaId] = useState(
    initialArea?.id ?? "",
  );

  const [categoryId, setCategoryId] = useState(
    initialCategory?.id ?? "",
  );

  const [materialType, setMaterialType] = useState(
    initialArea?.materialType ?? initialType,
  );

  const [ecgSectionId, setEcgSectionId] = useState(
    currentEcgSectionId ?? "",
  );

  const [
    videoLectureSectionId,
    setVideoLectureSectionId,
  ] = useState(
    currentVideoLectureSectionId ?? "",
  );

  const selectedArea = useMemo(() => {
    return (
      contentAreas.find(
        (area) => area.id === contentAreaId,
      ) ?? null
    );
  }, [contentAreas, contentAreaId]);

  const availableCategories = useMemo(() => {
    if (!selectedArea) {
      return [];
    }

    return selectedArea.categories.filter(
      (category) =>
        category.isActive ||
        category.id === initialCategoryId,
    );
  }, [initialCategoryId, selectedArea]);

  const selectedCategory = useMemo(() => {
    return (
      availableCategories.find(
        (category) => category.id === categoryId,
      ) ?? null
    );
  }, [availableCategories, categoryId]);

  const availableEcgSections = useMemo(() => {
    return ecgSections.filter(
      (section) =>
        section.categoryId === categoryId &&
        (
          section.isActive ||
          section.id === currentEcgSectionId
        ),
    );
  }, [
    categoryId,
    currentEcgSectionId,
    ecgSections,
  ]);

  const availableVideoSections = useMemo(() => {
    return videoLectureSections.filter(
      (section) =>
        section.categoryId === categoryId &&
        (
          section.isActive ||
          section.id ===
            currentVideoLectureSectionId
        ),
    );
  }, [
    categoryId,
    currentVideoLectureSectionId,
    videoLectureSections,
  ]);

  function handleAreaChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const nextAreaId = event.target.value;

    const nextArea =
      contentAreas.find(
        (area) => area.id === nextAreaId,
      ) ?? null;

    const activeCategories =
      nextArea?.categories.filter(
        (category) => category.isActive,
      ) ?? [];

    const nextCategory =
      activeCategories.length === 1
        ? activeCategories[0]
        : null;

    setContentAreaId(nextAreaId);
    setMaterialType(
      nextArea?.materialType ?? initialType,
    );
    setCategoryId(nextCategory?.id ?? "");
    setEcgSectionId("");
    setVideoLectureSectionId("");
  }

  function handleCategoryChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setCategoryId(event.target.value);
    setEcgSectionId("");
    setVideoLectureSectionId("");
  }

  const selectedEcgSection =
    availableEcgSections.find(
      (section) => section.id === ecgSectionId,
    ) ?? null;

  const selectedVideoSection =
    availableVideoSections.find(
      (section) =>
        section.id === videoLectureSectionId,
    ) ?? null;

  const breadcrumb = [
    selectedArea?.title,
    selectedCategory?.title,
    selectedCategory?.subsectionKind === "ECG"
      ? selectedEcgSection?.title
      : null,
    selectedCategory?.subsectionKind ===
    "VIDEO_LECTURE"
      ? selectedVideoSection?.title
      : null,
    selectedCategory ? "название материала" : null,
  ].filter(Boolean);

  return (
    <section className={styles.editorSection}>
      <div className={styles.editorSectionHeader}>
        <div>
          <p className={styles.editorStep}>
            Размещение
          </p>

          <h2>
            Раздел, категория и подраздел
          </h2>
        </div>

        <p>
          Список полностью формируется из структуры,
          настроенной администратором.
        </p>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.formGroup}>
          <span className={styles.label}>
            Раздел сайта
          </span>

          <select
            className={styles.input}
            value={contentAreaId}
            onChange={handleAreaChange}
            required
          >
            <option value="">
              Выбери раздел
            </option>

            {contentAreas
              .filter(
                (area) =>
                  area.isActive ||
                  area.id === initialArea?.id,
              )
              .map((area) => (
                <option
                  key={area.id}
                  value={area.id}
                >
                  {area.title}
                </option>
              ))}
          </select>
        </label>

        <label className={styles.formGroup}>
          <span className={styles.label}>
            Категория
          </span>

          <select
            className={styles.input}
            name="categoryId"
            value={categoryId}
            onChange={handleCategoryChange}
            disabled={!selectedArea}
            required
          >
            <option value="">
              Выбери категорию
            </option>

            {availableCategories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        type="hidden"
        name="type"
        value={materialType}
      />

      {selectedCategory?.subsectionKind === "ECG" ? (
        <label className={styles.formGroup}>
          <span className={styles.label}>
            Подраздел
          </span>

          <select
            className={styles.input}
            name="ecgSectionId"
            value={ecgSectionId}
            onChange={(event) => {
              setEcgSectionId(event.target.value);
            }}
          >
            <option value="">
              Без подраздела
            </option>

            {availableEcgSections.map((section) => (
              <option
                key={section.id}
                value={section.id}
              >
                {section.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {selectedCategory?.subsectionKind ===
      "VIDEO_LECTURE" ? (
        <label className={styles.formGroup}>
          <span className={styles.label}>
            Тематический подраздел
          </span>

          <select
            className={styles.input}
            name="videoLectureSectionId"
            value={videoLectureSectionId}
            onChange={(event) => {
              setVideoLectureSectionId(
                event.target.value,
              );
            }}
          >
            <option value="">
              Без подраздела
            </option>

            {availableVideoSections.map((section) => (
              <option
                key={section.id}
                value={section.id}
              >
                {section.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {selectedCategory &&
      selectedCategory.subsectionKind === "NONE" ? (
        <div className={styles.emptyEditorState}>
          Для категории «{selectedCategory.title}»
          дополнительный подраздел не используется.
        </div>
      ) : null}

      {breadcrumb.length > 0 ? (
        <div className={styles.simpleEditMeta}>
          <div>
            <span>
              Итоговое размещение
            </span>

            <strong>
              {breadcrumb.join(" → ")}
            </strong>
          </div>
        </div>
      ) : null}

      <label className={styles.formGroup}>
        <span className={styles.label}>
          Позиция материала
        </span>

        <input
          className={styles.input}
          name="sortOrder"
          type="number"
          defaultValue={currentSortOrder ?? 100}
          min="0"
          step="1"
        />

        <span className={styles.formHint}>
          Чем меньше число, тем выше материал.
          Используй 10, 20, 30 и так далее.
        </span>
      </label>
    </section>
  );
}