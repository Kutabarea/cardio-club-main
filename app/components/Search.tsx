"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import styles from "../styles/Search.module.css";

import DescriptionText from "./DescriptionText";
import HeaderText from "./HeaderText";
import SubHeaderText from "./SubHeaderText";

interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
}

export default function Search({
  className = "",
  title = "Поиск по сайту",
  ...props
}: SearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
  }

  return (
    <div className={`${styles.search} ${className}`} {...props}>
      <form className={styles.search__inner} onSubmit={submitSearch}>
        <HeaderText
          color="#4480EA"
          className={`header__style ${styles.search__header}`}
        >
          {title}
        </HeaderText>

        <SubHeaderText className={styles.search__text}>
          Введите тему, которая вас интересует и найдите полезные статьи на сайте
        </SubHeaderText>

        <input
          type="text"
          placeholder="Введите ваш запрос"
          className={styles.search__input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <DescriptionText className={styles.search__input__text}>
          Например: «Инфаркт миокарда на ЭКГ», «Как высчитать ЧСС?», ЭОС...
        </DescriptionText>
      </form>
    </div>
  );
}