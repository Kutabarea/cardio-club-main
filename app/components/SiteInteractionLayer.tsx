"use client";

import type { ReactNode } from "react";
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

type SiteInteractionLayerProps = {
  children?: ReactNode;
};

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
}

function openInternalAnchor(path: string) {
  window.location.assign(path);
}

export default function SiteInteractionLayer({ children }: SiteInteractionLayerProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest("a, button, [role='button']");

      if (!(trigger instanceof HTMLElement)) {
        return;
      }

      const text = normalizeText(trigger.textContent);
      const href =
        trigger instanceof HTMLAnchorElement
          ? normalizeText(trigger.getAttribute("href"))
          : "";

      const isSupport =
        text === "поддержка" ||
        text.includes("поддержка") ||
        href.includes("support");

      if (isSupport) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        setIsSupportOpen(true);
        return;
      }

      const isTeam = text === "команда";
      const isCooperation = text === "сотрудничество" || text === "cooperation";
      const isFaq =
        text === "вопросы" ||
        text === "ответы на вопросы" ||
        text === "faq";

      if (isTeam || isCooperation || isFaq) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (isTeam) {
          openInternalAnchor("/cooperation#team");
          return;
        }

        if (isCooperation) {
          openInternalAnchor("/cooperation#cooperation-form");
          return;
        }

        openInternalAnchor("/cooperation#faq");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSupportOpen(false);
      }
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      {children}

      {isSupportOpen ? (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={() => setIsSupportOpen(false)}
        >
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
              onClick={() => setIsSupportOpen(false)}
            >
              ×
            </button>

            <div className={styles.header}>
              <span className={styles.kicker}>Cardio Club</span>

              <h2 id="support-modal-title">Поддержка</h2>

              <p>
                Если возник вопрос по подписке, материалам или работе сайта,
                напишите нам удобным способом.
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
          </div>
        </div>
      ) : null}
    </>
  );
}