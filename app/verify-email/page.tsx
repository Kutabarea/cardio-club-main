import Link from "next/link";

import styles from "@/app/styles/AuthFlow.module.css";

export const dynamic = "force-dynamic";

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = resolvedSearchParams.status;

  const isSuccess = status === "success";

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <h1 className={styles.authTitle}>
          {isSuccess ? "Email подтверждён" : "Email не подтверждён"}
        </h1>

        <p className={styles.authText}>
          {isSuccess
            ? "Аккаунт подтверждён. Теперь можно пользоваться сайтом."
            : "Ссылка недействительна или устарела. Запросите новую ссылку подтверждения."}
        </p>

        <div className={styles.authLinks}>
          <Link href="/profile/settings">Перейти в профиль</Link>
          <Link href="/login">Войти</Link>
        </div>
      </section>
    </main>
  );
}