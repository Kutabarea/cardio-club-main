import founderImg from "../../public/images/founder__img.png";
import specialistImg from "../../public/images/specialist__img.png";
import introImg from "../../public/images/intro__img.png";
import answersIcon from "../../public/images/answers__icon.png";

import styles from "../styles/Cooperation.module.css";
import DescriptionText from "./DescriptionText";
import Image from "next/image";
import SubHeaderText from "./SubHeaderText";
import HeaderText from "./HeaderText";
import Input from "./Input";
import Textarea from "./Textarea";

export default function Cooperation() {
  return (
    <div className={styles.cooperation}>
      <div className="container">
        <div className={styles.cooperation__inner}>
          <div className={styles.founder__card}>
            <div className={styles.founder__card__inner}>
              <Image
                src={founderImg}
                alt=""
                className={styles.founder__img}
              ></Image>
              <div className={styles.founder__text}>
                <SubHeaderText className={styles.founder__name}>
                  Рудь
                </SubHeaderText>
                <SubHeaderText className={styles.founder__lastname}>
                  Руслан
                </SubHeaderText>
                <SubHeaderText className={styles.founder__patronymic}>
                  Сергеевич
                </SubHeaderText>
                <SubHeaderText color="#4480EA" className={styles.founder__role}>
                  основатель
                </SubHeaderText>
                <DescriptionText
                  fontWeight="500"
                  className={styles.founder__description}
                >
                  Врач-кардиолог, ассистент кафедры факультетской терапии №1
                  Сеченовского университета, член РКО, автор книги «Препараты в
                  кардиологии» и курса «ЭКГ не враг». Автор лекций по
                  кардиологии и терапии.
                </DescriptionText>
              </div>
            </div>
          </div>
          <div className={styles.specialists}>
            <HeaderText color="#000" className={styles.specialists__title}>
              Специалисты
            </HeaderText>
            <div className={styles.specialists__cards}>
              <div className={styles.specialist__card}>
                <Image
                  src={specialistImg}
                  alt=""
                  className={styles.specialist__img}
                ></Image>
                <div className={styles.specialist__text}>
                  <SubHeaderText className={styles.specialist__lastname}>
                    Юнг
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__name}>
                    Александр
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__patronymic}>
                    Григорьевич
                  </SubHeaderText>
                  <SubHeaderText
                    color="#4480EA"
                    className={styles.specialist__role}
                  >
                    специалист
                  </SubHeaderText>
                  <DescriptionText
                    fontWeight="500"
                    className={styles.specialist__description}
                  >
                    Врач экстренной и неотложной помощи, PGY2 aka резидент
                    второго года в программе Family Medicine в NYс, Emergency
                    Department. Автор популярного блога по кардиологии в VK.
                  </DescriptionText>
                </div>
              </div>
              <div className={styles.specialist__card}>
                <Image
                  src={specialistImg}
                  alt=""
                  className={styles.specialist__img}
                ></Image>
                <div className={styles.specialist__text}>
                  <SubHeaderText className={styles.specialist__lastname}>
                    Юнг
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__name}>
                    Александр
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__patronymic}>
                    Григорьевич
                  </SubHeaderText>
                  <SubHeaderText
                    color="#4480EA"
                    className={styles.specialist__role}
                  >
                    специалист
                  </SubHeaderText>
                  <DescriptionText
                    fontWeight="500"
                    className={styles.specialist__description}
                  >
                    Врач экстренной и неотложной помощи, PGY2 aka резидент
                    второго года в программе Family Medicine в NYс, Emergency
                    Department. Автор популярного блога по кардиологии в VK.
                  </DescriptionText>
                </div>
              </div>
              <div className={styles.specialist__card}>
                <Image
                  src={specialistImg}
                  alt=""
                  className={styles.specialist__img}
                ></Image>
                <div className={styles.specialist__text}>
                  <SubHeaderText className={styles.specialist__lastname}>
                    Юнг
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__name}>
                    Александр
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__patronymic}>
                    Григорьевич
                  </SubHeaderText>
                  <SubHeaderText
                    color="#4480EA"
                    className={styles.specialist__role}
                  >
                    специалист
                  </SubHeaderText>
                  <DescriptionText
                    fontWeight="500"
                    className={styles.specialist__description}
                  >
                    Врач экстренной и неотложной помощи, PGY2 aka резидент
                    второго года в программе Family Medicine в NYс, Emergency
                    Department. Автор популярного блога по кардиологии в VK.
                  </DescriptionText>
                </div>
              </div>
              <div className={styles.specialist__card}>
                <Image
                  src={specialistImg}
                  alt=""
                  className={styles.specialist__img}
                ></Image>
                <div className={styles.specialist__text}>
                  <SubHeaderText className={styles.specialist__lastname}>
                    Юнг
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__name}>
                    Александр
                  </SubHeaderText>
                  <SubHeaderText className={styles.specialist__patronymic}>
                    Григорьевич
                  </SubHeaderText>
                  <SubHeaderText
                    color="#4480EA"
                    className={styles.specialist__role}
                  >
                    специалист
                  </SubHeaderText>
                  <DescriptionText
                    fontWeight="500"
                    className={styles.specialist__description}
                  >
                    Врач экстренной и неотложной помощи, PGY2 aka резидент
                    второго года в программе Family Medicine в NYс, Emergency
                    Department. Автор популярного блога по кардиологии в VK.
                  </DescriptionText>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.partnership}>
            <HeaderText className={styles.partnership__header} color="#000">
              Сотрудничество
            </HeaderText>
            <div className={styles.partnership__inner}>
              <div className={styles.partnership__text}>
                <DescriptionText className={styles.partnership__description}>
                  Если вы хотите стать специалистом нашего проекта, писать
                  статьи и экспертные материалы, создать совместный курс или
                  предложить идею для улучшения проекта, заполните заявку и мы
                  свяжемся с вами.
                </DescriptionText>
                <Input placeholder="Имя и фамилия"></Input>
                <Input placeholder="Номер телефона"></Input>
                <Input placeholder="E-mail"></Input>
                <Textarea placeholder="Расскажите о том, как хотите посотрудничать..."></Textarea>
              </div>
              <Image
                alt=""
                src={introImg}
                className={styles.partnership__img}
              ></Image>
            </div>
          </div>
          <div className={styles.answers}>
            <div className={styles.answers__inner}>
              <HeaderText color="#000" className={styles.answers__header}>
                Ответы на вопросы
              </HeaderText>
              <div className={styles.answers__items}>
                <div className={styles.answers__item}>
                  <SubHeaderText className={styles.answers__item__header}>
                    Для чего нужна подписка?
                  </SubHeaderText>
                  <div className={styles.answers__item__text}>
                    <Image
                      src={answersIcon}
                      alt=""
                      className={styles.answers__item__icon}
                    ></Image>
                    <DescriptionText
                      className={styles.answers__item__description}
                      fontWeight="500"
                    >
                      После оформления подписки вам откроются все статьи в
                      полном объёме, конспекты к каждой лекции и скидки для
                      членов CardioClub. Это поможет вам успешнее осваивать
                      материал и применять его на практике, так как с подпиской
                      вам открываются реальные кейсы из практики.
                    </DescriptionText>
                  </div>
                </div>
                <div className={styles.answers__item}>
                  <SubHeaderText className={styles.answers__item__header}>
                    Можно ли стать частью команды Cardio Club?{" "}
                  </SubHeaderText>
                  <div className={styles.answers__item__text}>
                    <Image
                      src={answersIcon}
                      alt=""
                      className={styles.answers__item__icon}
                    ></Image>
                    <DescriptionText
                      className={styles.answers__item__description}
                      fontWeight="500"
                    >
                      Да, для этого нужно заполнить форму выше и рассказать о
                      своих идеях.
                    </DescriptionText>
                  </div>
                </div>
                <div className={styles.answers__item}>
                  <SubHeaderText className={styles.answers__item__header}>
                    Могу ли я отменить подписку?{" "}
                  </SubHeaderText>
                  <div className={styles.answers__item__text}>
                    <Image
                      src={answersIcon}
                      alt=""
                      className={styles.answers__item__icon}
                    ></Image>
                    <DescriptionText
                      className={styles.answers__item__description}
                      fontWeight="500"
                    >
                      Да, это можно сделать в любой момент в вашем личном
                      кабинете.
                    </DescriptionText>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
