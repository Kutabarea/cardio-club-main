"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import styles from "../styles/LectionsDropdown.module.css";

interface LectionsDropdownProps {
  className?: string;
}

export default function LectionsDropdown({ className }: LectionsDropdownProps) {
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
        Видеолекции
      </button>

      {open && (
        <div className={styles.dropdown__inner}>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Фармакология
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Пульмонология и ТЭЛА
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            ЭКГ и аритмии
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Нефрология
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            ОКС и инфаркт миокарда{" "}
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Гематология
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Сердечная недостаточность и РААС
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Эндокринные причины артериальной гипертензии
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Липиды и атеросклероз
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Физиология и пропедевтика
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Воспалительные болезни сердца и ревматология
          </Link>
          <Link href="/videolecture" className={styles.nav__link__item}>
            Доказательная медицина, обучение и карьера
          </Link>
        </div>
      )}
    </div>
  );
}