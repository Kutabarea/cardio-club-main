"use client";

import { useState } from "react";

import { deleteCategoryAction } from "./actions";

import styles from "@/app/styles/Admin.module.css";

type DeleteCategoryButtonProps = {
  categoryId: string;
  categoryTitle: string;
  materialsCount: number;
};

export default function DeleteCategoryButton({
  categoryId,
  categoryTitle,
  materialsCount,
}: DeleteCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Удалить
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Удалить категорию?</h3>

              <button
                className={styles.modalCloseButton}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть окно"
              >
                ×
              </button>
            </div>

            <p className={styles.modalText}>
              Категория «{categoryTitle}» будет удалена.
            </p>

            {materialsCount > 0 ? (
              <p className={styles.modalWarning}>
                Вместе с ней удалятся все материалы внутри категории:{" "}
                <strong>{materialsCount}</strong>.
              </p>
            ) : (
              <p className={styles.modalText}>
                В этой категории нет материалов.
              </p>
            )}

            <p className={styles.modalText}>
              Это действие нельзя отменить.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Отмена
              </button>

              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={categoryId} />
                <input
                  type="hidden"
                  name="confirmDelete"
                  value="DELETE_CATEGORY_WITH_MATERIALS"
                />

                <button className={styles.modalDeleteButton} type="submit">
                  Да, удалить всё
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}