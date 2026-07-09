"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import materialImg1 from "../../public/images/materials__img__1.png";
import materialImg2 from "../../public/images/materials__img__2.png";
import materialImg3 from "../../public/images/materials__img__3.png";

import DescriptionText from "./DescriptionText";

import styles from "../styles/Slider.module.css";
import HeaderText from "./HeaderText";

const materials = [
  {
    img: materialImg1,
    header: "Видео",
    subheader: "Типы инфаркта миокарда. Интерпретация тропонинов",
    description:
      'В этой лекции вы найдете ответы на два вопроса: "Какие существуют причины ИМ?" и "Как понимать результаты тропонинов?"',
  },
  {
    img: materialImg2,
    header: "Статья",
    subheader: "QRS и его обличия",
    description:
      `Мы разобрали с вами блокады п.Гиса, ЭОС и гипертрофию левого желудочка. А что их связывает? А связывает их комплекс QRS и его десятки различных форм.
Понимание формирования QRS в грудных отведений — это уровень «джедая»
Давайте просто начнем с того, каким может быть комплекс QRS..."`,
  },
  {
    img: materialImg3,
    header: "Видео",
    subheader:
      "Реноваскулярная артериальная гипертензия. Этиология, патогенез, клиника, диагностика, лечение.",
    description:
      'В этой лекции ответим на два вопроса: "Какие существуют причины ИМ?" и "Как понимать результаты тропонинов?"',
  },
  {
    img: materialImg1,
    header: "Тест",
    subheader: "Типы инфаркта миокарда. Интерпретация тропонинов",
    description:
      'В этой лекции вы найдете ответы на два вопроса: "Какие существуют причины ИМ?" и "Как понимать результаты тропонинов?"',
  },
  {
    img: materialImg2,
    header: "Тест",
    subheader: "QRS и его обличия",
    description:
      "Мы разобрали блокады п.Гиса, ЭОС и гипертрофию левого желудочка. А связывает их комплекс QRS...",
  },
  {
    img: materialImg3,
    header: "Видео",
    subheader:
      "Реноваскулярная артериальная гипертензия. Этиология, патогенез, клиника, диагностика, лечение.",
    description:
      'В этой лекции ответим на два вопроса: "Какие существуют причины ИМ?" и "Как понимать результаты тропонинов?"',
  },
];

export default function Slider() {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateCount(); // Вызываем при монтировании
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev - visibleCount < 0 ? materials.length - visibleCount : prev - visibleCount
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + visibleCount >= materials.length ? 0 : prev + visibleCount
    );
  };

  const visibleItems = materials.slice(startIndex, startIndex + visibleCount);

  return (
    <div className={styles.materials}>
      <div className={styles.materials__container}>
        <div className={styles.materials__inner}>
            <button
        className={`${styles.slider__arrow} ${styles.slider__arrow__left}`}
        onClick={handlePrev}
      >
        ‹
      </button>
          <HeaderText className={`header__style ${styles.materials_header}`}>Последние материалы</HeaderText>
          <div className={styles.materials__slider}>
            {visibleItems.map((item, index) => (
              <div className={styles.materials__item} key={index}>
                <Image
                  src={item.img}
                  className={styles.materials__item__img}
                  alt={item.subheader}
                />
                <div className={styles.materials__item__text}>
                  <div className={styles.materials__item__header}>{item.header}</div>
                  <div className={styles.materials__item__subheader}>
                    {item.subheader}
                  </div>
                  <DescriptionText className={styles.materials__item__description}>
                    {item.description}
                  </DescriptionText>
                </div>
              </div>
            ))}
             <button
                className={`${styles.slider__arrow} ${styles.slider__arrow__right}`}
                onClick={handleNext}
            >
                ›
      </button>
          </div>
        </div>
      </div>
     
    </div>
  );
}
