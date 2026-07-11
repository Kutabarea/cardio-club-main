import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className={`${styles.adminLayout} admin-route-root`}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarHeader}>
          <Link href="/admin" className={styles.adminLogo}>
            Cardio Admin
          </Link>

          <p className={styles.adminUserEmail}>{user.email}</p>
        </div>

        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.navLink}>
            Панель
          </Link>

          <Link href="/admin/materials" className={styles.navLink}>
            Материалы
          </Link>

          <Link href="/admin/categories" className={styles.navLink}>
            Категории
          </Link>

          <Link href="/admin/users" className={styles.navLink}>
            Пользователи
          </Link>

          <Link href="/" className={styles.navLink}>
            На сайт
          </Link>
        </nav>
      </aside>

      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}