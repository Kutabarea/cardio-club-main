"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavDropdown from "./NavDropdown";
import LectionsDropdown from "./LectionsDropdown";

import logoImg from "../../public/images/logo-img.png";
import profileIcon from "../../public/images/profile-icon.png";

import styles from "../styles/Header.module.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.header__inner}>
          <Link href="/" className={styles.nav__logo__link} prefetch={true}>
            <Image src={logoImg} className={styles.nav__logo__img} alt="Logo" />
          </Link>

          <div 
            className={`${styles.burger} ${isOpen ? styles.burger_active : ""}`} 
            onClick={toggleMenu}
          >
            <span></span>
          </div>

          <nav className={`${styles.nav} ${isOpen ? styles.nav_active : ""}`}>
            <div className={styles.nav__inner}>
              <div className={`${styles.nav__link} ${styles.nav__link_first}`}>Новости</div>
              <LectionsDropdown className={styles.nav__link} />
              <Link href="/library" className={styles.nav__link}>ЭКГ</Link>
              <div className={styles.nav__link}>Курсы</div>
              <div className={styles.nav__link}>Литература</div>
              <div className={styles.nav__link}>Помощник кардиолога</div>
              <NavDropdown className={styles.nav__link} />
            </div>
          </nav>

          <div className={styles.nav__input__block}>
            <input type="text" placeholder="Поиск" className={styles.nav__input} />
            <Link href="/profile/subscription" className={styles.nav__profile__link} prefetch={true}>
              <Image src={profileIcon} className={styles.nav__profile__img} alt="Profile" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}