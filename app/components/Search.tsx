import styles from "../styles/Search.module.css";
import HeaderText from "./HeaderText";
import DescriptionText from "./DescriptionText";
import SubHeaderText from "./SubHeaderText";

interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string,
  title?: string;
}

export default function Search({
  className = "",
  title = "Поиск по сайту",
  ...props
}: SearchProps) {
  return (
    <div className={`${styles.search} ${className}`} {...props}>
        <div className={styles.search__inner}>
          <HeaderText color="#4480EA" className={`header__style ${styles.search__header}`}>
            {title}
          </HeaderText>
          <SubHeaderText className={styles.search__text}>
            Введите тему, которая вас интересует и найдите полезные статьи на сайте
          </SubHeaderText>
          <input type="text" placeholder="Введите ваш запрос" className={styles.search__input} />
          <DescriptionText className={styles.search__input__text}>
            Например: «Инфаркт миокарда на ЭКГ», «Как высчитать ЧСС?», ЭОС...
          </DescriptionText>
      </div>
    </div>
  );
}