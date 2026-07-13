"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";

import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";

import styles from "../styles/Slider.module.css";

export type HomeSliderMaterial = {
  img: string;
  header: string;
  subheader: string;
  description: string;
  href: string;
};

type SliderProps = {
  materials: HomeSliderMaterial[];
};

const fallbackMaterials: HomeSliderMaterial[] = [
  {
    img: "/images/materials__img__1.png",
    header: "Видео",
    subheader: "Типы инфаркта миокарда. Интерпретация тропонинов",
    description:
      'В этой лекции вы найдете ответы на два вопроса: "Какие существуют причины ИМ?" и "Как понимать результаты тропонинов?"',
    href: "/videolecture",
  },
  {
    img: "/images/materials__img__2.png",
    header: "Статья",
    subheader: "QRS и его обличия",
    description:
      "Мы разобрали с вами блокады п.Гиса, ЭОС и гипертрофию левого желудочка. А что их связывает? А связывает их комплекс QRS.",
    href: "/library/base",
  },
  {
    img: "/images/materials__img__3.png",
    header: "Видео",
    subheader:
      "Реноваскулярная артериальная гипертензия. Этиология, патогенез, клиника, диагностика, лечение.",
    description:
      'В этой лекции ответим на два вопроса: "Какие существуют причины ИМ?" и "Как понимать результаты тропонинов?"',
    href: "/videolecture",
  },
];

export default function Slider({ materials }: SliderProps) {
  const items = materials.length > 0 ? materials : fallbackMaterials;
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

    updateCount();
    window.addEventListener("resize", updateCount);

    return () => window.removeEventListener("resize", updateCount);
  }, []);

  const handlePrev = () => {
    setStartIndex((prev) => {
      if (items.length <= visibleCount) return 0;

      return prev - visibleCount < 0
        ? Math.max(items.length - visibleCount, 0)
        : prev - visibleCount;
    });
  };

  const handleNext = () => {
    setStartIndex((prev) => {
      if (items.length <= visibleCount) return 0;

      return prev + visibleCount >= items.length ? 0 : prev + visibleCount;
    });
  };

  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <div className={styles.materials}>
      <div className={styles.materials__container}>
        <div className={styles.materials__inner}>
          <button
            className={`${styles.slider__arrow} ${styles.slider__arrow__left}`}
            onClick={handlePrev}
            type="button"
            aria-label="Предыдущие материалы"
          >
            ‹
          </button>

          <HeaderText className={`header__style ${styles.materials_header}`}>
            Последние материалы
          </HeaderText>

          <div className={styles.materials__slider}>
            {visibleItems.map((item) => (
              <Link className={styles.materials__item} key={item.href} href={item.href}>
                <img
                  src={item.img}
                  className={styles.materials__item__img}
                  alt={item.subheader}
                />

                <div className={styles.materials__item__text}>
                  <div className={styles.materials__item__header}>
                    {item.header}
                  </div>

                  <div className={styles.materials__item__subheader}>
                    {item.subheader}
                  </div>

                  <DescriptionText className={styles.materials__item__description}>
                    {item.description}
                  </DescriptionText>
                </div>
              </Link>
            ))}

            <button
              className={`${styles.slider__arrow} ${styles.slider__arrow__right}`}
              onClick={handleNext}
              type="button"
              aria-label="Следующие материалы"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}