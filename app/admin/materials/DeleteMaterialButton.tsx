"use client";

import { useState } from "react";

import { deleteMaterialAction } from "./actions";

import styles from "@/app/styles/Admin.module.css";

type DeleteMaterialButtonProps = {
  materialId: string;
  materialTitle: string;
  redirectPath: string;
};

export default function DeleteMaterialButton({
  materialId,
  materialTitle,
  redirectPath,
}: DeleteMaterialButtonProps) {
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
              <h3 className={styles.modalTitle}>Удалить материал?</h3>

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
              Материал «{materialTitle}» будет удалён.
            </p>

            <p className={styles.modalWarning}>
              Вместе с записью удалится загруженная картинка материала, если она была загружена через админку.
            </p>

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

              <form action={deleteMaterialAction}>
                <input type="hidden" name="id" value={materialId} />
                <input type="hidden" name="redirectPath" value={redirectPath} />
                <input
                  type="hidden"
                  name="confirmDelete"
                  value="DELETE_MATERIAL"
                />

                <button className={styles.modalDeleteButton} type="submit">
                  Да, удалить
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}