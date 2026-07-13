"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { HomeMaterialCard } from "@/lib/homeMaterials";

import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";

import styles from "../styles/Slider.module.css";

type SliderProps = {
  materials: HomeMaterialCard[];
};

function getVisibleCount() {
  if (typeof window === "undefined") return 3;

  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1100) return 2;

  return 3;
}

export default function Slider({ materials }: SliderProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const items = useMemo(() => {
    return materials.filter((material) => {
      return Boolean(material.href && material.title);
    });
  }, [materials]);

  useEffect(() => {
    function updateCount() {
      setVisibleCount(getVisibleCount());
      setStartIndex(0);
    }

    updateCount();

    window.addEventListener("resize", updateCount);

    return () => {
      window.removeEventListener("resize", updateCount);
    };
  }, []);

  const canSlide = items.length > visibleCount;

  const handlePrev = () => {
    if (!canSlide) return;

    setStartIndex((prev) => {
      const nextIndex = prev - visibleCount;

      return nextIndex < 0 ? Math.max(items.length - visibleCount, 0) : nextIndex;
    });
  };

  const handleNext = () => {
    if (!canSlide) return;

    setStartIndex((prev) => {
      const nextIndex = prev + visibleCount;

      return nextIndex >= items.length ? 0 : nextIndex;
    });
  };

  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <section className={styles.materials}>
      <div className={styles.materials__container}>
        <div className={styles.materials__inner}>
          <HeaderText className={`header__style ${styles.materials_header}`}>
            Последние материалы
          </HeaderText>

          {items.length > 0 ? (
            <div className={styles.materials__slider}>
              <button
                className={`${styles.slider__arrow} ${styles.slider__arrow__left}`}
                onClick={handlePrev}
                type="button"
                aria-label="Предыдущие материалы"
                disabled={!canSlide}
              >
                ‹
              </button>

              <div className={styles.materials__track}>
                {visibleItems.map((item) => (
                  <Link className={styles.materials__item} key={item.id} href={item.href}>
                    <img
                      src={item.imageUrl}
                      className={styles.materials__item__img}
                      alt={item.title}
                      onError={(event) => {
                        event.currentTarget.src = "/images/materials__img__1.png";
                      }}
                    />

                    <div className={styles.materials__item__text}>
                      <div className={styles.materials__item__meta}>
                        <span className={styles.materials__item__header}>
                          {item.typeLabel}
                        </span>

                        {item.isPremium ? (
                          <span className={styles.materials__item__premium}>
                            Premium
                          </span>
                        ) : null}
                      </div>

                      <div className={styles.materials__item__category}>
                        {item.categoryTitle}
                      </div>

                      <div className={styles.materials__item__subheader}>
                        {item.title}
                      </div>

                      <DescriptionText className={styles.materials__item__description}>
                        {item.description}
                      </DescriptionText>
                    </div>
                  </Link>
                ))}
              </div>

              <button
                className={`${styles.slider__arrow} ${styles.slider__arrow__right}`}
                onClick={handleNext}
                type="button"
                aria-label="Следующие материалы"
                disabled={!canSlide}
              >
                ›
              </button>
            </div>
          ) : (
            <div className={styles.materials__empty}>
              Опубликованные материалы пока не добавлены. Добавь материал в админке
              и включи «Опубликован».
            </div>
          )}
        </div>
      </div>
    </section>
  );
}