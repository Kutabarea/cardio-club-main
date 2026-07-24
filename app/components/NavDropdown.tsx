"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";

import type { PublicNavigationLink } from "@/lib/publicNavigationRoutes";

import styles from "../styles/NavDropdown.module.css";

type NavDropdownProps = {
  label?: string;
  items?: readonly PublicNavigationLink[];
  wide?: boolean;
  className?: string;
  onNavigate?: () => void;
};

const aboutLinks = [
  {
    key: "about:team",
    title: "Команда",
    href: "/cooperation",
  },
  {
    key: "about:cooperation",
    title: "Сотрудничество",
    href: "/cooperation",
  },
  {
    key: "about:questions",
    title: "Вопросы",
    href: "/cooperation",
  },
] as const satisfies readonly PublicNavigationLink[];

export default function NavDropdown({
  label = "О нас",
  items = aboutLinks,
  wide = false,
  className,
  onNavigate,
}: NavDropdownProps) {
  const [open, setOpen] =
    useState(false);

  const ref =
    useRef<HTMLDivElement>(null);

  const menuId = useId();

  useEffect(() => {
    const closeOutside = (
      event: PointerEvent,
    ) => {
      if (
        ref.current &&
        !ref.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      closeOutside,
    );

    document.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, []);

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div
      ref={ref}
      className={styles.dropdown}
    >
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className={
          className ||
          styles.nav__link
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={
          open ? menuId : undefined
        }
      >
        {label}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`${
            styles.dropdown__inner
          } ${
            wide
              ? styles.dropdown__inner_wide
              : ""
          }`}
        >
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              role="menuitem"
              className={
                styles.nav__link__item
              }
              onClick={handleNavigate}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}