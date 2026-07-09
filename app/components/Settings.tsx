"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "../styles/Settings.module.css";
import HeaderText from "./HeaderText";
import DescriptionText from "./DescriptionText";
import Input from "./Input";
import Textarea from "./Textarea";
import Button from "./Button";

type Profile = {
  phone: string | null;
  city: string | null;
  bio: string | null;
};

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  profile: Profile | null;
};

type ProfileResponse = {
  user: User;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");

        if (!response.ok) {
          setMessage("Не удалось загрузить профиль");
          return;
        }

        const data = (await response.json()) as ProfileResponse;
        setUser(data.user);
      } catch {
        setMessage("Не удалось подключиться к серверу");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || undefined,
          phone,
          city,
          bio,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;

        const firstValidationError = errorData.errors
          ? Object.values(errorData.errors).flat()[0]
          : null;

        setMessage(firstValidationError ?? errorData.message ?? "Ошибка сохранения");
        return;
      }

      const data = (await response.json()) as ProfileResponse;
      setUser(data.user);
      setMessage("Профиль сохранён");
    } catch {
      setMessage("Не удалось подключиться к серверу");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.settings}>
        <HeaderText color="#000" className={styles.settings__header}>
          Настройки
        </HeaderText>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.settings}>
        <HeaderText color="#000" className={styles.settings__header}>
          Настройки
        </HeaderText>
        <p>{message ?? "Профиль не найден"}</p>
      </div>
    );
  }

  return (
    <div className={styles.settings}>
      <HeaderText color="#000" className={styles.settings__header}>
        Настройки
      </HeaderText>

      <form onSubmit={handleSubmit}>
        <div className={styles.settings__input__wrapper}>
          <DescriptionText className={styles.settings__label}>Имя</DescriptionText>
          <Input
            name="name"
            value={user.name ?? ""}
            placeholder="Введите имя"
            className={styles.settings__input}
          />
        </div>

        <div className={styles.settings__input__wrapper}>
          <DescriptionText className={styles.settings__label}>Город</DescriptionText>
          <Input
            name="city"
            value={user.profile?.city ?? ""}
            placeholder="Введите город"
            className={styles.settings__input}
          />
        </div>

        <div className={styles.settings__input__wrapper}>
          <DescriptionText className={styles.settings__label}>Телефон</DescriptionText>
          <Input
            name="phone"
            value={user.profile?.phone ?? ""}
            placeholder="Введите телефон"
            className={styles.settings__input}
          />
        </div>

        <div className={styles.settings__input__wrapper}>
          <DescriptionText className={styles.settings__label}>E-mail</DescriptionText>
          <Input
            value={user.email}
            disabled
            className={styles.settings__input}
          />
        </div>

        <div className={styles.settings__input__wrapper}>
          <DescriptionText className={styles.settings__label}>О себе</DescriptionText>
          <Textarea
            name="bio"
            value={user.profile?.bio ?? ""}
            placeholder="Короткое описание"
            className={styles.settings__input}
          />
        </div>

        {message && <p>{message}</p>}

        <Button type="submit" fontSize=".9375rem" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}