import Link from "next/link";

import styles from "../styles/EcgBase.module.css";
import HeaderText from "./HeaderText";

const sections = [
  {
    title: "База",
    columns: [
      [
        "Частота ЭКГ",
        "ЭКГ ритм",
        "Интервалы на ЭКГ",
        "Электрическая ось сердца",
        "V1 и V2",
      ],
      [
        "Основы детской ЭКГ",
        "ЭКГ при неотложной помощи",
        "Интерпретация ЭКГ",
        "Расположение электродов",
        "Зубцы на ЭКГ",
      ],
    ],
  },
  {
    title: "Зубцы",
    columns: [
      ["Зубец T", "Зубец R", "Зубец Q", "Зубец U"],
      ["Дельта волна", "Волна эпсилон", "Зубец Осборна"],
    ],
  },
  {
    title: "Сегменты и интервалы",
    columns: [
      ["Интервал PR", "Сегмент PR", "Интервал QT"],
      ["Сегмент ST", "Точка J", "Комплекс QRS"],
    ],
  },
  {
    title: "Анатомия ЭКГ",
    columns: [
      ["Увеличение левого предсердия", "Увеличение правого предсердия"],
      ["Гипертрофия обоих предсердий"],
    ],
  },
  {
    title: "Клиническая интерпретация",
    columns: [["Патология от А до Я"], []],
  },
];

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replaceAll("э", "e")
    .replaceAll("ё", "e")
    .replaceAll(" ", "-")
    .replaceAll("ь", "")
    .replaceAll("ъ", "")
    .replaceAll("й", "y")
    .replaceAll("ц", "c")
    .replaceAll("у", "u")
    .replaceAll("к", "k")
    .replaceAll("е", "e")
    .replaceAll("н", "n")
    .replaceAll("г", "g")
    .replaceAll("ш", "sh")
    .replaceAll("щ", "sch")
    .replaceAll("з", "z")
    .replaceAll("х", "h")
    .replaceAll("ф", "f")
    .replaceAll("ы", "y")
    .replaceAll("в", "v")
    .replaceAll("а", "a")
    .replaceAll("п", "p")
    .replaceAll("р", "r")
    .replaceAll("о", "o")
    .replaceAll("л", "l")
    .replaceAll("д", "d")
    .replaceAll("ж", "zh")
    .replaceAll("я", "ya")
    .replaceAll("ч", "ch")
    .replaceAll("с", "s")
    .replaceAll("м", "m")
    .replaceAll("и", "i")
    .replaceAll("т", "t")
    .replaceAll("б", "b")
    .replaceAll("ю", "yu")
    .replaceAll(/[^a-z0-9-]/g, "");
}

export default function EcgBase() {
  return (
    <main className={styles.ecgBase}>
      <div className="container">
        <div className={styles.inner}>
          <HeaderText color="#000" className={styles.title}>
            ЭКГ база
          </HeaderText>

          <div className={styles.breadcrumbs}>
            <Link href="/library">Библиотека ЭКГ</Link>
            <span>›</span>
            <span>ЭКГ база</span>
          </div>

          <div className={styles.sections}>
            {sections.map((section) => (
              <section key={section.title} className={styles.section}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>

                <div className={styles.topicGrid}>
                  {section.columns.map((column, columnIndex) => (
                    <ul key={columnIndex} className={styles.topicList}>
                      {column.map((topic) => (
                        <li key={topic} className={styles.topicItem}>
                          <Link
                            href={`/library/base/${createSlug(topic)}`}
                            className={styles.topicLink}
                          >
                            {topic}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className={styles.searchBlock}>
            <h2 className={styles.searchTitle}>
              Введите тему, которая вас интересует и найдите полезные статьи на сайте
            </h2>

            <input
              className={styles.searchInput}
              type="search"
              placeholder="введите ваш запрос"
            />

            <p className={styles.searchExample}>
              Например: «Инфаркт миокарда на ЭКГ», «Как высчитать ЧСС?», ЭОС ...
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
