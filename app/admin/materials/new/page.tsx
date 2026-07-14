import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import EcgSectionFields from "../EcgSectionFields";
import MaterialContentEditor from "../MaterialContentEditor";
import { createMaterialAction } from "../actions";

export const dynamic = "force-dynamic";

type NewMaterialPageProps = {
  searchParams: Promise<{
    error?: string;
    categorySlug?: string;
    ecgSectionId?: string;
    type?: string;
    sortOrder?: string;
    returnTo?: string;
  }>;
};

function getMessage(error?: string) {
  if (error === "required-fields") return "Р—Р°РїРѕР»РЅРё РЅР°Р·РІР°РЅРёРµ, С‚РёРї Рё РєР°С‚РµРіРѕСЂРёСЋ РјР°С‚РµСЂРёР°Р»Р°.";
  if (error === "slug-required") return "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ slug. РЈРєР°Р¶Рё slug РІСЂСѓС‡РЅСѓСЋ.";
  if (error === "slug-exists") return "РњР°С‚РµСЂРёР°Р» СЃ С‚Р°РєРёРј slug СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚.";
  if (error === "invalid-image") return "РњРѕР¶РЅРѕ Р·Р°РіСЂСѓР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ JPG, PNG, WEBP РёР»Рё GIF.";
  if (error === "image-too-large") return "РљР°СЂС‚РёРЅРєР° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€Р°СЏ. РњР°РєСЃРёРјСѓРј вЂ” 5 РњР‘.";
  if (error === "invalid-url") return "РџСЂРѕРІРµСЂСЊ СЃСЃС‹Р»РєСѓ РЅР° РёР·РѕР±СЂР°Р¶РµРЅРёРµ РёР»Рё РІРёРґРµРѕ. Р Р°Р·СЂРµС€РµРЅС‹ С‚РѕР»СЊРєРѕ Р±РµР·РѕРїР°СЃРЅС‹Рµ URL.";
  if (error === "content-too-large") return "РўРµРєСЃС‚ РјР°С‚РµСЂРёР°Р»Р° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№. Р Р°Р·РґРµР»Рё РµРіРѕ РЅР° РЅРµСЃРєРѕР»СЊРєРѕ С‡Р°СЃС‚РµР№.";

  return null;
}

function parseSortOrder(value?: string) {
  const sortOrder = Number.parseInt(value ?? "100", 10);

  return Number.isFinite(sortOrder) ? sortOrder : 100;
}

export default async function NewMaterialPage({
  searchParams,
}: NewMaterialPageProps) {
  const { error, categorySlug, ecgSectionId, type, sortOrder, returnTo } = await searchParams;

  const [categories, ecgSections, preselectedCategory] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        title: "asc",
      },
    }),
    prisma.ecgSection.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
    }),
    categorySlug
      ? prisma.category.findUnique({
          where: {
            slug: categorySlug,
          },
          select: {
            id: true,
          },
        })
      : null,
  ]);

  const message = getMessage(error);
  const defaultCategoryId = preselectedCategory?.id ?? "";
  const defaultType = type || "ECG_ARTICLE";
  const defaultSortOrder = parseSortOrder(sortOrder);
  const safeReturnTo = returnTo?.startsWith("/admin") ? returnTo : "/admin/materials";

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link href="/admin/materials" className={styles.backLink}>
            в†ђ РњР°С‚РµСЂРёР°Р»С‹
          </Link>

          <h1 className={styles.pageTitle}>РќРѕРІС‹Р№ РјР°С‚РµСЂРёР°Р»</h1>

          <p className={styles.pageDescription}>
            РЎРѕР·РґР°РЅРёРµ СЃС‚Р°С‚СЊРё, РІРёРґРµРѕР»РµРєС†РёРё РёР»Рё РїРѕР»РµР·РЅРѕРіРѕ СЂРµСЃСѓСЂСЃР°.
          </p>
        </div>
      </div>

      {message ? (
        <div className={styles.adminNoticeError}>
          {message}
        </div>
      ) : null}

      <form action={createMaterialAction} className={styles.simpleEditLayout} encType="multipart/form-data">
        <input type="hidden" name="redirectPath" value="/admin/materials/new" />
        <input type="hidden" name="afterCreatePath" value={safeReturnTo} />

        <main className={styles.simpleEditMain}>
          <section className={styles.simpleEditCard}>
            <div className={styles.simpleEditCardHeader}>
              <h2>РћСЃРЅРѕРІРЅРѕРµ</h2>
              <p>РќР°Р·РІР°РЅРёРµ, РѕРїРёСЃР°РЅРёРµ Рё СЃРѕРґРµСЂР¶Р°РЅРёРµ РјР°С‚РµСЂРёР°Р»Р°.</p>
            </div>

            <label className={styles.formGroup}>
              <span className={styles.label}>РќР°Р·РІР°РЅРёРµ</span>
              <input
                className={styles.input}
                name="title"
                placeholder="РќР°РїСЂРёРјРµСЂ: Р—СѓР±РµС† T"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>РљРѕСЂРѕС‚РєРѕРµ РѕРїРёСЃР°РЅРёРµ</span>
              <textarea
                className={styles.textareaSmall}
                name="description"
                placeholder="1вЂ“2 РїСЂРµРґР»РѕР¶РµРЅРёСЏ РґР»СЏ РєР°СЂС‚РѕС‡РєРё РјР°С‚РµСЂРёР°Р»Р°."
              />
            </label>

            <MaterialContentEditor defaultValue="" />
          </section>

          <details className={styles.simpleEditDetails} open>
            <summary>РЎР»СѓР¶РµР±РЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё</summary>

            <div className={styles.simpleEditDetailsBody}>
              <div className={styles.formGrid}>
                <label className={styles.formGroup}>
                  <span className={styles.label}>Slug</span>
                  <input
                    className={styles.input}
                    name="slug"
                    placeholder="zubec-t"
                  />
                  <span className={styles.formHint}>
                    Р•СЃР»Рё РѕСЃС‚Р°РІРёС‚СЊ РїСѓСЃС‚С‹Рј, slug СЃРѕР·РґР°СЃС‚СЃСЏ РёР· РЅР°Р·РІР°РЅРёСЏ.
                  </span>
                </label>

                <label className={styles.formGroup}>
                  <span className={styles.label}>РўРёРї РјР°С‚РµСЂРёР°Р»Р°</span>
                  <select
                    className={styles.input}
                    name="type"
                    defaultValue={defaultType}
                    required
                  >
                    <option value="ECG_ARTICLE">РЎС‚Р°С‚СЊСЏ / Р­РљР“ РјР°С‚РµСЂРёР°Р»</option>
                    <option value="VIDEO_LECTURE">Р’РёРґРµРѕР»РµРєС†РёСЏ</option>
                    <option value="VIDEO_COURSE">Р’РёРґРµРѕРєСѓСЂСЃ</option>
                    <option value="HELPER">РџРѕР»РµР·РЅС‹Р№ СЂРµСЃСѓСЂСЃ</option>
                  </select>
                </label>
              </div>

              <label className={styles.formGroup}>
                <span className={styles.label}>РљР°С‚РµРіРѕСЂРёСЏ</span>
                <select
                  className={styles.input}
                  name="categoryId"
                  defaultValue={defaultCategoryId}
                  required
                >
                  <option value="">Р’С‹Р±РµСЂРё РєР°С‚РµРіРѕСЂРёСЋ</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </details>

          <EcgSectionFields
            sections={ecgSections}
            currentSectionId={ecgSectionId ?? ""}
            currentSortOrder={defaultSortOrder}
          />

          <details className={styles.simpleEditDetails}>
            <summary>РР·РѕР±СЂР°Р¶РµРЅРёРµ Рё РІРёРґРµРѕ</summary>

            <div className={styles.simpleEditDetailsBody}>
              <label className={styles.formGroup}>
                <span className={styles.label}>Р—Р°РіСЂСѓР·РёС‚СЊ РєР°СЂС‚РёРЅРєСѓ</span>
                <input
                  className={styles.input}
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>URL РёР·РѕР±СЂР°Р¶РµРЅРёСЏ</span>
                <input
                  className={styles.input}
                  name="imageUrl"
                  placeholder="/images/materials__img__1.png"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>Р’РёРґРµРѕ URL</span>
                <input
                  className={styles.input}
                  name="videoUrl"
                  placeholder="https://example.com/video"
                />
              </label>
            </div>
          </details>
        </main>

        <aside className={styles.simpleEditSide}>
          <section className={styles.simpleEditCard}>
            <div className={styles.simplePublishControls}>
              <label className={styles.simpleCheckbox}>
                <input name="isPublished" type="checkbox" />
                <span>РћРїСѓР±Р»РёРєРѕРІР°РЅ</span>
              </label>

              <p className={styles.formHint}>
                Р§С‚РѕР±С‹ РјР°С‚РµСЂРёР°Р» РїРѕСЏРІРёР»СЃСЏ РЅР° РіР»Р°РІРЅРѕР№, РІРєР»СЋС‡Рё В«РћРїСѓР±Р»РёРєРѕРІР°РЅВ».
              </p>

              <label className={styles.simpleCheckbox}>
                <input name="isPremium" type="checkbox" />
                <span>Premium-РґРѕСЃС‚СѓРї</span>
              </label>
            </div>

            <button className={styles.simpleSaveButton} type="submit">
              РЎРѕР·РґР°С‚СЊ РјР°С‚РµСЂРёР°Р»
            </button>

            <Link href="/admin/materials" className={styles.simplePreviewButton}>
              РћС‚РјРµРЅР°
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}