import React from "react";
import styles from "../styles/Base.module.css";
import HeaderText from "./HeaderText";
import SubHeaderText from "./SubHeaderText";
import Image from "next/image";
import Link from "next/link";

import navArrow from "../../public/images/nav__arrow.png";
import answersIcon from "../../public/images/answers__icon.png";
import DescriptionText from "./DescriptionText";
import Search from "./Search";

function Base() {
  return (
    <div className={styles.base}>
      <div className="container">
        <div className={styles.base__inner}>
          <HeaderText color="#000" className={styles.base__header}>
            ЭКГ база
          </HeaderText>
          <div className={styles.nav__block}>
            <Link href="/library">
              <SubHeaderText fontSize=".9375rem" color="#4480EA">
                Библиотека ЭКГ
              </SubHeaderText>
            </Link>
            <Image src={navArrow} alt="" className={styles.nav__arrow}></Image>
            <Link href="/library/base">
              <SubHeaderText fontSize=".9375rem" color="#4480EA">
                ЭКГ база
              </SubHeaderText>
            </Link>
          </div>
          <div className={styles.base__items}>
            <div className={styles.base__item}>
              <SubHeaderText>База</SubHeaderText>
              <div className={styles.base__paragraphs}>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Частота ЭКГ</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Основы детской ЭКГ</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>ЭКГ ритм</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>ЭКГ при неотложной помощи</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Интервалы на ЭКГ</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Интрерпретация ЭКГ</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Электрическая ось сердца</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Расположение электродов</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>V1 и V2</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Зубцы на ЭКГ</DescriptionText>
                </div>
              </div>
            </div>
            <div className={styles.base__item}>
              <SubHeaderText>Зубцы</SubHeaderText>
              <div className={styles.base__paragraphs}>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Зубец Т</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Дельта волна</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Зубец R</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Волна эпсилон</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Зубец Q</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Зубец Осборна</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Зубец U</DescriptionText>
                </div>
              </div>
            </div>
            <div className={styles.base__item}>
              <SubHeaderText>Сегменты и интервалы</SubHeaderText>
              <div className={styles.base__paragraphs}>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Интервал PR</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Сегмент ST</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Сегмент PR</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Точка J</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Интервал QT</DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Комплекс QRS</DescriptionText>
                </div>
              </div>
            </div>
            <div className={styles.base__item}>
              <SubHeaderText>Анатомия ЭКГ</SubHeaderText>
              <div className={styles.base__paragraphs}>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>
                    Увеличение левого предсердия
                  </DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>
                    Гипертрофия обоих предсердий
                  </DescriptionText>
                </div>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>
                    Увеличение правого предсердия
                  </DescriptionText>
                </div>
              </div>
            </div>
            <div className={styles.base__item}>
              <SubHeaderText>Клиническая интерпретация</SubHeaderText>
              <div className={styles.base__paragraphs}>
                <div className={styles.base__paragraph}>
                  <Image
                    alt=""
                    src={answersIcon}
                    className={styles.paragraph__icon}
                  ></Image>
                  <DescriptionText>Паталогия от А до Я</DescriptionText>
                </div>
              </div>
            </div>
          </div>
          <Search title="" className={styles.search}></Search>
        </div>
      </div>
    </div>
  );
}

export default Base;
