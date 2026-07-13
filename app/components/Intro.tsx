import Image from "next/image";

import introImg from "../../public/images/intro__img.png";

import Button from "./Button";
import DescriptionText from "./DescriptionText";

import styles from "../styles/Intro.module.css";

export default function Intro() {
  return (
    <div className={styles.intro}>
      <div className="container">
        <div className={styles.intro__inner}>
          <Image className={styles.intro__inner__img} src={introImg} alt="" />

          <div className={styles.intro__inner__block}>
            <h1 className={styles.intro__inner__title}>
              Cardio <span>Club</span>
            </h1>

            <DescriptionText className={styles.intro__inner__text}>
              Cайт для врачей, которые хотят быть в курсе всех новинок кардиологии,
              терапии и качать свои знания в ЭКГ. Присоединяйся к сообществу, где
              ведущие специалисты повышают квалификацию и идут в ногу с новейшими
              исследованиями!
            </DescriptionText>

            <div className={styles.intro__inner__button__wrapper}>
              <Button
                href="/library"
                borderRadius="1rem"
                className={styles.intro__inner__button}
              >
                Поехали!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}