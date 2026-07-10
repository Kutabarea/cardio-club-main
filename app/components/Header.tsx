"use client";

import { KeyboardEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import NavDropdown from "./NavDropdown";
import LectionsDropdown from "./LectionsDropdown";

import logoImg from "../../public/images/logo-img.png";
import profileIcon from "../../public/images/profile-icon.png";

import styles from "../styles/Header.module.css";

export default function Header() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => {
    setIsOpen((current) => !current);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const submitSearch = () => {
    const query = searchQuery.trim();

    if (!query) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.header__inner}>
          <Link href="/" className={styles.nav__logo__link} prefetch={true}>
            <Image src={logoImg} className={styles.nav__logo__img} alt="Logo" />
          </Link>

          <button
            className={`${styles.burger} ${isOpen ? styles.burger_active : ""}`}
            type="button"
            onClick={toggleMenu}
            aria-label="Открыть меню"
          >
            <span></span>
          </button>

          <nav className={`${styles.nav} ${isOpen ? styles.nav_active : ""}`}>
            <div className={styles.nav__inner}>
              <Link
                href="/"
                className={`${styles.nav__link} ${styles.nav__link_first}`}
                onClick={closeMenu}
              >
                Новости
              </Link>

              <LectionsDropdown className={styles.nav__link} />

              <Link href="/library" className={styles.nav__link} onClick={closeMenu}>
                ЭКГ
              </Link>

              <Link href="/library" className={styles.nav__link} onClick={closeMenu}>
                Курсы
              </Link>

              <Link href="/library" className={styles.nav__link} onClick={closeMenu}>
                Литература
              </Link>

              <Link href="/library" className={styles.nav__link} onClick={closeMenu}>
                Помощник кардиолога
              </Link>

              <Link href="/search" className={styles.nav__link} onClick={closeMenu}>
                Поиск
              </Link>

              <NavDropdown className={styles.nav__link} />
            </div>
          </nav>

          <div className={styles.nav__input__block}>
            <input
              type="search"
              placeholder="Поиск"
              className={styles.nav__input}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Поиск по сайту"
            />

            <Link
              href="/profile/subscription"
              className={styles.nav__profile__link}
              prefetch={true}
            >
              <Image
                src={profileIcon}
                className={styles.nav__profile__img}
                alt="Profile"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}