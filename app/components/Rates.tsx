"use client";

import Image from "next/image";
import { useState } from "react";

import { activateMockPremiumSubscriptionAction } from "@/app/profile/subscription/actions";

import Button from "./Button";
import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import Input from "./Input";

import styles from "../styles/Rates.module.css";

import checkIcon from "../../public/images/check.png";
import exclamationMark from "../../public/images/exclamation.png";

type SubscriptionStatus = "active" | "inactive";
type PlanValue = "PREMIUM_MONTH" | "PREMIUM_3_MONTH" | "PREMIUM_YEAR";

type RatesProps = {
  status: SubscriptionStatus;
  endsAtText?: string | null;
  planLabel?: string | null;
  message?: string | null;
};

type PlanOption = {
  value: PlanValue;
  label: string;
  priceLabel: string;
  payLabel: string;
};

const planOptions: PlanOption[] = [
  {
    value: "PREMIUM_MONTH",
    label: "1 месяц",
    priceLabel: "980 ₽/мес",
    payLabel: "980 ₽",
  },
  {
    value: "PREMIUM_3_MONTH",
    label: "3 месяца",
    priceLabel: "650 ₽/мес",
    payLabel: "1 950 ₽",
  },
  {
    value: "PREMIUM_YEAR",
    label: "12 месяцев",
    priceLabel: "430 ₽/мес",
    payLabel: "5 160 ₽",
  },
];

const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Активна",
  inactive: "Неактивна",
};

export default function Rates({
  status,
  endsAtText,
  planLabel,
  message,
}: RatesProps) {
  const isActive = status === "active";
  const [selectedPlan, setSelectedPlan] = useState<PlanValue>("PREMIUM_MONTH");

  const selectedPlanData =
    planOptions.find((plan) => plan.value === selectedPlan) ?? planOptions[0];

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

      {message ? <p className={styles.profile__success}>{message}</p> : null}

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

              {planLabel ? <span>Текущий тариф: {planLabel}</span> : null}

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

        <form
          action={activateMockPremiumSubscriptionAction}
          className={styles.rates__subscription__block}
        >
          <input type="hidden" name="plan" value={selectedPlan} />

          <div className={styles.rates__items}>
            {planOptions.map((plan) => (
              <Button
                key={plan.value}
                type="button"
                color="#4480EA"
                backgroundColor="#F4F7FF"
                fontSize="15px"
                className={`${styles.rate__item} ${
                  selectedPlan === plan.value ? styles.rate__item_active : ""
                }`}
                onClick={() => setSelectedPlan(plan.value)}
              >
                {plan.label}
                <span className={styles.price}>{plan.priceLabel}</span>
              </Button>
            ))}
          </div>

          <div className={styles.rates__pay}>
            <Button
              type="submit"
              backgroundColor="#4CAF50"
              padding=".75rem 1rem"
              fontSize="15px"
              className={styles.rates__buy__btn}
            >
              Оплатить
              <span className={styles.price}>{selectedPlanData.payLabel}</span>
            </Button>

            <Input
              name="promoCode"
              fontSize="15px"
              placeholder="Промокод?"
              className={styles.rates__pay__input}
            />

            <Button type="button" className={styles.rates__pay__btn}>
              Применить
            </Button>

            <DescriptionText className={styles.rates__pay__text}>
              Сейчас кнопка работает в demo-режиме: она активирует Premium в БД
              без реальной оплаты. После подключения платёжной системы это место
              заменим на настоящий checkout.
            </DescriptionText>
          </div>
        </form>
      </div>
    </div>
  );
}