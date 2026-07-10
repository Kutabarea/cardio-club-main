import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import styles from "../styles/Admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className={styles.admin}>
      <div className="container">
        <div className={styles.inner}>
          <aside className={styles.sidebar}>
            <h1 className={styles.sidebarTitle}>Админка</h1>

            <nav className={styles.nav}>
              <Link href="/admin/materials" className={styles.navLink}>
                Материалы
              </Link>

              <Link href="/admin/categories" className={styles.navLink}>
                Категории
              </Link>

              <Link href="/" className={styles.navLink}>
                На сайт
              </Link>
            </nav>
          </aside>

          <section className={styles.content}>{children}</section>
        </div>
      </div>
    </main>
  );
}