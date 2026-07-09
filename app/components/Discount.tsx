import React from "react";
import styles from "../styles/Discount.module.css";
import HeaderText from "./HeaderText";

import discountIcon from "../../public/images/discount__icon.png";
import discountImg1 from "../../public/images/discount__img__1.png";
import discountImg2 from "../../public/images/discount__img__2.png";

import DescriptionText from "./DescriptionText";

import Image from "next/image";
import Button from "./Button";

export default function Discount() {
  return (
    <div className={styles.discount}>
       <HeaderText color="#000" className={styles.discount__header}>
          Ваши скидки
      </HeaderText>
      <div className={styles.discount__item}> 
        <div className={styles.discount__item__content}>
          <div className={styles.discount__upper__mobile__block}>
             <div className={styles.discount__item__left__mobile}>
              <Image
                src={discountIcon}
                alt=""
                className={styles.discount__item__icon}
              ></Image>
                <div className={styles.discount__text__block}>
                  <DescriptionText
                    color="#4480EA"
                    className={styles.discount__item__header}
                    >
                    Скидка - 20% на курс «ЭКГ не враг»
                  </DescriptionText>
                  <DescriptionText className={styles.discount__item__description}>
                    Читай ЭКГ без ошибок и зубрежки.
                  </DescriptionText>
                </div>
              </div>
              <Image
                src={discountImg1}
                alt=""
                className={styles.discount__item__img__mobile}
              ></Image>
          </div>
          <Button fontSize=".9375rem" padding="1rem 4rem">Использовать</Button>
        </div>
         <Image
        src={discountImg1}
        alt=""
        className={styles.discount__item__img}
      ></Image>
      </div>
      <div className={styles.discount__item}> 
        <div className={styles.discount__item__content}>
          <div className={styles.discount__upper__mobile__block}>
             <div className={styles.discount__item__left__mobile}>
              <Image
                src={discountIcon}
                alt=""
                className={styles.discount__item__icon}
              ></Image>
                <div className={styles.discount__text__block}>
                  <DescriptionText
                    color="#4480EA"
                    className={styles.discount__item__header}
                    >
                    Скидка - 20% на курс «ЭКГ не враг»
                  </DescriptionText>
                  <DescriptionText className={styles.discount__item__description}>
                    Читай ЭКГ без ошибок и зубрежки.
                  </DescriptionText>
                </div>
              </div>
              <Image
                src={discountImg2}
                alt=""
                className={styles.discount__item__img__mobile}
              ></Image>
          </div>
          <Button fontSize=".9375rem" padding="1rem 4rem">Использовать</Button>
        </div>
         <Image
        src={discountImg2}
        alt=""
        className={styles.discount__item__img}
      ></Image>
      </div>
     
    </div>
  );
}
