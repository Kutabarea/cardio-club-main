"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "./Button";
import styles from "../styles/ProfileAside.module.css";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      backgroundColor="#8A1A1A"
      hoverBackgroundColor="#711414"
      color="#FFFFFF"
      fontSize=".9375rem"
      padding=".9375rem 1rem"
      className={styles.profile__aside__logoutBtn}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Выход..." : "Выйти"}
    </Button>
  );
}
