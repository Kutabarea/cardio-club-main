import SignUpForm from "./SignUpForm";
import styles from '../styles/Community.module.css';
import starImg from '../../public/images/star__img.png';

import subscriptionImg1 from '../../public/images/subscription__img__1.png';
import subscriptionImg2 from '../../public/images/subscription__img__2.png';
import subscriptionImg3 from '../../public/images/subscription__img__3.png';

import DescriptionText from "./DescriptionText";

import Image from "next/image";
import HeaderText from "./HeaderText";
import SubHeaderText from "./SubHeaderText";

export default function Community() {
  return (
    <div className={styles.community}>
        <div className={`container ${styles.container}`}>
            <HeaderText className={styles.header}>
                Станьте частью сообщества профессионалов
                <DescriptionText className={styles.header__text}>
                  Пос ле подписки вы получите доступ к конспектам всех бесплатных лекций, ко всем полезным шкалам и калькулятором, а также станете обладателем постоянной скидки члена клуба RuslanCardio academy!
                </DescriptionText>
            </HeaderText>
             <div className={styles.community__inner}>
                <div className={styles.register__form__wrapper}>
                    <SignUpForm></SignUpForm>
                </div>
                <div className={styles.subscription}>
                    <DescriptionText className={styles.subscription__description}>
                        После регистрации вы будете в курсе всех новых полезных материалов, статей и обновлений сайта, у вас появится личный кабинет, в котором вы сможете оформить подписку на эксклюзивные материалы и дополнительные функции. 
                    </DescriptionText>
                    <SubHeaderText className={styles.subscription__header}>
                        Что такое подписка и зачем её оформлять?
                    </SubHeaderText>
                    <div className={styles.subscription__subheader}>
                        Подписка открывает вам доступ к:
                    </div>
                    <div className={styles.subscription__items}>
                        <div className={styles.subscription__item}>
                            <Image className={styles.subscription__item__img} alt='' src={subscriptionImg1}></Image>
                            <div className={styles.subscription__item__text}>
                                <div className={styles.subscription__item__header}>
                                    <Image className={styles.star__img} src={starImg} alt=''></Image>
                                    Полной версии каждой статьи
                                </div>
                                <DescriptionText className={styles.subscription__item__description}>
                                    Примеры плёнок, реальные кейсы и клинические случаи с их разборами к каждой статье. Помогут вам лучше понять теоретический материал и использовать это в практике.
                                </DescriptionText>
                            </div>
                        </div>
                         <div className={styles.subscription__item}>
                            <Image className={styles.subscription__item__img} alt='' src={subscriptionImg2}></Image>
                            <div className={styles.subscription__item__text}>
                                <div className={styles.subscription__item__header}>
                                                                    <Image className={styles.star__img} src={starImg} alt=''></Image>

                                    Конспектам к каждой лекции
                                </div>
                                <DescriptionText className={styles.subscription__item__description}>
                                    В конспектах: таблицы, схемы, рисунки и дополнения по теме лекции. Файлы можно скачать, сохранить себе и повторять тему, когда нужно. 
                                </DescriptionText>
                            </div>
                        </div>
                         <div className={styles.subscription__item}>
                            <Image className={styles.subscription__item__img} alt='' src={subscriptionImg3}></Image>
                            <div className={styles.subscription__item__text}>
                                <div className={styles.subscription__item__header}>
                                                                    <Image className={styles.star__img} src={starImg} alt=''></Image>

                                    Скидкам члена Cardio Club
                                </div>
                                <DescriptionText className={styles.subscription__item__description}>
                                    В академии RuslanCardio выходят новые обучающие программы и книги. Вы будете получать лучшие скидки на курсы и материалы.
                                </DescriptionText>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}