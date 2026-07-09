import styles from '../styles/Helper.module.css';
import Button from './Button';
import DescriptionText from './DescriptionText';

import SubHeaderText from './SubHeaderText';


export default function Helper() {
  return (
    <div>
       <div className={styles.helper}>
            <div className="container">
                <div className={styles.helper__inner}>
                    <div className={styles.helper__items}>
                        <div className={styles.helper__item}>
                            <SubHeaderText color="#4480EA" className={styles.header}>
                                Библиотека ЭКГ
                            </SubHeaderText>
                            <DescriptionText className={styles.description}>
                                Всё, что нужно знать об ЭКГ. От базы до сложных патологий.  С картинками, схемами, примерами плёнок и тестами для самопроверки.
                            </DescriptionText>
                            <div className={styles.button__wrapper}>
                                 <Button
                                className={styles.button}
                                fontSize="0.9375rem"
                                padding="1rem 10rem"
                                borderRadius="0.625rem"
                                >В библиотеку</Button>
                            </div>
                           
                        </div>
                        <div className={styles.helper__item}>
                            <SubHeaderText color="#4480EA" className={styles.header}>
                                Видеолекции
                            </SubHeaderText>
                            <DescriptionText className={styles.description}>
                                Бесплатные лекции по кардиологии, терапии и ЭКГ. Обзор сложных тем с рисунками и дополнительными материалами.
                            </DescriptionText>
                            <div className={styles.button__wrapper}>
                                 <Button
                                className={styles.button}
                                fontSize="0.9375rem"
                                padding="1rem 10rem"
                                borderRadius="0.625rem"
                                >В библиотеку</Button>
                            </div>
                           
                        </div>
                        <div className={styles.helper__item}>
                            <SubHeaderText color="#4480EA" className={styles.header}>
                                Видеокурсы
                            </SubHeaderText>
                            <DescriptionText className={styles.description}>
                                Обучающие программы для врачей. Курсы с в записи и с обратной связью от кураторов.Проверка домашних заданий, баллы НМО.
                            </DescriptionText>
                            <div className={styles.button__wrapper}>
                                 <Button
                                className={styles.button}
                                fontSize="0.9375rem"
                                padding="1rem 10rem"
                                borderRadius="0.625rem"
                                >В библиотеку</Button>
                            </div>
                           
                        </div>
                        <div className={styles.helper__item}>
                            <SubHeaderText className={`${styles.header} ${styles.red}`}>
                                Помощник кардиолога
                            </SubHeaderText>
                            <DescriptionText className={styles.description}>
                                Удобные и полезные в работе таблицы, калькуляторы и схемы, незаменимые для кардиолога.
                            </DescriptionText>
                            <div className={styles.button__wrapper}>
                                 <Button
                                fontSize="0.9375rem"
                                padding="1rem 10rem"
                                borderRadius="0.625rem"
                                backgroundColor="#8A1A1A"
                                className={styles.button}
                                >В библиотеку</Button>
                            </div>  
                           
                        </div>
                       
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
}