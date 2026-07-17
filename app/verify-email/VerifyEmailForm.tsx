"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "@/app/styles/AuthFlow.module.css";

type VerifyEmailFormProps = {
  email: string;
  isVerified: boolean;
};

type ApiResponse = {
  message?: string;
  verified?: boolean;
  errors?: Record<string, string[]>;
};

export default function VerifyEmailForm({
  email,
  isVerified,
}: VerifyEmailFormProps) {
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(
    isVerified ? "Email уже подтверждён." : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCodeVerified, setIsCodeVerified] = useState(isVerified);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const code = String(formData.get("code") ?? "").replace(/\D/g, "");

    setMessage(null);
    setErrorMessage(null);

    if (!/^\d{6}$/.test(code)) {
      setErrorMessage("Введите 6-значный код.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        const firstValidationError = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        setErrorMessage(firstValidationError ?? data.message ?? "Не удалось подтвердить email.");
        return;
      }

      form.reset();
      setMessage(data.message ?? "Email подтверждён.");
      setIsCodeVerified(Boolean(data.verified));
      router.refresh();
    } catch {
      setErrorMessage("Не удалось подключиться к серверу.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    setMessage(null);
    setErrorMessage(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setErrorMessage(data.message ?? "Не удалось отправить код повторно.");
        return;
      }

      setMessage(data.message ?? "Новый код отправлен.");
    } catch {
      setErrorMessage("Не удалось подключиться к серверу.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <h1 className={styles.authTitle}>
          {isCodeVerified ? "Email подтверждён" : "Подтверждение email"}
        </h1>

        <p className={styles.authText}>
          {isCodeVerified
            ? `Адрес ${email} подтверждён.`
            : `Мы отправили 6-значный код на ${email}. Введите его ниже.`}
        </p>

        {!isCodeVerified ? (
          <form className={styles.authForm} onSubmit={handleSubmit}>
            <label className={styles.authLabel}>
              Код подтверждения
              <input
                className={`${styles.authInput} ${styles.authCodeInput}`}
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                required
              />
            </label>

            {message ? <p className={styles.authMessage}>{message}</p> : null}
            {errorMessage ? <p className={styles.authError}>{errorMessage}</p> : null}

            <button className={styles.authButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Проверка..." : "Подтвердить"}
            </button>

            <button
              className={styles.authButtonSecondary}
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
            >
              {isResending ? "Отправка..." : "Отправить код ещё раз"}
            </button>
          </form>
        ) : (
          <>
            {message ? <p className={styles.authMessage}>{message}</p> : null}

            <div className={styles.authLinks}>
              <Link href="/profile/settings">Перейти в профиль</Link>
              <Link href="/">На главную</Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}