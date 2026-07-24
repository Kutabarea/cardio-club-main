"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/app/styles/Admin.module.css";

type AdminShellProps = {
  children: ReactNode;
  userEmail: string;
};

type AdminNavigationItem = {
  href: string;
  label: string;
  description: string;
  exact?: boolean;
  excludePrefixes?: string[];
};

type AdminNavigationGroup = {
  title: string;
  items: AdminNavigationItem[];
};

const navigationGroups: AdminNavigationGroup[] = [
  {
    title: "Общее",
    items: [
      {
        href: "/admin",
        label: "Панель управления",
        description: "Статистика и быстрые действия",
        exact: true,
      },
    ],
  },
  {
    title: "Контент",
    items: [
      {
        href: "/admin/materials",
        label: "Материалы",
        description: "Статьи, лекции и курсы",
        excludePrefixes: [
          "/admin/materials/audit",
        ],
      },
      {
        href: "/admin/content-structure",
        label: "Структура контента",
        description: "Разделы, категории и подразделы",
      },
    ],
  },
  {
    title: "Управление",
    items: [
      {
        href: "/admin/users",
        label: "Пользователи",
        description: "Роли и подписки",
      },
      {
        href: "/admin/materials/audit",
        label: "Аудит материалов",
        description: "Проверка данных и публикаций",
      },
    ],
  },
];

function isNavigationItemActive(
  pathname: string,
  item: AdminNavigationItem,
) {
  if (item.exact) {
    return pathname === item.href;
  }

  if (
    item.excludePrefixes?.some(
      (prefix) =>
        pathname === prefix ||
        pathname.startsWith(`${prefix}/`),
    )
  ) {
    return false;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

export default function AdminShell({
  children,
  userEmail,
}: AdminShellProps) {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div
      className={`${styles.adminShell} admin-route-root`}
    >
      <header className={styles.adminMobileHeader}>
        <Link
          href="/admin"
          className={styles.adminMobileBrand}
        >
          Cardio Admin
        </Link>

        <button
          type="button"
          className={styles.adminMenuButton}
          onClick={() => setIsMenuOpen(true)}
          aria-expanded={isMenuOpen}
          aria-controls="admin-navigation"
        >
          Меню
        </button>
      </header>

      {isMenuOpen ? (
        <button
          type="button"
          className={styles.adminSidebarOverlay}
          onClick={closeMenu}
          aria-label="Закрыть меню администратора"
        />
      ) : null}

      <aside
        id="admin-navigation"
        className={`${styles.adminShellSidebar} ${
          isMenuOpen
            ? styles.adminShellSidebarOpen
            : ""
        }`}
      >
        <div className={styles.adminShellBrandRow}>
          <Link
            href="/admin"
            className={styles.adminShellBrand}
            onClick={closeMenu}
          >
            <span
              className={
                styles.adminShellBrandMark
              }
            >
              CC
            </span>

            <span>
              <strong>Cardio Admin</strong>
              <small>Панель управления</small>
            </span>
          </Link>

          <button
            type="button"
            className={styles.adminMenuClose}
            onClick={closeMenu}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>

        <div className={styles.adminShellIdentity}>
          <span>Текущий администратор</span>
          <strong title={userEmail}>
            {userEmail}
          </strong>
        </div>

        <nav
          className={styles.adminShellNavigation}
          aria-label="Навигация администратора"
        >
          {navigationGroups.map((group) => (
            <div
              className={
                styles.adminShellNavigationGroup
              }
              key={group.title}
            >
              <p
                className={
                  styles.adminShellNavigationTitle
                }
              >
                {group.title}
              </p>

              <div
                className={
                  styles.adminShellNavigationList
                }
              >
                {group.items.map((item) => {
                  const isActive =
                    isNavigationItemActive(
                      pathname,
                      item,
                    );

                  return (
                    <Link
                      href={item.href}
                      key={item.href}
                      className={`${
                        styles.adminShellNavigationLink
                      } ${
                        isActive
                          ? styles.adminShellNavigationLinkActive
                          : ""
                      }`}
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                      onClick={closeMenu}
                    >
                      <strong>
                        {item.label}
                      </strong>

                      <span>
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.adminShellActions}>
          <Link
            href="/admin/materials/new"
            className={
              styles.adminShellPrimaryAction
            }
            onClick={closeMenu}
          >
            Добавить материал
          </Link>

          <Link
            href="/"
            className={
              styles.adminShellSecondaryAction
            }
            onClick={closeMenu}
          >
            Открыть сайт
          </Link>
        </div>
      </aside>

      <main className={styles.adminShellMain}>
        <div
          className={
            styles.adminShellMainInner
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}