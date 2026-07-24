"use client";

import {
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import NavDropdown from "./NavDropdown";

import type { PublicNavigationItem } from "@/lib/publicNavigationRoutes";

import logoImg from "../../public/images/logo-img.png";
import profileIcon from "../../public/images/profile-icon.png";

import styles from "../styles/Header.module.css";

type HeaderClientProps = {
  navigation: readonly PublicNavigationItem[];
};

export default function HeaderClient({
  navigation,
}: HeaderClientProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  useEffect(() => {
    const closeOnEscape = (
      event: globalThis.KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const submitSearch = () => {
    const query = searchQuery.trim();

    closeMenu();

    if (!query) {
      router.push("/search");
      return;
    }

    router.push(
      `/search?q=${encodeURIComponent(query)}`,
    );
  };

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div
          className={styles.header__inner}
        >
          <Link
            href="/"
            className={
              styles.nav__logo__link
            }
            prefetch
            onClick={closeMenu}
          >
            <Image
              src={logoImg}
              className={
                styles.nav__logo__img
              }
              alt="Cardio Club"
            />
          </Link>

          <button
            className={`${styles.burger} ${
              isOpen
                ? styles.burger_active
                : ""
            }`}
            type="button"
            onClick={() =>
              setIsOpen(
                (current) => !current,
              )
            }
            aria-label={
              isOpen
                ? "Закрыть меню"
                : "Открыть меню"
            }
            aria-expanded={isOpen}
            aria-controls="public-navigation"
          >
            <span />
          </button>

          <nav
            id="public-navigation"
            aria-label="Основная навигация"
            className={`${styles.nav} ${
              isOpen
                ? styles.nav_active
                : ""
            }`}
          >
            <div
              className={styles.nav__inner}
            >
              {navigation.map(
                (item, index) => {
                  const className = `${
                    styles.nav__link
                  } ${
                    index === 0
                      ? styles.nav__link_first
                      : ""
                  }`;

                  if (
                    item.children.length > 0
                  ) {
                    return (
                      <NavDropdown
                        key={item.key}
                        label={item.title}
                        items={item.children}
                        wide={
                          item.children.length > 4
                        }
                        className={className}
                        onNavigate={closeMenu}
                      />
                    );
                  }

                  if (!item.href) {
                    return null;
                  }

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={className}
                      onClick={closeMenu}
                    >
                      {item.title}
                    </Link>
                  );
                },
              )}

              <Link
                href="/search"
                className={`${
                  styles.nav__link
                } ${
                  navigation.length === 0
                    ? styles.nav__link_first
                    : ""
                }`}
                onClick={closeMenu}
              >
                Поиск
              </Link>

              <NavDropdown
                className={
                  styles.nav__link
                }
                onNavigate={closeMenu}
              />
            </div>
          </nav>

          <div
            className={
              styles.nav__input__block
            }
          >
            <input
              type="search"
              placeholder="Поиск"
              className={
                styles.nav__input
              }
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value,
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              aria-label="Поиск по сайту"
            />

            <Link
              href="/profile/subscription"
              className={
                styles.nav__profile__link
              }
              prefetch
              onClick={closeMenu}
              aria-label="Профиль"
            >
              <Image
                src={profileIcon}
                className={
                  styles.nav__profile__img
                }
                alt=""
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}