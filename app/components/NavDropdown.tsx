"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import styles from "../styles/NavDropdown.module.css";
interface NavDropdownProps {
  className?: string;
}

export default function NavDropdown({ className }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={styles.dropdown}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={className ? className : styles.nav__link}
      >
        О нас
      </button>

      {open && (
        <div className={styles.dropdown__inner}>
          <Link href="/cooperation" className={styles.nav__link__item}>
            Команда
          </Link>
          <Link href="/cooperation" className={styles.nav__link__item}>
            Сотрудничество
          </Link>
          <Link href="/cooperation" className={styles.nav__link__item}>
            Вопросы
          </Link>
        </div>
      )}
    </div>
  );
}