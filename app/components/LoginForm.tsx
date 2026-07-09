"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "./Button";
import styles from "../styles/SignUpForm.module.css";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function LoginForm() {
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email) {
      setMessage("Введите e-mail");
      return;
    }

    if (!password) {
      setMessage("Введите пароль");
      return;
    }

    setIsLoading(true);
    setMessage(null);

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

        setMessage(firstValidationError ?? errorData.message ?? "Ошибка входа");
        return;
      }

      form.reset();

      router.push("/profile/settings");
      router.refresh();
    } catch {
      setMessage("Не удалось подключиться к серверу");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Вход</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label className={styles.label}>Ваш e-mail</label>
          <input
            type="email"
            name="email"
            required
            placeholder="Введите ваш e-mail"
            className={styles.input}
          />
        </div>

        <div>
          <label className={styles.label}>Ваш пароль</label>
          <input
            type="password"
            name="password"
            required
            placeholder="Введите ваш пароль"
            className={styles.input}
          />
        </div>

        <Link href="/" className={styles.loginLink}>
        У меня ещё нет аккаунта
        </Link>
        
        {message && <p className={styles.error}>{message}</p>}

        <Button
          type="submit"
          fontSize="0.9375rem"
          padding="1rem 5rem"
          borderRadius="0.625rem"
          disabled={isLoading}
        >
          {isLoading ? "Вход..." : "Войти"}
        </Button>
      </form>
    </div>
  );
}