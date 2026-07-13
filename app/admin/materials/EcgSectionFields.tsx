import styles from "@/app/styles/Admin.module.css";

type EcgSectionOption = {
  id: string;
  title: string;
  description?: string | null;
};

type EcgSectionFieldsProps = {
  sections: EcgSectionOption[];
  currentSectionId?: string | null;
  currentSortOrder?: number | null;
};

export default function EcgSectionFields({
  sections,
  currentSectionId,
  currentSortOrder,
}: EcgSectionFieldsProps) {
  return (
    <section className={styles.editorSection}>
      <div className={styles.editorSectionHeader}>
        <div>
          <p className={styles.editorStep}>ЭКГ база</p>
          <h2>Подраздел ЭКГ базы</h2>
        </div>

        <p>
          Работает для материалов категории «ЭКГ база». Можно выбрать подраздел,
          создать новый и задать позицию материала в списке.
        </p>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.formGroup}>
          <span className={styles.label}>Существующий подраздел</span>

          <select
            className={styles.input}
            name="ecgSectionId"
            defaultValue={currentSectionId ?? ""}
          >
            <option value="">Без подраздела</option>

            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>

          <span className={styles.formHint}>
            Например: «База», «Зубцы», «Сегменты и интервалы».
          </span>
        </label>

        <label className={styles.formGroup}>
          <span className={styles.label}>Позиция в списке</span>

          <input
            className={styles.input}
            name="sortOrder"
            type="number"
            defaultValue={currentSortOrder ?? 100}
            min="0"
            step="1"
          />

          <span className={styles.formHint}>
            Меньше число — выше материал. Удобно ставить 10, 20, 30.
          </span>
        </label>

        <label className={styles.formGroup}>
          <span className={styles.label}>Создать новый подраздел</span>

          <input
            className={styles.input}
            name="newEcgSectionTitle"
            placeholder="Например: Нарушения проводимости"
          />

          <span className={styles.formHint}>
            Если заполнить это поле, новый подраздел будет создан и выбран для материала.
          </span>
        </label>
      </div>

      <label className={styles.formGroup}>
        <span className={styles.label}>Описание нового подраздела</span>

        <textarea
          className={styles.textareaSmall}
          name="newEcgSectionDescription"
          placeholder="Короткое описание подраздела. Необязательно."
        />
      </label>
    </section>
  );
}