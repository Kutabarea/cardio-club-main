"use client";

import { useEffect } from "react";

function normalize(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";
}

function getTargetFromHeading(textParts: string[]) {
  const headings = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, legend, summary"),
  );

  const heading = headings.find((item) => {
    const text = normalize(item.textContent);

    return textParts.some((part) => text.includes(part));
  });

  if (!heading) {
    return null;
  }

  return heading.closest("section, article, div") ?? heading;
}

function ensureId(target: Element | null, id: string) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  target.id = id;
  target.style.scrollMarginTop = "7rem";

  return target;
}

function getTeamTarget() {
  return ensureId(
    document.getElementById("team") ||
      getTargetFromHeading(["команда", "наша команда", "специалисты"]),
    "team",
  );
}

function getCooperationFormTarget() {
  return ensureId(
    document.getElementById("cooperation-form") ||
      document.querySelector("form") ||
      getTargetFromHeading(["сотрудничество", "заявка", "форма", "связаться"]),
    "cooperation-form",
  );
}

function getFaqTarget() {
  return ensureId(
    document.getElementById("faq") ||
      getTargetFromHeading(["ответы на вопросы", "частые вопросы", "вопросы"]) ||
      document.querySelector("details"),
    "faq",
  );
}

function scrollToHashTarget() {
  const hash = window.location.hash;

  if (!hash) {
    return;
  }

  const target =
    hash === "#team"
      ? getTeamTarget()
      : hash === "#cooperation-form"
        ? getCooperationFormTarget()
        : hash === "#faq"
          ? getFaqTarget()
          : document.querySelector(hash);

  if (!(target instanceof HTMLElement)) {
    return;
  }

  window.setTimeout(() => {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 120);
}

export default function CooperationHashScroll() {
  useEffect(() => {
    scrollToHashTarget();

    window.addEventListener("hashchange", scrollToHashTarget);

    return () => {
      window.removeEventListener("hashchange", scrollToHashTarget);
    };
  }, []);

  return null;
}