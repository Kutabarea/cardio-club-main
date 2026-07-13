"use client";

import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

import styles from "../styles/Button.module.css";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  name?: string;
  value?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  className?: string;
  color?: string;
};

type ButtonStyleProps = Pick<
  ButtonProps,
  | "fontSize"
  | "padding"
  | "borderRadius"
  | "backgroundColor"
  | "hoverBackgroundColor"
  | "color"
>;

function getStyleVars({
  fontSize,
  padding,
  borderRadius,
  color,
  backgroundColor,
  hoverBackgroundColor,
}: ButtonStyleProps) {
  return {
    "--button-font-size": fontSize || "1.25rem",
    "--button-padding": padding || ".9375rem 1.5625rem",
    "--button-border-radius": borderRadius || ".625rem",
    "--button-color": color || "#fff",
    "--button-background-color": backgroundColor || "#4480EA",
    "--button-hover-background-color": hoverBackgroundColor || "#3568C3",
  } as CSSProperties;
}

export default function Button({
  children,
  href,
  target,
  rel,
  type = "button",
  disabled,
  name,
  value,
  onClick,
  fontSize,
  padding,
  borderRadius,
  backgroundColor,
  hoverBackgroundColor,
  className = "",
  color,
}: ButtonProps) {
  const styleVars = getStyleVars({
    fontSize,
    padding,
    borderRadius,
    backgroundColor,
    hoverBackgroundColor,
    color,
  });

  const buttonClassName = `${className} ${styles.button}`;

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={buttonClassName}
        style={styleVars}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClassName}
      style={styleVars}
      type={type}
      disabled={disabled}
      name={name}
      value={value}
      onClick={onClick}
    >
      {children}
    </button>
  );
}