import Link from "next/link";
import styles from "../styles/Library.module.css";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import Search from "./Search";
import SubHeaderText from "./SubHeaderText";

export default function Library() {
  return (
    <div className={styles.library}>
      <div className="container">
        <div className={styles.library__inner}>
          <HeaderText color="#000">Библиотека ЭКГ</HeaderText>
          <div className={styles.library__items}>
            <Link href="/library/base">
              <div className={styles.library__item}>
                  <SubHeaderText className={styles.library__item__header}>
                    ЭКГ база
                  </SubHeaderText>
                <DescriptionText className={styles.library__item__description}>
                  Вся база ЭКГ, которую надо знать врачу. Зубцы, сегменты,
                  интервалы, патологии, реальные примеры и клиническая
                  интерпретация.
                </DescriptionText>
              </div>
            </Link>
            <div className={styles.library__item}>
              <SubHeaderText className={styles.library__item__header}>
                ЭКГ тренажёр
              </SubHeaderText>
              <DescriptionText className={styles.library__item__description}>
                Плёнки разного уровня для проверки себя. Расшифровки с
                подробными объяснениями после каждой плёнки.
              </DescriptionText>
            </div>
            <div className={styles.library__item}>
              <SubHeaderText className={styles.library__item__header}>
                Патология от А до Я
              </SubHeaderText>
              <DescriptionText className={styles.library__item__description}>
                Интерпретация ЭКГ в клиническом контексте. Диагнозы и примеры
                плёнок.
              </DescriptionText>
            </div>
            <div className={styles.library__item}>
              <SubHeaderText className={styles.library__item__header}>
                Полезные ресурсы
              </SubHeaderText>
              <DescriptionText className={styles.library__item__description}>
                Блоги, книги, статьи и сайты для более глубокого изучения и
                понимания ЭКГ.
              </DescriptionText>
            </div>
          </div>
          <Search title="" className={styles.search}></Search>
        </div>
      </div>
    </div>
  );
}
