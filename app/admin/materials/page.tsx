/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import DeleteMaterialButton from "./DeleteMaterialButton";
import MaterialAdminDiagnostics from "./MaterialAdminDiagnostics";

export const dynamic = "force-dynamic";

type MaterialsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    access?: string | string[];
    type?: string | string[];
    categoryId?: string | string[];
    error?: string | string[];
    success?: string | string[];
  }>;
};

function getSingleParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getMessage(error?: string, success?: string) {
  if (success === "created") {
    return {
      type: "success",
      text: "РњР°С‚РµСЂРёР°Р» СЃРѕР·РґР°РЅ.",
    };
  }

  if (success === "updated") {
    return {
      type: "success",
      text: "РњР°С‚РµСЂРёР°Р» РѕР±РЅРѕРІР»С‘РЅ.",
    };
  }

  if (success === "deleted") {
    return {
      type: "success",
      text: "РњР°С‚РµСЂРёР°Р» СѓРґР°Р»С‘РЅ.",
    };
  }

  if (error === "required-fields") {
    return {
      type: "error",
      text: "Р—Р°РїРѕР»РЅРё РЅР°Р·РІР°РЅРёРµ, С‚РёРї Рё РєР°С‚РµРіРѕСЂРёСЋ РјР°С‚РµСЂРёР°Р»Р°.",
    };
  }

  if (error === "slug-required") {
    return {
      type: "error",
      text: "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ slug. РЈРєР°Р¶Рё slug РІСЂСѓС‡РЅСѓСЋ.",
    };
  }

  if (error === "slug-exists") {
    return {
      type: "error",
      text: "РњР°С‚РµСЂРёР°Р» СЃ С‚Р°РєРёРј slug СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚.",
    };
  }

  if (error === "invalid-image") {
    return {
      type: "error",
      text: "РњРѕР¶РЅРѕ Р·Р°РіСЂСѓР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ.",
    };
  }

  if (error === "image-too-large") {
    return {
      type: "error",
      text: "РљР°СЂС‚РёРЅРєР° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€Р°СЏ. РњР°РєСЃРёРјСѓРј вЂ” 5 РњР‘.",
    };
  }

  if (error === "invalid-url") {
    return {
      type: "error",
      text: "РџСЂРѕРІРµСЂСЊ СЃСЃС‹Р»РєСѓ РЅР° РёР·РѕР±СЂР°Р¶РµРЅРёРµ РёР»Рё РІРёРґРµРѕ. Р Р°Р·СЂРµС€РµРЅС‹ С‚РѕР»СЊРєРѕ Р±РµР·РѕРїР°СЃРЅС‹Рµ URL.",
    };
  }

  if (error === "content-too-large") {
    return {
      type: "error",
      text: "РўРµРєСЃС‚ РјР°С‚РµСЂРёР°Р»Р° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№. РЎРѕРєСЂР°С‚Рё РјР°С‚РµСЂРёР°Р» РёР»Рё СЂР°Р·РґРµР»Рё РµРіРѕ РЅР° РЅРµСЃРєРѕР»СЊРєРѕ С‡Р°СЃС‚РµР№.",
    };
  }

  if (error === "id-required") {
    return {
      type: "error",
      text: "ID РјР°С‚РµСЂРёР°Р»Р° РЅРµ РЅР°Р№РґРµРЅ.",
    };
  }

  if (error === "not-found") {
    return {
      type: "error",
      text: "РњР°С‚РµСЂРёР°Р» РЅРµ РЅР°Р№РґРµРЅ. Р’РѕР·РјРѕР¶РЅРѕ, РѕРЅ СѓР¶Рµ СѓРґР°Р»С‘РЅ.",
    };
  }

  if (error === "delete-not-confirmed") {
    return {
      type: "error",
      text: "РЈРґР°Р»РµРЅРёРµ РјР°С‚РµСЂРёР°Р»Р° РЅРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРѕ.",
    };
  }

  return null;
}

function getMaterialTypeLabel(type: string) {
  if (type === "ECG_ARTICLE") return "РЎС‚Р°С‚СЊСЏ";
  if (type === "VIDEO_LECTURE") return "Р’РёРґРµРѕР»РµРєС†РёСЏ";
  if (type === "HELPER") return "Р РµСЃСѓСЂСЃ";

  return type;
}

function createCurrentPath(params: {
  q: string;
  status: string;
  access: string;
  type: string;
  categoryId: string;
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.access && params.access !== "all") query.set("access", params.access);
  if (params.type && params.type !== "all") query.set("type", params.type);
  if (params.categoryId && params.categoryId !== "all") {
    query.set("categoryId", params.categoryId);
  }

  const queryString = query.toString();

  return queryString ? `/admin/materials?${queryString}` : "/admin/materials";
}

export default async function AdminMaterialsPage({
  searchParams,
}: MaterialsPageProps) {
  const resolvedSearchParams = await searchParams;

  const q = getSingleParam(resolvedSearchParams.q).trim();
  const status = getSingleParam(resolvedSearchParams.status) || "all";
  const access = getSingleParam(resolvedSearchParams.access) || "all";
  const type = getSingleParam(resolvedSearchParams.type) || "all";
  const categoryId = getSingleParam(resolvedSearchParams.categoryId) || "all";
  const error = getSingleParam(resolvedSearchParams.error);
  const success = getSingleParam(resolvedSearchParams.success);

  const whereParts: Prisma.MaterialWhereInput[] = [];

  if (q) {
    whereParts.push({
      OR: [
        {
          title: {
            contains: q,
          },
        },
        {
          slug: {
            contains: q,
          },
        },
        {
          description: {
            contains: q,
          },
        },
        {
          content: {
            contains: q,
          },
        },
        {
          category: {
            is: {
              title: {
                contains: q,
              },
            },
          },
        },
      ],
    });
  }

  if (status === "published") {
    whereParts.push({
      isPublished: true,
    });
  }

  if (status === "draft") {
    whereParts.push({
      isPublished: false,
    });
  }

  if (access === "premium") {
    whereParts.push({
      isPremium: true,
    });
  }

  if (access === "free") {
    whereParts.push({
      isPremium: false,
    });
  }

  if (type !== "all") {
    whereParts.push({
      type,
    });
  }

  if (categoryId !== "all") {
    whereParts.push({
      categoryId,
    });
  }

  const where: Prisma.MaterialWhereInput =
    whereParts.length > 0
      ? {
          AND: whereParts,
        }
      : {};

  const [
    materials,
    categories,
    totalMaterials,
    publishedMaterials,
    draftMaterials,
    premiumMaterials,
    videoLectures,
    filteredMaterials,
  ] = await Promise.all([
    prisma.material.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
    prisma.category.findMany({
      orderBy: {
        title: "asc",
      },
    }),
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
    prisma.material.count({
      where,
    }),
  ]);

  const message = getMessage(error, success);
  const currentPath = createCurrentPath({
    q,
    status,
    access,
    type,
    categoryId,
  });

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminTopbar}>
        <div>
          <h1 className={styles.pageTitle}>РњР°С‚РµСЂРёР°Р»С‹</h1>

          <p className={styles.pageDescription}>
            РЈРїСЂР°РІР»РµРЅРёРµ СЃС‚Р°С‚СЊСЏРјРё, РІРёРґРµРѕР»РµРєС†РёСЏРјРё, С‡РµСЂРЅРѕРІРёРєР°РјРё, premium-РґРѕСЃС‚СѓРїРѕРј Рё РїСѓР±Р»РёРєР°С†РёРµР№.
          </p>
        </div>

        <Link href="/admin/materials/new" className={styles.primaryAdminAction}>
          Р”РѕР±Р°РІРёС‚СЊ РјР°С‚РµСЂРёР°Р»
        </Link>
      </div>

      {message ? (
        <div
          className={
            message.type === "success"
              ? styles.adminNoticeSuccess
              : styles.adminNoticeError
          }
        >
          {message.text}
        </div>
      ) : null}

      <section className={styles.materialsStatsGrid}>
        <div className={styles.materialsStatCard}>
          <span>Р’СЃРµРіРѕ</span>
          <strong>{totalMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>РћРїСѓР±Р»РёРєРѕРІР°РЅРѕ</span>
          <strong>{publishedMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Р§РµСЂРЅРѕРІРёРєРё</span>
          <strong>{draftMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Premium</span>
          <strong>{premiumMaterials}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>Р’РёРґРµРѕР»РµРєС†РёРё</span>
          <strong>{videoLectures}</strong>
        </div>

        <div className={styles.materialsStatCard}>
          <span>РќР°Р№РґРµРЅРѕ</span>
          <strong>{filteredMaterials}</strong>
        </div>
      </section>

      <section className={styles.materialsControlPanel}>
        <div>
          <h2>Р¤РёР»СЊС‚СЂС‹ Рё РїРѕРёСЃРє</h2>
          <p>
            Р‘С‹СЃС‚СЂРѕ РЅР°Р№РґРё РјР°С‚РµСЂРёР°Р» РїРѕ РЅР°Р·РІР°РЅРёСЋ, slug, С‚РµРєСЃС‚Сѓ, РєР°С‚РµРіРѕСЂРёРё, СЃС‚Р°С‚СѓСЃСѓ РёР»Рё С‚РёРїСѓ.
          </p>
        </div>

        <form className={styles.materialsFiltersForm} action="/admin/materials">
          <label className={styles.materialsSearchField}>
            <span>РџРѕРёСЃРє</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="РќР°Р·РІР°РЅРёРµ, slug, С‚РµРєСЃС‚ РёР»Рё РєР°С‚РµРіРѕСЂРёСЏ"
            />
          </label>

          <label className={styles.materialsFilterField}>
            <span>РЎС‚Р°С‚СѓСЃ</span>
            <select name="status" defaultValue={status}>
              <option value="all">Р’СЃРµ СЃС‚Р°С‚СѓСЃС‹</option>
              <option value="published">РћРїСѓР±Р»РёРєРѕРІР°РЅРЅС‹Рµ</option>
              <option value="draft">Р§РµСЂРЅРѕРІРёРєРё</option>
            </select>
          </label>

          <label className={styles.materialsFilterField}>
            <span>Р”РѕСЃС‚СѓРї</span>
            <select name="access" defaultValue={access}>
              <option value="all">Р›СЋР±РѕР№ РґРѕСЃС‚СѓРї</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          <label className={styles.materialsFilterField}>
            <span>РўРёРї</span>
            <select name="type" defaultValue={type}>
              <option value="all">Р’СЃРµ С‚РёРїС‹</option>
              <option value="ECG_ARTICLE">РЎС‚Р°С‚СЊРё</option>
              <option value="VIDEO_LECTURE">Р’РёРґРµРѕР»РµРєС†РёРё</option>
              <option value="HELPER">Р РµСЃСѓСЂСЃС‹</option>
            </select>
          </label>

          <label className={styles.materialsFilterField}>
            <span>РљР°С‚РµРіРѕСЂРёСЏ</span>
            <select name="categoryId" defaultValue={categoryId}>
              <option value="all">Р’СЃРµ РєР°С‚РµРіРѕСЂРёРё</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.materialsFilterActions}>
            <button type="submit">РџСЂРёРјРµРЅРёС‚СЊ</button>
            <Link href="/admin/materials">РЎР±СЂРѕСЃРёС‚СЊ</Link>
          </div>
        </form>
      </section>

      {materials.length > 0 ? (
        <section className={styles.materialsCardsGrid}>
          {materials.map((material) => {
            const publicHref = getMaterialPublicHref(material);

            return (
              <article key={material.id} className={styles.materialCard}>
                <div className={styles.materialCardImage}>
                  {material.imageUrl ? (
                    <img src={material.imageUrl} alt="" />
                  ) : (
                    <div className={styles.materialCardImagePlaceholder}>
                      {material.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className={styles.materialCardBody}>
                  <div className={styles.materialCardBadges}>
                    <span
                      className={
                        material.isPublished
                          ? styles.materialBadgePublished
                          : styles.materialBadgeDraft
                      }
                    >
                      {material.isPublished ? "РћРїСѓР±Р»РёРєРѕРІР°РЅ" : "Р§РµСЂРЅРѕРІРёРє"}
                    </span>

                    <span
                      className={
                        material.isPremium
                          ? styles.materialBadgePremium
                          : styles.materialBadgeFree
                      }
                    >
                      {material.isPremium ? "Premium" : "Free"}
                    </span>

                    <span className={styles.materialBadgeType}>
                      {getMaterialTypeLabel(material.type)}
                    </span>
                  </div>

                  <h2 className={styles.materialCardTitle}>
                    {material.title}
                  </h2>

                  <p className={styles.materialCardDescription}>
                    {material.description || "РћРїРёСЃР°РЅРёРµ РїРѕРєР° РЅРµ Р·Р°РїРѕР»РЅРµРЅРѕ."}
                  </p>

                  <div className={styles.materialCardMeta}>
                    <div>
                      <span>РљР°С‚РµРіРѕСЂРёСЏ</span>
                      <strong>{material.category?.title ?? "Р‘РµР· РєР°С‚РµРіРѕСЂРёРё"}</strong>
                    </div>

                    <div>
                      <span>Slug</span>
                      <strong>{material.slug}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.materialCardActions}>
                  <Link
                    href={`/admin/materials/${material.id}/edit`}
                    className={styles.materialActionPrimary}
                  >
                    Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ
                  </Link>

                  <Link
                    href={`/admin/materials/${material.id}/preview`}
                    className={styles.materialActionSecondary}
                  >
                    РџСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ
                  </Link>

                  {material.isPublished && publicHref ? (
                    <Link
                      href={publicHref}
                      className={styles.materialActionSecondary}
                      target="_blank"
                      rel="noreferrer"
                    >
                      РќР° СЃР°Р№С‚Рµ
                    </Link>
                  ) : (
                    <span className={styles.materialActionDisabled}>
                      РќРµ РѕРїСѓР±Р»РёРєРѕРІР°РЅ
                    </span>
                  )}

                  <DeleteMaterialButton
                    materialId={material.id}
                    materialTitle={material.title}
                    redirectPath={currentPath}
                  />
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className={styles.materialsEmptyState}>
          <h2>РњР°С‚РµСЂРёР°Р»С‹ РЅРµ РЅР°Р№РґРµРЅС‹</h2>

          <p>
            РџРѕРїСЂРѕР±СѓР№ РёР·РјРµРЅРёС‚СЊ С„РёР»СЊС‚СЂС‹ РёР»Рё СЃРѕР·РґР°С‚СЊ РЅРѕРІС‹Р№ РјР°С‚РµСЂРёР°Р». Р•СЃР»Рё Р±Р°Р·Р° РїСѓСЃС‚Р°СЏ,
            РјРѕР¶РЅРѕ Р·Р°РїСѓСЃС‚РёС‚СЊ РґРµРјРѕ-РЅР°РїРѕР»РЅРµРЅРёРµ.
          </p>

          <div className={styles.materialsEmptyActions}>
            <Link href="/admin/materials" className={styles.secondaryAdminAction}>
              РЎР±СЂРѕСЃРёС‚СЊ С„РёР»СЊС‚СЂС‹
            </Link>

            <Link href="/admin/materials/new" className={styles.primaryAdminAction}>
              Р”РѕР±Р°РІРёС‚СЊ РјР°С‚РµСЂРёР°Р»
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}