import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { sanitizeAssetUrl } from "@/lib/contentSecurity";
import { getLatestHomeMaterials } from "@/lib/homeMaterials";
import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

function getTypeLabel(type: string) {
  if (type === "ECG_ARTICLE") return "Статья";
  if (type === "VIDEO_LECTURE") return "Видеолекция";
  if (type === "VIDEO_COURSE") return "Видеокурс";
  if (type === "HELPER") return "Ресурс";

  return type;
}

function getImageState(imageUrl?: string | null) {
  if (!imageUrl) {
    return {
      status: "warning",
      text: "Картинка не задана. На главной будет fallback-шаблон.",
    };
  }

  const safeImageUrl = sanitizeAssetUrl(imageUrl);

  if (!safeImageUrl) {
    return {
      status: "error",
      text: "Картинка задана, но URL небезопасный или некорректный.",
    };
  }

  return {
    status: "ok",
    text: safeImageUrl,
  };
}

export default async function AdminMaterialsAuditPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    notFound();
  }

  const [materials, latestHomeMaterials] = await Promise.all([
    prisma.material.findMany({
      include: {
        category: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
    }),
    getLatestHomeMaterials(12),
  ]);

  const latestHomeIds = new Set(latestHomeMaterials.map((material) => material.id));

  const auditedMaterials = materials.map((material) => {
    const publicHref = getMaterialPublicHref(material);
    const imageState = getImageState(material.imageUrl);
    const isOnHome = latestHomeIds.has(material.id);

    const problems: string[] = [];
    const warnings: string[] = [];

    if (!material.isPublished) {
      warnings.push("Черновик не отображается публично.");
    }

    if (material.isPublished && !publicHref) {
      problems.push("Опубликован, но публичный URL не найден. Проверь тип и категорию.");
    }

    if (imageState.status === "error") {
      problems.push(imageState.text);
    }

    if (imageState.status === "warning") {
      warnings.push(imageState.text);
    }

    if (material.isPublished && publicHref && !isOnHome) {
      warnings.push("Публичный материал есть, но он не входит в последние 12 материалов главной.");
    }

    if (material.isPremium) {
      warnings.push("Premium-контент откроется только пользователям с активной подпиской.");
    }

    return {
      material,
      publicHref,
      imageState,
      isOnHome,
      problems,
      warnings,
    };
  });

  const publishedCount = materials.filter((material) => material.isPublished).length;
  const publicCount = auditedMaterials.filter((item) => item.publicHref && item.material.isPublished).length;
  const homeCount = auditedMaterials.filter((item) => item.isOnHome).length;
  const problemCount = auditedMaterials.filter((item) => item.problems.length > 0).length;
  const warningCount = auditedMaterials.filter((item) => item.warnings.length > 0).length;

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>Аудит материалов</h1>

          <p className={styles.pageDescription}>
            Проверка публикации, публичных URL, картинок и попадания материалов на главную.
          </p>
        </div>

        <Link href="/admin/materials" className={styles.primaryAdminAction}>
          Назад к материалам
        </Link>
      </div>

      <section className={styles.dashboardGrid}>
        <div className={styles.dashboardCard}>
          <span className={styles.dashboardCardTitle}>Всего материалов</span>
          <strong className={styles.dashboardCardValue}>{materials.length}</strong>
          <span className={styles.dashboardCardDescription}>Все записи из БД.</span>
        </div>

        <div className={styles.dashboardCard}>
          <span className={styles.dashboardCardTitle}>Опубликовано</span>
          <strong className={styles.dashboardCardValue}>{publishedCount}</strong>
          <span className={styles.dashboardCardDescription}>Материалы с isPublished=true.</span>
        </div>

        <div className={styles.dashboardCard}>
          <span className={styles.dashboardCardTitle}>Есть публичный URL</span>
          <strong className={styles.dashboardCardValue}>{publicCount}</strong>
          <span className={styles.dashboardCardDescription}>Материалы, которые можно открыть на сайте.</span>
        </div>

        <div className={styles.dashboardCard}>
          <span className={styles.dashboardCardTitle}>На главной</span>
          <strong className={styles.dashboardCardValue}>{homeCount}</strong>
          <span className={styles.dashboardCardDescription}>Попали в блок «Последние материалы».</span>
        </div>

        <div className={styles.dashboardCard}>
          <span className={styles.dashboardCardTitle}>Проблемы</span>
          <strong className={styles.dashboardCardValue}>{problemCount}</strong>
          <span className={styles.dashboardCardDescription}>Нужно исправить перед публикацией.</span>
        </div>

        <div className={styles.dashboardCard}>
          <span className={styles.dashboardCardTitle}>Предупреждения</span>
          <strong className={styles.dashboardCardValue}>{warningCount}</strong>
          <span className={styles.dashboardCardDescription}>Не критично, но стоит проверить.</span>
        </div>
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.dashboardSectionHeader}>
          <div>
            <h2 className={styles.dashboardSectionTitle}>Последние материалы на главной</h2>
            <p className={styles.dashboardSectionDescription}>
              Это фактический список, который возвращает getLatestHomeMaterials(12).
            </p>
          </div>
        </div>

        {latestHomeMaterials.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>URL</th>
                  <th>Картинка</th>
                </tr>
              </thead>

              <tbody>
                {latestHomeMaterials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.title}</td>
                    <td>{material.typeLabel}</td>
                    <td>
                      <Link href={material.href} target="_blank" rel="noreferrer">
                        {material.href}
                      </Link>
                    </td>
                    <td>{material.imageUrl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.emptyDashboardText}>
            На главную сейчас не попадает ни один опубликованный материал.
          </p>
        )}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.dashboardSectionHeader}>
          <div>
            <h2 className={styles.dashboardSectionTitle}>Полный аудит</h2>
            <p className={styles.dashboardSectionDescription}>
              Если у материала есть проблема, он может не отображаться на сайте или главной.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Материал</th>
                <th>Статус</th>
                <th>Тип</th>
                <th>Категория</th>
                <th>Публичный URL</th>
                <th>Главная</th>
                <th>Картинка</th>
                <th>Проверка</th>
              </tr>
            </thead>

            <tbody>
              {auditedMaterials.map((item) => (
                <tr key={item.material.id}>
                  <td>
                    <div className={styles.materialTitle}>{item.material.title}</div>
                    <div className={styles.materialSlug}>{item.material.slug}</div>
                  </td>

                  <td>{item.material.isPublished ? "Опубликован" : "Черновик"}</td>
                  <td>{getTypeLabel(item.material.type)}</td>
                  <td>{item.material.category?.title ?? "Без категории"}</td>

                  <td>
                    {item.publicHref ? (
                      <Link href={item.publicHref} target="_blank" rel="noreferrer">
                        {item.publicHref}
                      </Link>
                    ) : (
                      "Нет"
                    )}
                  </td>

                  <td>{item.isOnHome ? "Да" : "Нет"}</td>
                  <td>{item.imageState.text}</td>

                  <td>
                    {item.problems.length === 0 && item.warnings.length === 0 ? (
                      "ОК"
                    ) : (
                      <ul>
                        {item.problems.map((problem) => (
                          <li key={problem}>Ошибка: {problem}</li>
                        ))}

                        {item.warnings.map((warning) => (
                          <li key={warning}>Важно: {warning}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}