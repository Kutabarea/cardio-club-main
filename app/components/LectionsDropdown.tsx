"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "../styles/LectionsDropdown.module.css";

interface LectionsDropdownProps {
  className?: string;
}

const sections = [
  ["Фармакология", "pharmacology"],
  ["Пульмонология и ТЭЛА", "pulmonology-and-pe"],
  ["ЭКГ и аритмии", "ecg-and-arrhythmias"],
  ["Нефрология", "nephrology"],
  ["ОКС и инфаркт миокарда", "acs-and-myocardial-infarction"],
  ["Гематология", "hematology"],
  ["Сердечная недостаточность и РААС", "heart-failure-and-raas"],
  ["Эндокринные причины артериальной гипертензии", "endocrine-hypertension"],
  ["Липиды и атеросклероз", "lipids-and-atherosclerosis"],
  ["Физиология и пропедевтика", "physiology-and-propaedeutics"],
  [
    "Воспалительные болезни сердца и ревматология",
    "inflammatory-heart-diseases-and-rheumatology",
  ],
  [
    "Доказательная медицина, обучение и карьера",
    "evidence-medicine-education-career",
  ],
] as const;

export default function LectionsDropdown({
  className,
}: LectionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOutside);

    return () => {
      document.removeEventListener("mousedown", closeOutside);
    };
  }, []);

  return (
    <div ref={ref} className={styles.dropdown}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={className || styles.nav__link}
        aria-expanded={open}
      >
        Видеолекции
      </button>

      {open ? (
        <div className={styles.dropdown__inner}>
          {sections.map(([title, slug]) => (
            <Link
              key={slug}
              href={`/videolecture#video-section-${slug}`}
              className={styles.nav__link__item}
              onClick={() => setOpen(false)}
            >
              {title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}