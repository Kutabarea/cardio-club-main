import Link from "next/link";

import styles from "../styles/EcgBaseGroupedMaterials.module.css";

type MaterialCard = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  isPremium: boolean;
};

type EcgSectionWithMaterials = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  materials: MaterialCard[];
};

type EcgBaseGroupedMaterialsProps = {
  sections: EcgSectionWithMaterials[];
  uncategorizedMaterials: MaterialCard[];
};

function MaterialLinkCard({ material }: { material: MaterialCard }) {
  return (
    <Link href={`/library/base/${material.slug}`} className={styles.card}>
      <div>
        <h3>{material.title}</h3>

        {material.description ? (
          <p>{material.description}</p>
        ) : (
          <p>Материал ЭКГ базы.</p>
        )}
      </div>

      {material.isPremium ? (
        <span className={styles.premium}>Premium</span>
      ) : (
        <span className={styles.free}>Free</span>
      )}
    </Link>
  );
}

export default function EcgBaseGroupedMaterials({
  sections,
  uncategorizedMaterials,
}: EcgBaseGroupedMaterialsProps) {
  const visibleSections = sections.filter((section) => section.materials.length > 0);
  const hasAnyMaterials = visibleSections.length > 0 || uncategorizedMaterials.length > 0;

  if (!hasAnyMaterials) {
    return null;
  }

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <div className={styles.header}>
          <h2>Материалы ЭКГ базы</h2>

          <p>
            Материалы сгруппированы по подразделам. Подразделы и статьи можно
            менять через админку.
          </p>
        </div>

        <div className={styles.sections}>
          {visibleSections.map((section) => (
            <article key={section.id} className={styles.section}>
              <div className={styles.sectionHeader}>
                <Link href={`/library/base/section/${section.slug}`}>
                  {section.title}
                </Link>

                {section.description ? <p>{section.description}</p> : null}
              </div>

              <div className={styles.grid}>
                {section.materials.map((material) => (
                  <MaterialLinkCard key={material.id} material={material} />
                ))}
              </div>
            </article>
          ))}

          {uncategorizedMaterials.length > 0 ? (
            <article className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Без подраздела</h3>
                <p>Материалы, которым пока не выбран подраздел ЭКГ базы.</p>
              </div>

              <div className={styles.grid}>
                {uncategorizedMaterials.map((material) => (
                  <MaterialLinkCard key={material.id} material={material} />
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}