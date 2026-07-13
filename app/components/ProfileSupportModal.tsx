"use client";

import { useEffect, useState } from "react";

import styles from "../styles/ProfileSupportModal.module.css";

const supportContacts = [
  {
    label: "Email",
    value: "support@cardio-club.by",
    href: "mailto:support@cardio-club.by",
  },
  {
    label: "Telegram",
    value: "@cardio_club_support",
    href: "https://t.me/cardio_club_support",
  },
  {
    label: "Время ответа",
    value: "Обычно в течение 1–2 рабочих дней",
    href: "",
  },
];

export default function ProfileSupportModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleSupportClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest("a, button, [role='button']");

      if (!(trigger instanceof HTMLElement)) {
        return;
      }

      const text = trigger.textContent?.trim().toLowerCase() ?? "";

      if (!text.includes("поддержка")) {
        return;
      }

      event.preventDefault();
      setIsOpen(true);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleSupportClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleSupportClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={() => setIsOpen(false)}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Закрыть поддержку"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>

        <div className={styles.header}>
          <span className={styles.kicker}>Cardio Club</span>

          <h2 id="support-modal-title">Поддержка</h2>

          <p>
            Если возник вопрос по подписке, материалам или работе сайта, напишите
            нам удобным способом.
          </p>
        </div>

        <div className={styles.contacts}>
          {supportContacts.map((contact) => {
            if (contact.href) {
              return (
                <a
                  className={styles.contactCard}
                  href={contact.href}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                  key={contact.label}
                >
                  <span>{contact.label}</span>
                  <strong>{contact.value}</strong>
                </a>
              );
            }

            return (
              <div className={styles.contactCard} key={contact.label}>
                <span>{contact.label}</span>
                <strong>{contact.value}</strong>
              </div>
            );
          })}
        </div>

        <div className={styles.notice}>
          Контакты можно заменить в файле{" "}
          <code>app/components/ProfileSupportModal.tsx</code>.
        </div>
      </div>
    </div>
  );
}