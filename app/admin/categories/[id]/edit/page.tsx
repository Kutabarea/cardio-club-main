import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { updateCategoryAction } from "../../actions";

import styles from "@/app/styles/Admin.module.css";

export const dynamic = "force-dynamic";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getMessage(error?: string) {
  if (error === "slug-exists") {
    return {
      type: "error",
      text: "Категория с таким slug уже существует. Укажи другой slug.",
    };
  }

  if (error === "title-required") {
    return {
      type: "error",
      text: "Название категории обязательно.",
    };
  }

  return null;
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: EditCategoryPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const message = getMessage(query?.error);

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link href="/admin/categories" className={styles.backLink}>
          ← Назад к категориям
        </Link>

        <h2 className={styles.pageTitle}>Редактировать категорию</h2>
        <p className={styles.pageDescription}>{category.title}</p>
      </div>

      {message && (
        <div className={styles.adminMessageError}>{message.text}</div>
      )}

      <form action={updateCategoryAction} className={styles.form}>
        <input type="hidden" name="id" value={category.id} />

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Название</span>
            <input
              name="title"
              required
              defaultValue={category.title}
              placeholder="Например: ЭКГ тренажёр"
            />
          </label>

          <label className={styles.field}>
            <span>Slug</span>
            <input
              name="slug"
              defaultValue={category.slug}
              placeholder="ecg-trainer"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Описание</span>
          <textarea
            name="description"
            rows={6}
            defaultValue={category.description ?? ""}
            placeholder="Краткое описание категории"
          />
        </label>

        <button className={styles.submitButton} type="submit">
          Сохранить изменения
        </button>
      </form>
    </div>
  );
}