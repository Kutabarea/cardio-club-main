import Image from "next/image";
import Link from "next/link";

import styles from "../styles/Base.module.css";

import answersIcon from "../../public/images/answers__icon.png";
import navArrow from "../../public/images/nav__arrow.png";

import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import Search from "./Search";
import SubHeaderText from "./SubHeaderText";

type BaseMaterial = {
  id: string;
  title: string;
  slug: string;
};

type BaseSection = {
  id: string;
  title: string;
  slug: string;
  materials: BaseMaterial[];
};

type BaseProps = {
  sections: BaseSection[];
};

function Base({ sections }: BaseProps) {
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

            <Image src={navArrow} alt="" className={styles.nav__arrow} />

            <Link href="/library/base">
              <SubHeaderText fontSize=".9375rem" color="#4480EA">
                ЭКГ база
              </SubHeaderText>
            </Link>
          </div>

          <div className={styles.base__items}>
            {sections.map((section) => (
              <div key={section.id} className={styles.base__item}>
                <Link
                  href={`/library/base/section/${section.slug}`}
                  className={styles.base__section__link}
                >
                  <SubHeaderText>{section.title}</SubHeaderText>
                </Link>

                <div className={styles.base__paragraphs}>
                  {section.materials.map((material) => (
                    <Link
                      key={material.id}
                      href={`/library/base/${material.slug}`}
                      className={styles.base__paragraph}
                    >
                      <Image
                        alt=""
                        src={answersIcon}
                        className={styles.paragraph__icon}
                      />

                      <DescriptionText>{material.title}</DescriptionText>
                    </Link>
                  ))}

                  {section.materials.length === 0 ? (
                    <div className={styles.base__paragraph}>
                      <Image
                        alt=""
                        src={answersIcon}
                        className={styles.paragraph__icon}
                      />

                      <DescriptionText>Материалы пока не добавлены</DescriptionText>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Search title="" className={styles.search} />
        </div>
      </div>
    </div>
  );
}

export default Base;