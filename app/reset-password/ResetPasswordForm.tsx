"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import styles from "@/app/styles/AuthFlow.module.css";

type ResetPasswordFormProps = {
  token: string;
};

type ApiResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const passwordRepeat = String(formData.get("passwordRepeat") ?? "");

    setMessage(null);
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Токен восстановления не найден.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Пароль должен быть минимум 8 символов.");
      return;
    }

    if (password !== passwordRepeat) {
      setErrorMessage("Пароли не совпадают.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        const firstValidationError = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        setErrorMessage(firstValidationError ?? data.message ?? "Ошибка сброса пароля.");
        return;
      }

      form.reset();
      setMessage(data.message ?? "Пароль обновлён.");
    } catch {
      setErrorMessage("Не удалось подключиться к серверу.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <h1 className={styles.authTitle}>Новый пароль</h1>

        <p className={styles.authText}>
          Введите новый пароль. После смены пароля старые сессии будут завершены.
        </p>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <label className={styles.authLabel}>
            Новый пароль
            <input
              className={styles.authInput}
              type="password"
              name="password"
              placeholder="Минимум 8 символов"
              required
            />
          </label>

          <label className={styles.authLabel}>
            Повторите пароль
            <input
              className={styles.authInput}
              type="password"
              name="passwordRepeat"
              placeholder="Повторите пароль"
              required
            />
          </label>

          {message ? <p className={styles.authMessage}>{message}</p> : null}
          {errorMessage ? <p className={styles.authError}>{errorMessage}</p> : null}

          <button className={styles.authButton} type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить пароль"}
          </button>
        </form>

        <div className={styles.authLinks}>
          <Link href="/login">Перейти ко входу</Link>
        </div>
      </section>
    </main>
  );
}