"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "./Button";
import styles from "../styles/ProfileAside.module.css";

type CurrentUserResponse = {
  user: {
    role: string;
  } | null;
};

export default function AdminPanelLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as CurrentUserResponse;

        setIsAdmin(data.user?.role === "ADMIN");
      } catch {
        setIsAdmin(false);
      }
    }

    loadUser();
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href="/admin/materials" className={styles.profile__aside__link}>
      <Button
        backgroundColor="#111827"
        hoverBackgroundColor="#000000"
        color="#FFFFFF"
        fontSize=".9375rem"
        padding=".9375rem 1rem"
        className={styles.profile__aside__btn}
      >
        Админка
      </Button>
    </Link>
  );
}