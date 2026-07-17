import Link from "next/link";

import DescriptionText from "@/app/components/DescriptionText";
import HeaderText from "@/app/components/HeaderText";
import styles from "@/app/styles/SearchPage.module.css";
import {
  getSearchQueryErrorMessage,
  parseSearchQuery,
  SEARCH_QUERY_MAX_LENGTH,
  searchPublishedMaterials,
  type MaterialSearchResponse,
} from "@/lib/materialSearch";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params?.q)
    ? params.q[0]
    : params?.q;

  const parsedQuery = parseSearchQuery(queryValue);

  let searchResponse: MaterialSearchResponse | null = null;
  let searchFailed = false;

  if (!parsedQuery.isEmpty && parsedQuery.isValid) {
    try {
      searchResponse = await searchPublishedMaterials(parsedQuery.raw);
    } catch {
      searchFailed = true;
    }
  }

  const materials = searchResponse?.results ?? [];
  const totalMatches = searchResponse?.totalMatches ?? 0;
  const validationMessage = getSearchQueryErrorMessage(
    parsedQuery.error,
  );

  return (
    <main className={styles.search}>
      <div className="container">
        <div className={styles.inner}>
          <HeaderText color="#000" className={styles.title}>
            Поиск по сайту
          </HeaderText>

          <DescriptionText className={styles.description}>
            Найдите статьи, материалы ЭКГ базы, видеолекции и другие
            разделы Cardio Club.
          </DescriptionText>

          <form action="/search" method="get" className={styles.form}>
            <input
              className={styles.input}
              type="search"
              name="q"
              defaultValue={parsedQuery.raw}
              placeholder="Введите запрос"
              minLength={2}
              maxLength={SEARCH_QUERY_MAX_LENGTH}
              autoComplete="off"
              aria-label="Поисковый запрос"
            />

            <button className={styles.button} type="submit">
              Найти
            </button>

            {!parsedQuery.isEmpty ? (
              <Link href="/search" className={styles.reset}>
                Сбросить
              </Link>
            ) : null}
          </form>

          {parsedQuery.isEmpty ? (
            <p className={styles.empty}>
              Введите запрос, например: «QRS», «ритм», «фармакология».
            </p>
          ) : null}

          {!parsedQuery.isEmpty && !parsedQuery.isValid ? (
            <p className={styles.empty}>
              {validationMessage ?? "Некорректный поисковый запрос."}
            </p>
          ) : null}

          {!parsedQuery.isEmpty &&
          parsedQuery.isValid &&
          searchFailed ? (
            <p className={styles.empty}>
              Не удалось выполнить поиск. Попробуйте ещё раз.
            </p>
          ) : null}

          {!parsedQuery.isEmpty &&
          parsedQuery.isValid &&
          !searchFailed ? (
            <section className={styles.results}>
              <h2 className={styles.resultsTitle}>
                Результаты поиска: {totalMatches}
              </h2>

              {materials.length > 0 ? (
                <div className={styles.list}>
                  {materials.map((material) => (
                    <Link
                      key={material.id}
                      href={material.href}
                      className={styles.card}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.type}>
                          {material.typeLabel}
                        </span>

                        {material.category ? (
                          <span className={styles.category}>
                            {material.category.title}
                          </span>
                        ) : null}

                        {material.isPremium ? (
                          <span className={styles.premium}>
                            Premium
                          </span>
                        ) : null}
                      </div>

                      <h3 className={styles.cardTitle}>
                        {material.title}
                      </h3>

                      {material.description ? (
                        <p className={styles.cardDescription}>
                          {material.description}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>
                  По запросу «{parsedQuery.raw}» ничего не найдено.
                </p>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}