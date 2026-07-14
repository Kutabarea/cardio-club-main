/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialPublicHref } from "@/lib/materialPublicHref";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/Admin.module.css";

import EcgSectionFields from "../../EcgSectionFields";
import MaterialContentEditor from "../../MaterialContentEditor";
import { updateMaterialAction } from "../../actions";

type EditMaterialPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function getMessage(error?: string, success?: string) {
  if (success === "updated") return { type: "success", text: "РњР°С‚РµСЂРёР°Р» СЃРѕС…СЂР°РЅС‘РЅ." };
  if (error === "required-fields") return { type: "error", text: "Р—Р°РїРѕР»РЅРё РЅР°Р·РІР°РЅРёРµ, С‚РёРї Рё РєР°С‚РµРіРѕСЂРёСЋ РјР°С‚РµСЂРёР°Р»Р°." };
  if (error === "slug-required") return { type: "error", text: "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ slug. РЈРєР°Р¶Рё slug РІСЂСѓС‡РЅСѓСЋ." };
  if (error === "slug-exists") return { type: "error", text: "РњР°С‚РµСЂРёР°Р» СЃ С‚Р°РєРёРј slug СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚." };
  if (error === "invalid-image") return { type: "error", text: "РњРѕР¶РЅРѕ Р·Р°РіСЂСѓР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ JPG, PNG, WEBP РёР»Рё GIF." };
  if (error === "image-too-large") return { type: "error", text: "РљР°СЂС‚РёРЅРєР° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€Р°СЏ. РњР°РєСЃРёРјСѓРј вЂ” 5 РњР‘." };
  if (error === "invalid-url") return { type: "error", text: "РџСЂРѕРІРµСЂСЊ СЃСЃС‹Р»РєСѓ РЅР° РёР·РѕР±СЂР°Р¶РµРЅРёРµ РёР»Рё РІРёРґРµРѕ. Р Р°Р·СЂРµС€РµРЅС‹ С‚РѕР»СЊРєРѕ Р±РµР·РѕРїР°СЃРЅС‹Рµ URL." };
  if (error === "content-too-large") return { type: "error", text: "РўРµРєСЃС‚ РјР°С‚РµСЂРёР°Р»Р° СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№. Р Р°Р·РґРµР»Рё РµРіРѕ РЅР° РЅРµСЃРєРѕР»СЊРєРѕ С‡Р°СЃС‚РµР№." };
  if (error === "not-found") return { type: "error", text: "РњР°С‚РµСЂРёР°Р» РЅРµ РЅР°Р№РґРµРЅ." };

  return null;
}

function getMaterialTypeLabel(type: string) {
  if (type === "ECG_ARTICLE") return "РЎС‚Р°С‚СЊСЏ";
  if (type === "VIDEO_LECTURE") return "Р’РёРґРµРѕР»РµРєС†РёСЏ";
  if (type === "HELPER") return "РџРѕР»РµР·РЅС‹Р№ СЂРµСЃСѓСЂСЃ";

  return type;
}

export default async function EditMaterialPage({
  params,
  searchParams,
}: EditMaterialPageProps) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const [material, categories, ecgSections] = await Promise.all([
    prisma.material.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        ecgSection: true,
      },
    }),
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
  ]);

  if (!material) {
    notFound();
  }

  const message = getMessage(error, success);
  const currentPath = `/admin/materials/${material.id}/edit`;
  const publicHref = getMaterialPublicHref(material);

  return (
    <div className={styles.adminPage}>
      <div className={styles.simpleEditHeader}>
        <div>
          <Link href="/admin/materials" className={styles.backLink}>
            в†ђ РњР°С‚РµСЂРёР°Р»С‹
          </Link>

          <h1 className={styles.pageTitle}>Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РјР°С‚РµСЂРёР°Р»Р°</h1>

          <p className={styles.pageDescription}>
            Р Р°Р±РѕС‡РёР№ СЌРєСЂР°РЅ РґР»СЏ СЂРµРґР°РєС‚РѕСЂР°: С‚РµРєСЃС‚, РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ, РїСѓР±Р»РёРєР°С†РёСЏ Рё СЃР»СѓР¶РµР±РЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё.
          </p>
        </div>

        <div className={styles.simpleEditHeaderActions}>
          <Link
            href={`/admin/materials/${material.id}/preview`}
            className={styles.secondaryAdminAction}
          >
            РћС‚РґРµР»СЊРЅС‹Р№ РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ
          </Link>

          {material.isPublished && publicHref ? (
            <Link
              href={publicHref}
              className={styles.primaryAdminAction}
              target="_blank"
              rel="noreferrer"
            >
              РќР° СЃР°Р№С‚Рµ
            </Link>
          ) : null}
        </div>
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

      <form action={updateMaterialAction} className={styles.simpleEditLayout} encType="multipart/form-data">
        <input type="hidden" name="id" value={material.id} />
        <input type="hidden" name="redirectPath" value={currentPath} />

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
                defaultValue={material.title}
                placeholder="РќР°РїСЂРёРјРµСЂ: РљРѕРјРїР»РµРєСЃ QRS"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.label}>РљРѕСЂРѕС‚РєРѕРµ РѕРїРёСЃР°РЅРёРµ</span>
              <textarea
                className={styles.textareaSmall}
                name="description"
                defaultValue={material.description ?? ""}
                placeholder="1вЂ“2 РїСЂРµРґР»РѕР¶РµРЅРёСЏ РґР»СЏ РєР°СЂС‚РѕС‡РєРё РјР°С‚РµСЂРёР°Р»Р°."
              />
            </label>

            <MaterialContentEditor defaultValue={material.content ?? ""} />
          </section>

          <details className={styles.simpleEditDetails}>
            <summary>РЎР»СѓР¶РµР±РЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё</summary>

            <div className={styles.simpleEditDetailsBody}>
              <div className={styles.formGrid}>
                <label className={styles.formGroup}>
                  <span className={styles.label}>Slug</span>
                  <input
                    className={styles.input}
                    name="slug"
                    defaultValue={material.slug}
                    placeholder="complex-qrs"
                  />
                  <span className={styles.formHint}>
                    РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РІ СЃСЃС‹Р»РєРµ. Р›СѓС‡С€Рµ Р»Р°С‚РёРЅРёС†Р°, С†РёС„СЂС‹ Рё РґРµС„РёСЃС‹.
                  </span>
                </label>

                <label className={styles.formGroup}>
                  <span className={styles.label}>РўРёРї РјР°С‚РµСЂРёР°Р»Р°</span>
                  <select
                    className={styles.input}
                    name="type"
                    defaultValue={material.type}
                    required
                  >
                    <option value="ECG_ARTICLE">РЎС‚Р°С‚СЊСЏ / Р­РљР“ РјР°С‚РµСЂРёР°Р»</option>
                    <option value="VIDEO_LECTURE">Р’РёРґРµРѕР»РµРєС†РёСЏ</option>
                    <option value="HELPER">РџРѕР»РµР·РЅС‹Р№ СЂРµСЃСѓСЂСЃ</option>
                  </select>
                </label>
              </div>

              <label className={styles.formGroup}>
                <span className={styles.label}>РљР°С‚РµРіРѕСЂРёСЏ</span>
                <select
                  className={styles.input}
                  name="categoryId"
                  defaultValue={material.categoryId ?? ""}
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
            currentSectionId={material.ecgSectionId}
            currentSortOrder={material.sortOrder}
          />

          <details className={styles.simpleEditDetails}>
            <summary>РР·РѕР±СЂР°Р¶РµРЅРёРµ Рё РІРёРґРµРѕ</summary>

            <div className={styles.simpleEditDetailsBody}>
              {material.imageUrl ? (
                <div className={styles.simpleImagePreview}>
                  <img src={material.imageUrl} alt="" />

                  <div>
                    <span>РўРµРєСѓС‰РµРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ</span>
                    <strong>{material.imageUrl}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyEditorState}>
                  РЈ РјР°С‚РµСЂРёР°Р»Р° РїРѕРєР° РЅРµС‚ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ.
                </div>
              )}

              <label className={styles.formGroup}>
                <span className={styles.label}>Р—Р°РіСЂСѓР·РёС‚СЊ РЅРѕРІСѓСЋ РєР°СЂС‚РёРЅРєСѓ</span>
                <input
                  className={styles.input}
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
                <span className={styles.formHint}>
                  РњР°РєСЃРёРјСѓРј 5 РњР‘. Р Р°Р·СЂРµС€РµРЅС‹ JPG, PNG, WEBP, GIF.
                </span>
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>URL РёР·РѕР±СЂР°Р¶РµРЅРёСЏ</span>
                <input
                  className={styles.input}
                  name="imageUrl"
                  defaultValue={material.imageUrl ?? ""}
                  placeholder="/images/materials__img__1.png"
                />
              </label>

              <label className={styles.formGroup}>
                <span className={styles.label}>Р’РёРґРµРѕ URL</span>
                <input
                  className={styles.input}
                  name="videoUrl"
                  defaultValue={material.videoUrl ?? ""}
                  placeholder="https://example.com/video"
                />
              </label>
            </div>
          </details>
        </main>

        <aside className={styles.simpleEditSide}>
          <section className={styles.simpleEditCard}>
            <div className={styles.simpleStatusLine}>
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
            </div>

            <div className={styles.simpleEditMeta}>
              <div>
                <span>РўРёРї</span>
                <strong>{getMaterialTypeLabel(material.type)}</strong>
              </div>

              <div>
                <span>РљР°С‚РµРіРѕСЂРёСЏ</span>
                <strong>{material.category?.title ?? "Р‘РµР· РєР°С‚РµРіРѕСЂРёРё"}</strong>
              </div>

              <div>
                <span>РџРѕРґСЂР°Р·РґРµР» Р­РљР“</span>
                <strong>{material.ecgSection?.title ?? "РќРµ РІС‹Р±СЂР°РЅ"}</strong>
              </div>
            </div>

            <div className={styles.simplePublishControls}>
              <label className={styles.simpleCheckbox}>
                <input
                  name="isPublished"
                  type="checkbox"
                  defaultChecked={material.isPublished}
                />
                <span>РћРїСѓР±Р»РёРєРѕРІР°РЅ</span>
              </label>

              <label className={styles.simpleCheckbox}>
                <input
                  name="isPremium"
                  type="checkbox"
                  defaultChecked={material.isPremium}
                />
                <span>Premium-РґРѕСЃС‚СѓРї</span>
              </label>
            </div>

            <button className={styles.simpleSaveButton} type="submit">
              РЎРѕС…СЂР°РЅРёС‚СЊ
            </button>

            <Link
              href={`/admin/materials/${material.id}/preview`}
              className={styles.simplePreviewButton}
            >
              РћС‚РєСЂС‹С‚СЊ РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ
            </Link>
          </section>
        </aside>
      </form>
    </div>
  );
}