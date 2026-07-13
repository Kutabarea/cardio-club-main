"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { HomeMaterialCard } from "@/lib/homeMaterials";

import DescriptionText from "./DescriptionText";

import styles from "../styles/Slider.module.css";
import HeaderText from "./HeaderText";

type SliderProps = {
  materials: HomeMaterialCard[];
};

function getVisibleCount() {
  if (typeof window === "undefined") return 3;

  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;

  return 3;
}

function getHeaderClass(typeLabel: string) {
  if (typeLabel === "Статья") {
    return `${styles.materials__item__header} ${styles.materials__article}`;
  }

  return styles.materials__item__header;
}

export default function Slider({ materials }: SliderProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const items = useMemo(() => {
    return materials.filter((material) => {
      return Boolean(material.href && material.title && material.imageUrl);
    });
  }, [materials]);

  useEffect(() => {
    const updateCount = () => {
      setVisibleCount(getVisibleCount());
      setStartIndex(0);
    };

    updateCount();

    window.addEventListener("resize", updateCount);

    return () => {
      window.removeEventListener("resize", updateCount);
    };
  }, []);

  const canSlide = items.length > visibleCount;

  const handlePrev = () => {
    if (!canSlide) return;

    setStartIndex((prev) =>
      prev - visibleCount < 0
        ? Math.max(items.length - visibleCount, 0)
        : prev - visibleCount,
    );
  };

  const handleNext = () => {
    if (!canSlide) return;

    setStartIndex((prev) =>
      prev + visibleCount >= items.length ? 0 : prev + visibleCount,
    );
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
            disabled={!canSlide}
          >
            ‹
          </button>

          <HeaderText className={`header__style ${styles.materials_header}`}>
            Последние материалы
          </HeaderText>

          {items.length > 0 ? (
            <div className={styles.materials__slider}>
              {visibleItems.map((item) => (
                <Link
                  className={styles.materials__item}
                  href={item.href}
                  key={item.id}
                >
                  <img
                    src={item.imageUrl}
                    className={styles.materials__item__img}
                    alt={item.title}
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src.endsWith(item.fallbackImageUrl)) {
                        return;
                      }

                      event.currentTarget.src = item.fallbackImageUrl;
                    }}
                  />

                  <div className={styles.materials__item__text}>
                    <div className={getHeaderClass(item.typeLabel)}>
                      {item.typeLabel}
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
    </div>
  );
}