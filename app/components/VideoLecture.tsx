import React from "react";
import styles from "../styles/VideoLecture.module.css";

import HeaderText from "./HeaderText";
import Button from "./Button";
import Link from "next/link";
import videoLectureImg1 from "../../public/images/videolecture__img__1.png";
import videoLectureImg2 from "../../public/images/videolecture__img__2.png";
import videoLectureImg3 from "../../public/images/videolecture__img__3.png";
import videoLectureImg4 from "../../public/images/videolecture__img__4.png";
import videoLectureImg5 from "../../public/images/videolecture__img__5.png";
import videoLectureImg6 from "../../public/images/videolecture__img__6.png";
import videoLectureImg7 from "../../public/images/videolecture__img__7.png";
import videoLectureImg8 from "../../public/images/videolecture__img__8.png";
import videoLectureImg9 from "../../public/images/videolecture__img__9.png";
import videoLectureImg10 from "../../public/images/videolecture__img__10.png";
import videoLectureImg11 from "../../public/images/videolecture__img__11.png";
import videoLectureImg12 from "../../public/images/videolecture__img__12.png";
import videoIcon from "../../public/images/video__icon.png";
import Image from "next/image";
import SubHeaderText from "./SubHeaderText";
import DescriptionText from "./DescriptionText";
import Search from "./Search";

function VideoLecture() {
  return (
    <div className={styles.videolecture}>
      <div className="container">
        <div className={styles.videolecture__header}>
          <HeaderText color="#000">Видеолекции</HeaderText>
          <div className={styles.videolecture__button__wrapper}>
            <Link target="_blank" href="https://vk.com/">
              <Button>Канал в ВК</Button>
            </Link>
            <Link target="_blank" href="https://www.youtube.com/">
              <Button backgroundColor="#8A1A1A">Канал в YouTube</Button>
            </Link>
          </div>
        </div>
        <div className={styles.videolecture__items}>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg1}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Фармакология
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              База кардиофармакологии для тех, кто хочет разобраться в
              механизмах действия препаратов, алгоритмах и дозах.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                9 лекций
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg2}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Пульмонология и ТЭЛА
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              ТЭЛА, ХОБЛ, бронхиальная астма, больничная пневмония: этиология, патогенез, диагностика, лечение.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                4 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg3}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              ЭКГ и аритмии
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Лекции по ЭКГ и аритмиям от базы до сложных патологий простым языком.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                10 лекций
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg4}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Эндокринные причины артериальной гипертензии
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Феохромоцитома и реноваскулярная артериальная гипертензия: этиология, патогенез, диагностика, лечение.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                2 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg5}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              ОКС и инфаркт миокарда
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Лекции для тех, кто хочет разобраться в типах инфаркта миокарда, работе с пациентами с ОКС/ИМ и точно определять ИМ на ЭКГ.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                2 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg6}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Нефрология
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Подробно разбираемся с нефретическим и нефротическим синдромами: этиология, патогенез, диагностика, лечение.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                1 лекция
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg7}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Сердечная недостаточность и РААС
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Погружение в тему СН и РААС. Этиология, основные механизмы, клиническая картина, алгоритмы диагностики и лечение.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                3 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg8}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Гематология
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Лекции о первичном и вторичном гемостазе и анемиях. От патогенеза до лечения.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                3 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg9}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Липиды и атеросклероз
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Всё про метаболизм липидов и дислипидемии. Атеросклероз: патогенез, факторы рисков, осложнения, препараты.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                2 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg10}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Физиология и пропедевтика
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Изучаем сердечный цикл и аускультацию от А до Я. Разбираем потенциала действия синусового узла и рабочего кардиомиоцита.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                4 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg11}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Воспалительные болезни сердца и ревматология
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Инфекционный эндокардит, перикардит, острая ревматическая лихорадка: этиология, патогенез, диагностика, лечение.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                3 лекции
              </DescriptionText>
            </div>
          </div>
          <div className={styles.videolecture__item}>
            <Image
              src={videoLectureImg12}
              alt=""
              className={styles.videolecture__item__img}
            ></Image>
            <SubHeaderText className={styles.videolecture__item__header}>
              Доказательная медицина, обучение и карьера
            </SubHeaderText>
            <DescriptionText className={styles.videolecture__item__description}>
              Цикл лекций для ординаторов и прктикующих врачей: про ординатуру, научную степень и эффективное научное обучение.
            </DescriptionText>
            <div className={styles.videolecture__course}>
              <Image
                src={videoIcon}
                alt=""
                className={styles.videolecture__course__img}
              ></Image>
              <DescriptionText
                className={styles.videolecture__course__description}
              >
                5 лекции
              </DescriptionText>
            </div>
          </div>
        </div>
        <Search title="" className={styles.search}></Search>
      </div>
    </div>
  );
}

export default VideoLecture;
