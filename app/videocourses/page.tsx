/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import HeaderText from "@/app/components/HeaderText";
import Search from "@/app/components/Search";
import SubHeaderText from "@/app/components/SubHeaderText";
import { prisma } from "@/lib/prisma";

import styles from "@/app/styles/VideoCourses.module.css";

export const dynamic = "force-dynamic";

function getFallbackImage(index: number) {
  return `/images/videolecture__img__${(index % 3) + 1}.png`;
}

function getShortDescription(value?: string | null) {
  const text = value?.trim();

  if (!text) return "Курс Cardio Club.";

  return text.length > 190 ? `${text.slice(0, 190).trim()}...` : text;
}

export default async function VideoCoursesPage() {
  const courses = await prisma.material.findMany({
    where: {
      type: "VIDEO_COURSE",
      isPublished: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main className={styles.courses}>
      <div className="container">
        <div className={styles.courses__header}>
          <HeaderText color="#4480EA" className="header__style">
            Видеокурсы
          </HeaderText>

          <SubHeaderText className={styles.courses__subtitle}>
            Обучающие программы Cardio Club. Курсы в записи, материалы для
            самостоятельного обучения и системная прокачка знаний по кардиологии.
          </SubHeaderText>
        </div>

        <Search title="Поиск по курсам и материалам" className={styles.courses__search} />

        {courses.length > 0 ? (
          <div className={styles.courses__grid}>
            {courses.map((course, index) => (
              <Link
                href={`/videocourses/${course.slug}`}
                className={styles.course__card}
                key={course.id}
              >
                <img
                  className={styles.course__image}
                  src={course.imageUrl || getFallbackImage(index)}
                  alt={course.title}
                />

                <div className={styles.course__content}>
                  <div className={styles.course__badges}>
                    <span className={styles.course__badge}>Видеокурс</span>

                    {course.isPremium ? (
                      <span className={styles.course__badgePremium}>Premium</span>
                    ) : (
                      <span className={styles.course__badgeFree}>Free</span>
                    )}
                  </div>

                  <h2>{course.title}</h2>

                  <p>{getShortDescription(course.description || course.content)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.courses__empty}>
            Видеокурсы пока не добавлены. Создай материал в админке с типом
            «Видеокурс».
          </div>
        )}
      </div>
    </main>
  );
}