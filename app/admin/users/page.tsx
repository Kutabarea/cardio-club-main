import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  updateUserRoleAction,
  updateUserSubscriptionAction,
} from "./actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    role?: string;
    plan?: string;
    status?: string;
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

function getUserWhere(params: {
  q: string;
  role: string;
  plan: string;
  status: string;
}) {
  const where: Prisma.UserWhereInput = {};

  if (params.q) {
    where.OR = [
      {
        email: {
          contains: params.q,
        },
      },
      {
        name: {
          contains: params.q,
        },
      },
      {
        profile: {
          city: {
            contains: params.q,
          },
        },
      },
      {
        profile: {
          phone: {
            contains: params.q,
          },
        },
      },
    ];
  }

  if (params.role !== "all") {
    where.role = params.role;
  }

  if (params.plan !== "all" || params.status !== "all") {
    where.subscriptions = {
      some: {
        ...(params.plan !== "all" ? { plan: params.plan } : {}),
        ...(params.status !== "all" ? { status: params.status } : {}),
      },
    };
  }

  return where;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;

  const q = params?.q?.trim() ?? "";
  const role = params?.role ?? "all";
  const plan = params?.plan ?? "all";
  const status = params?.status ?? "all";

  const message = getMessage(params?.error, params?.success);

  const where = getUserWhere({
    q,
    role,
    plan,
    status,
  });

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
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
    }),
    prisma.user.count(),
  ]);

  const hasActiveFilters =
    Boolean(q) || role !== "all" || plan !== "all" || status !== "all";

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Пользователи</h2>
        <p className={styles.pageDescription}>
          Здесь можно искать пользователей, фильтровать их по роли и подписке, менять роли и управлять доступом.
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

      <section className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <div>
            <h3 className={styles.filterTitle}>Фильтры</h3>
            <p className={styles.filterDescription}>
              Показано: {users.length} из {totalUsers}
            </p>
          </div>

          {hasActiveFilters && (
            <a href="/admin/users" className={styles.resetLink}>
              Сбросить фильтры
            </a>
          )}
        </div>

        <form action="/admin/users" method="get" className={styles.usersFiltersForm}>
          <label className={styles.field}>
            <span>Поиск</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Email, имя, город или телефон"
            />
          </label>

          <label className={styles.field}>
            <span>Роль</span>
            <select name="role" defaultValue={role}>
              <option value="all">Все роли</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Тариф</span>
            <select name="plan" defaultValue={plan}>
              <option value="all">Все тарифы</option>
              <option value="FREE">FREE</option>
              <option value="PREMIUM_MONTH">PREMIUM_MONTH</option>
              <option value="PREMIUM_YEAR">PREMIUM_YEAR</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Статус подписки</span>
            <select name="status" defaultValue={status}>
              <option value="all">Все статусы</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CANCELED">CANCELED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </label>

          <div className={styles.filterActions}>
            <button className={styles.submitButton} type="submit">
              Применить
            </button>
          </div>
        </form>
      </section>

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
            {users.length > 0 ? (
              users.map((user) => {
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

                      {user.profile?.phone && (
                        <div className={styles.materialSlug}>
                          Телефон: {user.profile.phone}
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
              })
            ) : (
              <tr>
                <td colSpan={5}>Пользователи не найдены.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}