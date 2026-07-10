import { prisma } from "@/lib/prisma";

import {
  updateUserRoleAction,
  updateUserSubscriptionAction,
} from "./actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function formatDateInput(date?: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getMessage(error?: string, success?: string) {
  if (error === "user-id-required") {
    return {
      type: "error",
      text: "ID пользователя не найден.",
    };
  }

  if (error === "invalid-role") {
    return {
      type: "error",
      text: "Некорректная роль пользователя.",
    };
  }

  if (error === "invalid-plan") {
    return {
      type: "error",
      text: "Некорректный тариф подписки.",
    };
  }

  if (error === "invalid-status") {
    return {
      type: "error",
      text: "Некорректный статус подписки.",
    };
  }

  if (error === "self-admin-remove") {
    return {
      type: "error",
      text: "Нельзя снять ADMIN со своего текущего аккаунта.",
    };
  }

  if (success === "role-updated") {
    return {
      type: "success",
      text: "Роль пользователя обновлена.",
    };
  }

  if (success === "subscription-updated") {
    return {
      type: "success",
      text: "Подписка пользователя обновлена.",
    };
  }

  return null;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const message = getMessage(params?.error, params?.success);

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      subscriptions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Пользователи</h2>
        <p className={styles.pageDescription}>
          Здесь можно менять роли пользователей и управлять подписками.
        </p>
      </div>

      {message && (
        <div
          className={
            message.type === "error"
              ? styles.adminMessageError
              : styles.adminMessageSuccess
          }
        >
          {message.text}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Роль</th>
              <th>Подписка</th>
              <th>Дата окончания</th>
              <th>Создан</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const subscription = user.subscriptions[0];

              return (
                <tr key={user.id}>
                  <td>
                    <div className={styles.materialTitle}>
                      {user.name || "Без имени"}
                    </div>
                    <div className={styles.materialSlug}>{user.email}</div>
                    {user.profile?.city && (
                      <div className={styles.materialSlug}>
                        Город: {user.profile.city}
                      </div>
                    )}
                  </td>

                  <td>
                    <form action={updateUserRoleAction} className={styles.inlineForm}>
                      <input type="hidden" name="userId" value={user.id} />

                      <select name="role" defaultValue={user.role}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      <button className={styles.smallButton} type="submit">
                        Сохранить
                      </button>
                    </form>
                  </td>

                  <td>
                    <form
                      action={updateUserSubscriptionAction}
                      className={styles.inlineForm}
                    >
                      <input type="hidden" name="userId" value={user.id} />

                      <select name="plan" defaultValue={subscription?.plan ?? "FREE"}>
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM_MONTH">PREMIUM_MONTH</option>
                        <option value="PREMIUM_YEAR">PREMIUM_YEAR</option>
                      </select>

                      <select
                        name="status"
                        defaultValue={subscription?.status ?? "ACTIVE"}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CANCELED">CANCELED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>

                      <input
                        name="endsAt"
                        type="date"
                        defaultValue={formatDateInput(subscription?.endsAt)}
                      />

                      <button className={styles.smallButton} type="submit">
                        Сохранить
                      </button>
                    </form>
                  </td>

                  <td>
                    {subscription?.endsAt
                      ? subscription.endsAt.toLocaleDateString("ru-RU")
                      : "Без ограничения"}
                  </td>

                  <td>{user.createdAt.toLocaleDateString("ru-RU")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}