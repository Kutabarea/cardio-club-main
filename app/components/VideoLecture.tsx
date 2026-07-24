import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

import styles from "../styles/VideoLecture.module.css";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import SubHeaderText from "./SubHeaderText";

type LectureCardData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isPremium: boolean;
};

function LectureCard({
  lecture,
}: {
  lecture: LectureCardData;
}) {
  return (
    <Link
      href={`/videolecture/${lecture.slug}`}
      className={styles.card}
    >
      {lecture.imageUrl ? (
        <Image
          src={lecture.imageUrl}
          alt=""
          width={360}
          height={210}
          className={styles.cardImage}
        />
      ) : null}

      <div className={styles.cardContent}>
        <div className={styles.cardMeta}>
          <span className={styles.cardType}>Видеолекция</span>

          {lecture.isPremium ? (
            <span className={styles.cardPremium}>Premium</span>
          ) : null}
        </div>

        <SubHeaderText className={styles.cardTitle}>
          {lecture.title}
        </SubHeaderText>

        {lecture.description ? (
          <DescriptionText className={styles.cardDescription}>
            {lecture.description}
          </DescriptionText>
        ) : null}
      </div>
    </Link>
  );
}

export default async function VideoLecture() {
  const [sections, unassignedLectures] = await Promise.all([
    prisma.videoLectureSection.findMany({
      where: {
        isActive: true,
        category: {
          slug: "video-lectures",
          isActive: true,
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          title: "asc",
        },
      ],
      include: {
        materials: {
          where: {
            type: "VIDEO_LECTURE",
            isPublished: true,
          },
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              title: "asc",
            },
          ],
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            imageUrl: true,
            isPremium: true,
          },
        },
      },
    }),

    prisma.material.findMany({
      where: {
        type: "VIDEO_LECTURE",
        isPublished: true,
        videoLectureSectionId: null,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        isPremium: true,
      },
    }),
  ]);

  const totalLectures =
    sections.reduce(
      (total, section) => total + section.materials.length,
      0,
    ) + unassignedLectures.length;

  return (
    <main className={styles.videoLecture}>
      <div className="container">
        <div className={styles.inner}>
          <HeaderText color="#000" className={styles.title}>
            Видеолекции
          </HeaderText>

          <DescriptionText className={styles.description}>
            Выберите тему, чтобы сразу перейти к карточкам нужного раздела.
          </DescriptionText>

          <nav
            className={styles.sectionNavigation}
            aria-label="Разделы видеолекций"
          >
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`#video-section-${section.slug}`}
                className={styles.sectionNavigationLink}
              >
                <span className={styles.sectionNavigationTitle}>
                  {section.title}
                </span>

                <span className={styles.sectionNavigationCount}>
                  {section.materials.length}
                </span>
              </Link>
            ))}

            {unassignedLectures.length > 0 ? (
              <Link
                href="#video-section-unassigned"
                className={styles.sectionNavigationLink}
              >
                <span className={styles.sectionNavigationTitle}>
                  Другие видеолекции
                </span>

                <span className={styles.sectionNavigationCount}>
                  {unassignedLectures.length}
                </span>
              </Link>
            ) : null}
          </nav>

          {totalLectures > 0 ? (
            <div className={styles.sections}>
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={`video-section-${section.slug}`}
                  className={styles.section}
                >
                  <div className={styles.sectionHeader}>
                    <div>
                      <SubHeaderText className={styles.sectionTitle}>
                        {section.title}
                      </SubHeaderText>

                      {section.description ? (
                        <DescriptionText
                          className={styles.sectionDescription}
                        >
                          {section.description}
                        </DescriptionText>
                      ) : null}
                    </div>

                    <span className={styles.sectionCount}>
                      {section.materials.length}
                    </span>
                  </div>

                  {section.materials.length > 0 ? (
                    <div className={styles.grid}>
                      {section.materials.map((lecture) => (
                        <LectureCard
                          key={lecture.id}
                          lecture={lecture}
                        />
                      ))}
                    </div>
                  ) : (
                    <DescriptionText className={styles.sectionEmpty}>
                      В этом разделе пока нет опубликованных лекций.
                    </DescriptionText>
                  )}
                </section>
              ))}

              {unassignedLectures.length > 0 ? (
                <section
                  id="video-section-unassigned"
                  className={styles.section}
                >
                  <div className={styles.sectionHeader}>
                    <div>
                      <SubHeaderText className={styles.sectionTitle}>
                        Другие видеолекции
                      </SubHeaderText>

                      <DescriptionText
                        className={styles.sectionDescription}
                      >
                        Видеолекции, которым ещё не назначен раздел.
                      </DescriptionText>
                    </div>

                    <span className={styles.sectionCount}>
                      {unassignedLectures.length}
                    </span>
                  </div>

                  <div className={styles.grid}>
                    {unassignedLectures.map((lecture) => (
                      <LectureCard
                        key={lecture.id}
                        lecture={lecture}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
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