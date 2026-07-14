"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import styles from "@/app/styles/AuthFlow.module.css";

type ApiResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    setMessage(null);
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Введите email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        const firstValidationError = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        setErrorMessage(firstValidationError ?? data.message ?? "Ошибка восстановления.");
        return;
      }

      form.reset();
      setMessage(data.message ?? "Если email есть в системе, ссылка восстановления будет отправлена.");
    } catch {
      setErrorMessage("Не удалось подключиться к серверу.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <h1 className={styles.authTitle}>Восстановление пароля</h1>

        <p className={styles.authText}>
          Введите email. Если аккаунт существует, ссылка восстановления появится в dev-консоли сервера.
        </p>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <label className={styles.authLabel}>
            Email
            <input
              className={styles.authInput}
              type="email"
              name="email"
              placeholder="Введите email"
              required
            />
          </label>

          {message ? <p className={styles.authMessage}>{message}</p> : null}
          {errorMessage ? <p className={styles.authError}>{errorMessage}</p> : null}

          <button className={styles.authButton} type="submit" disabled={isLoading}>
            {isLoading ? "Отправка..." : "Отправить ссылку"}
          </button>
        </form>

        <div className={styles.authLinks}>
          <Link href="/login">Вернуться ко входу</Link>
        </div>
      </section>
    </main>
  );
}