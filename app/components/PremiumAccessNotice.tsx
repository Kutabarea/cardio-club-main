"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import type { MaterialAccessState } from "@/lib/materialAccess";

import styles from "../styles/PremiumAccessNotice.module.css";

type PremiumAccessNoticeProps = {
  access: MaterialAccessState;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

function getPremiumAccessMessage(access: MaterialAccessState) {
  if (access.reason === "LOGIN_REQUIRED") {
    return "Войдите в аккаунт, чтобы продолжить.";
  }

  if (access.reason === "PREMIUM_REQUIRED") {
    return "Материал доступен только по Premium-подписке.";
  }

  return "Материал закрыт.";
}

export default function PremiumAccessNotice({ access }: PremiumAccessNoticeProps) {
  const router = useRouter();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    if (!isLoginModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || isLoginLoading) {
        return;
      }

      setIsLoginModalOpen(false);
      setLoginMessage(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLoginModalOpen, isLoginLoading]);

  if (access.canRead) {
    return null;
  }

  function openLoginModal() {
    setLoginMessage(null);
    setIsLoginModalOpen(true);
  }

  function closeLoginModal() {
    if (isLoginLoading) return;

    setIsLoginModalOpen(false);
    setLoginMessage(null);
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email) {
      setLoginMessage("Введите e-mail");
      return;
    }

    if (!password) {
      setLoginMessage("Введите пароль");
      return;
    }

    setIsLoginLoading(true);
    setLoginMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;

        const firstValidationError = errorData.errors
          ? Object.values(errorData.errors).flat()[0]
          : null;

        setLoginMessage(firstValidationError ?? errorData.message ?? "Ошибка входа");
        return;
      }

      form.reset();
      setIsLoginModalOpen(false);
      setLoginMessage(null);

      router.refresh();
    } catch {
      setLoginMessage("Не удалось подключиться к серверу");
    } finally {
      setIsLoginLoading(false);
    }
  }

  return (
    <>
      <section className={styles.notice}>
        <div>
          <p className={styles.eyebrow}>Premium</p>

          <h2>Материал закрыт</h2>

          <p>{getPremiumAccessMessage(access)}</p>
        </div>

        <div className={styles.actions}>
          {!access.isAuthenticated ? (
            <button
              type="button"
              className={styles.actionButton}
              onClick={openLoginModal}
            >
              Войти
            </button>
          ) : null}

          <Link href="/profile/subscription" className={styles.actionButton}>
            Открыть подписку
          </Link>
        </div>
      </section>

      {isLoginModalOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={closeLoginModal}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-login-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeLoginModal}
              aria-label="Закрыть окно входа"
              disabled={isLoginLoading}
            >
              ×
            </button>

            <h2 id="premium-login-modal-title" className={styles.modalTitle}>
              Вход
            </h2>

            <form onSubmit={handleLoginSubmit} className={styles.modalForm}>
              <div>
                <label className={styles.modalLabel}>Ваш e-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Введите ваш e-mail"
                  className={styles.modalInput}
                  autoFocus
                />
              </div>

              <div>
                <label className={styles.modalLabel}>Ваш пароль</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Введите ваш пароль"
                  className={styles.modalInput}
                />
              </div>

              {loginMessage ? <p className={styles.modalError}>{loginMessage}</p> : null}

              <button
                type="submit"
                className={styles.modalSubmit}
                disabled={isLoginLoading}
              >
                {isLoginLoading ? "Вход..." : "Войти"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}