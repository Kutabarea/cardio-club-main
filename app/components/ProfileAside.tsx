"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../styles/ProfileAside.module.css";

import SubHeaderText from "./SubHeaderText";
import Button from "./Button";
import LogoutButton from "./LogoutButton";

import settingsIcon from "../../public/images/settings__icon.png";
import discountIcon from "../../public/images/discount__icon.png";
import avatarIcon from "../../public/images/avatar__icon__white.png";
import chatIcon from "../../public/images/chat__icon.png";
import profileIcon from "../../public/images/profile-icon.png";

export default function ProfileAside() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/profile/settings", label: "Настройки", icon: settingsIcon },
    { href: "/profile/discount", label: "Мои скидки", icon: discountIcon },
    { href: "/profile/subscription", label: "Моя подписка", icon: avatarIcon },
    { href: "/", label: "Поддержка", icon: chatIcon },
  ];

  const primaryColor = "#4480EA";
  const secondaryColor = "#F4F7FF";

  return (
    <div className={styles.profile__aside}>
      <div className={styles.profile__aside__inner}>
        <div className={styles.profile__aside__profile__block}>
          <SubHeaderText className={styles.profile__aside__header}>
            Ваш профиль
          </SubHeaderText>

          <Image
            className={styles.profile__aside__avatar}
            src={profileIcon}
            alt="Avatar"
          />
        </div>

        <div className={styles.profile__aside__btns}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                className={styles.profile__aside__link}
                href={link.href}
              >
                <Button
                  backgroundColor={isActive ? primaryColor : secondaryColor}
                  color={isActive ? secondaryColor : primaryColor}
                  fontSize=".9375rem"
                  padding=".9375rem 1rem"
                  className={styles.profile__aside__btn}
                >
                  <Image
                    className={styles.profile__aside__icon}
                    src={link.icon}
                    alt=""
                    style={{
                      filter: isActive ? "brightness(0) invert(1)" : "none",
                    }}
                  />
                  {link.label}
                </Button>
              </Link>
            );
          })}

          <div className={styles.profile__aside__logout}>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
