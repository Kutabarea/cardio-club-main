import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU");
}

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    adminUsers,
    totalCategories,
    totalMaterials,
    publishedMaterials,
    draftMaterials,
    premiumMaterials,
    videoLectures,
    activePremiumSubscriptions,
    recentMaterials,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),
    prisma.category.count(),
    prisma.material.count(),
    prisma.material.count({
      where: {
        isPublished: true,
      },
    }),
    prisma.material.count({
      where: {
        isPublished: false,
      },
    }),
    prisma.material.count({
      where: {
        isPremium: true,
      },
    }),
    prisma.material.count({
      where: {
        type: "VIDEO_LECTURE",
      },
    }),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        plan: {
          not: "FREE",
        },
      },
    }),
    prisma.material.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),
    prisma.user.findMany({
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
      take: 6,
    }),
  ]);

  const userUsers = totalUsers - adminUsers;
  const freeMaterials = totalMaterials - premiumMaterials;

  const statCards = [
    {
      title: "Пользователи",
      value: totalUsers,
      description: `ADMIN: ${adminUsers} / USER: ${userUsers}`,
      href: "/admin/users",
    },
    {
      title: "Материалы",
      value: totalMaterials,
      description: `Опубликовано: ${publishedMaterials} / Черновики: ${draftMaterials}`,
      href: "/admin/materials/new",
    },
    {
      title: "Категории",
      value: totalCategories,
      description: "Разделы библиотеки и сайта",
      href: "/admin/categories",
    },
    {
      title: "Premium",
      value: premiumMaterials,
      description: `Free материалов: ${freeMaterials}`,
      href: "/admin/materials?access=premium",
    },
    {
      title: "Видеолекции",
      value: videoLectures,
      description: "Материалы типа VIDEO_LECTURE",
      href: "/admin/materials?type=VIDEO_LECTURE",
    },
    {
      title: "Активные подписки",
      value: activePremiumSubscriptions,
      description: "ACTIVE подписки не FREE",
      href: "/admin/users?status=ACTIVE",
    },
  ];

  const quickActions = [
    {
      title: "Добавить материал",
      description: "Создать статью, курс, справочник или видеолекцию.",
      href: "/admin/materials/new",
    },
    {
      title: "Управлять категориями",
      description: "Создать раздел, изменить slug или удалить категорию.",
      href: "/admin/categories",
    },
    {
      title: "Выдать Premium",
      description: "Найти пользователя и изменить подписку.",
      href: "/admin/users",
    },
    {
      title: "Проверить черновики",
      description: "Открыть материалы, которые ещё не опубликованы.",
      href: "/admin/materials?status=draft",
    },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Панель управления</h2>
        <p className={styles.pageDescription}>
          Общая статистика проекта, быстрые действия, последние материалы и новые пользователи.
        </p>
      </div>

      <section className={styles.dashboardGrid}>
        {statCards.map((card) => (
          <Link href={card.href} className={styles.dashboardCard} key={card.title}>
            <span className={styles.dashboardCardTitle}>{card.title}</span>
            <strong className={styles.dashboardCardValue}>{card.value}</strong>
            <span className={styles.dashboardCardDescription}>
              {card.description}
            </span>
          </Link>
        ))}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.dashboardSectionHeader}>
          <div>
            <h3 className={styles.dashboardSectionTitle}>Быстрые действия</h3>
            <p className={styles.dashboardSectionDescription}>
              Основные действия, которые чаще всего нужны администратору.
            </p>
          </div>
        </div>

        <div className={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <Link href={action.href} className={styles.quickActionCard} key={action.title}>
              <strong>{action.title}</strong>
              <span>{action.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.dashboardColumns}>
        <section className={styles.dashboardSection}>
          <div className={styles.dashboardSectionHeader}>
            <div>
              <h3 className={styles.dashboardSectionTitle}>Последние материалы</h3>
              <p className={styles.dashboardSectionDescription}>
                Последние добавленные или импортированные материалы.
              </p>
            </div>

            <Link href="/admin/materials" className={styles.resetLink}>
              Все материалы
            </Link>
          </div>

          <div className={styles.dashboardList}>
            {recentMaterials.length > 0 ? (
              recentMaterials.map((material) => (
                <div className={styles.dashboardListItem} key={material.id}>
                  <div>
                    <Link
                      href={`/admin/materials/${material.id}/preview`}
                      className={styles.dashboardItemTitle}
                    >
                      {material.title}
                    </Link>

                    <div className={styles.dashboardItemMeta}>
                      {material.category?.title ?? "Без категории"} · {material.type}
                    </div>
                  </div>

                  <div className={styles.dashboardItemBadges}>
                    <span>{material.isPublished ? "Опубликовано" : "Черновик"}</span>
                    <span>{material.isPremium ? "Premium" : "Free"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyDashboardText}>Материалов пока нет.</p>
            )}
          </div>
        </section>

        <section className={styles.dashboardSection}>
          <div className={styles.dashboardSectionHeader}>
            <div>
              <h3 className={styles.dashboardSectionTitle}>Новые пользователи</h3>
              <p className={styles.dashboardSectionDescription}>
                Последние зарегистрированные аккаунты.
              </p>
            </div>

            <Link href="/admin/users" className={styles.resetLink}>
              Все пользователи
            </Link>
          </div>

          <div className={styles.dashboardList}>
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => {
                const subscription = user.subscriptions[0];

                return (
                  <div className={styles.dashboardListItem} key={user.id}>
                    <div>
                      <div className={styles.dashboardItemTitle}>
                        {user.name || "Без имени"}
                      </div>

                      <div className={styles.dashboardItemMeta}>
                        {user.email} · {formatDate(user.createdAt)}
                      </div>

                      {user.profile?.city && (
                        <div className={styles.dashboardItemMeta}>
                          Город: {user.profile.city}
                        </div>
                      )}
                    </div>

                    <div className={styles.dashboardItemBadges}>
                      <span>{user.role}</span>
                      <span>{subscription?.plan ?? "FREE"}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.emptyDashboardText}>Пользователей пока нет.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}