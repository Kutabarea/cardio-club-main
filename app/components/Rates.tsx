import Image from "next/image";

import Button from "./Button";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import Input from "./Input";

import styles from "../styles/Rates.module.css";

import checkIcon from "../../public/images/check.png";
import exclamationMark from "../../public/images/exclamation.png";

type SubscriptionStatus = "active" | "inactive";

type RatesProps = {
  status: SubscriptionStatus;
  endsAtText?: string | null;
  planLabel?: string | null;
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Активна",
  inactive: "Неактивна",
};

export default function Rates({
  status,
  endsAtText,
}: RatesProps) {
  const isActive = status === "active";

  return (
    <div className={styles.rates}>
      <div className={styles.profile__header__wrapper}>
        <HeaderText color="#000" className={styles.profile__header}>
          Ваша подписка
        </HeaderText>

        <div className={`${styles.profile__header__marker} ${styles[status]}`}>
          {statusLabels[status]}
        </div>
      </div>

      <div
        className={`${styles.profile__notification__wrapper} ${
          isActive
            ? styles.profile__notification__wrapper_active
            : styles.profile__notification__wrapper_inactive
        }`}
      >
        <Image
          className={styles.profile__notification__marker}
          src={isActive ? checkIcon : exclamationMark}
          alt=""
        />

        <div
          className={`${styles.profile__notification__text} ${
            isActive
              ? styles.profile__notification__text_active
              : styles.profile__notification__text_inactive
          }`}
        >
          {isActive ? (
            <>
              <strong>
                Ура! Ваша подписка активна, у вас есть доступ ко всем материалам на сайте.
              </strong>

              {endsAtText ? (
                <span>Подписка активна до: {endsAtText}</span>
              ) : null}
            </>
          ) : (
            <>
              У вас нет активной подписки. Чтобы оформить подписку, выбирайте
              тарифный план ниже и получайте доступ к полным статьям, конспектам
              лекций и скидкам члена CardioClub.
            </>
          )}
        </div>
      </div>

      <div className={styles.rates__inner}>
        <DescriptionText className={styles.rates__header}>
          Выберите тарифный план
        </DescriptionText>

        <div className={styles.rates__subscription__block}>
          <div className={styles.rates__items}>
            <Button
              color="#4480EA"
              backgroundColor="#F4F7FF"
              fontSize="15px"
              className={styles.rate__item}
            >
              1 месяц<span className={styles.price}>980 ₽/мес</span>
            </Button>

            <Button
              color="#4480EA"
              backgroundColor="#F4F7FF"
              fontSize="15px"
              className={styles.rate__item}
            >
              3 месяца<span className={styles.price}>650 ₽/мес</span>
            </Button>

            <Button
              color="#4480EA"
              backgroundColor="#F4F7FF"
              fontSize="15px"
              className={styles.rate__item}
            >
              3 месяца<span className={styles.price}>430 ₽/мес</span>
            </Button>
          </div>

          <div className={styles.rates__pay}>
            <Button
              backgroundColor="#4CAF50"
              padding=".75rem 1rem"
              fontSize="15px"
              className={styles.rates__buy__btn}
            >
              Оплатить<span className={styles.price}>980 ₽</span>
            </Button>

            <Input
              fontSize="15px"
              placeholder="Промокод?"
              className={styles.rates__pay__input}
            />

            <Button className={styles.rates__pay__btn}>
              Применить
            </Button>

            <DescriptionText className={styles.rates__pay__text}>
              После оформления подписки вам откроются все статьи в полном
              объёме, конспекты к каждой лекции и скидки для членов
              CardioClub.
            </DescriptionText>
          </div>
        </div>
      </div>
    </div>
  );
}