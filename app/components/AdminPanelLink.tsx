"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import styles from "../styles/AdminPanelLink.module.css";

type CurrentUserResponse = {
  user?: {
    role?: string;
  } | null;
};

export default function AdminPanelLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as CurrentUserResponse;

        if (isMounted && data.user?.role === "ADMIN") {
          setIsAdmin(true);
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href="/admin" className={styles.adminLink}>
      Админка
    </Link>
  );
}