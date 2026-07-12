import Link from "next/link";

import type { MaterialAccessState } from "@/lib/materialAccess";
import { getPremiumAccessMessage } from "@/lib/materialAccess";

import styles from "../styles/PremiumAccessNotice.module.css";

type PremiumAccessNoticeProps = {
  access: MaterialAccessState;
};

export default function PremiumAccessNotice({ access }: PremiumAccessNoticeProps) {
  if (access.canRead) {
    return null;
  }

  return (
    <section className={styles.notice}>
      <div>
        <p className={styles.eyebrow}>Premium</p>

        <h2>Материал закрыт</h2>

        <p>{getPremiumAccessMessage(access)}</p>
      </div>

      <div className={styles.actions}>
        {!access.isAuthenticated ? (
          <Link href="/login">Войти</Link>
        ) : null}

        <Link href="/profile/subscription">Открыть подписку</Link>
      </div>
    </section>
  );
}