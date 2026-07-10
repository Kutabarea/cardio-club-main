import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "../styles/VideoLecture.module.css";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import SubHeaderText from "./SubHeaderText";

export default async function VideoLecture() {
  const lectures = await prisma.material.findMany({
    where: {
      isPublished: true,
      type: "VIDEO_LECTURE",
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className={styles.videoLecture}>
      <div className="container">
        <div className={styles.inner}>
          <HeaderText color="#000" className={styles.title}>
            Видеолекции
          </HeaderText>

          <DescriptionText className={styles.description}>
            Образовательные видеолекции по кардиологии, ЭКГ, фармакологии и смежным состояниям.
          </DescriptionText>

          {lectures.length > 0 ? (
            <div className={styles.grid}>
              {lectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  href={`/videolecture/${lecture.slug}`}
                  className={styles.card}
                >
                  {lecture.imageUrl && (
                    <Image
                      src={lecture.imageUrl}
                      alt=""
                      width={360}
                      height={210}
                      className={styles.cardImage}
                    />
                  )}

                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardType}>Видеолекция</span>

                      {lecture.isPremium && (
                        <span className={styles.cardPremium}>Premium</span>
                      )}
                    </div>

                    <SubHeaderText className={styles.cardTitle}>
                      {lecture.title}
                    </SubHeaderText>

                    {lecture.description && (
                      <DescriptionText className={styles.cardDescription}>
                        {lecture.description}
                      </DescriptionText>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <DescriptionText className={styles.empty}>
              Видеолекций пока нет.
            </DescriptionText>
          )}
        </div>
      </div>
    </main>
  );
}