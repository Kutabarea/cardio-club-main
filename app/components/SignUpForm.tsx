"use client";

import googleLogo from "../../public/images/google__logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "./Button";
import styles from "../styles/SignUpForm.module.css";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function SignUpForm() {
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const agree = formData.get("agree") === "on";

    if (!email) {
      setMessage("Введите e-mail");
      return;
    }

    if (password.length < 8) {
      setMessage("Пароль должен быть не короче 8 символов");
      return;
    }

    if (!agree) {
      setMessage("Нужно согласиться с политикой обработки данных");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
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

        setMessage(firstValidationError ?? errorData.message ?? "Ошибка регистрации");
        return;
      }

      setMessage("Вы успешно зарегистрированы");
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
      <h1 className={styles.title}>Регистрация</h1>

      <div className={styles.switchers}>
        <Button
          type="button"
          fontSize="0.9375rem"
          padding="0.5rem 3.125rem"
          borderRadius="1.25rem"
        >
          по почте
        </Button>

        <button type="button" className={styles.switcher__google}>
          <Image src={googleLogo} alt="" className={styles.google__logo} />
          <span>через Google</span>
        </button>
      </div>

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

        <label className={styles.checkboxLabel}>
          <input type="checkbox" name="agree" className={styles.checkbox} />
          <span>Я согласен с политикой обработки данных</span>
        </label>

        <a href="/login" className={styles.loginLink}>
          У меня уже есть аккаунт
        </a>

        {message && <p className={styles.error}>{message}</p>}

        <Button
          type="submit"
          fontSize="0.9375rem"
          padding="1rem 5rem"
          borderRadius="0.625rem"
          disabled={isLoading}
        >
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </div>
  );
}