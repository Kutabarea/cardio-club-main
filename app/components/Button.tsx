'use client';

import type React from 'react';
import { type ButtonHTMLAttributes, type CSSProperties } from 'react';
import styles from '../styles/Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  className?: string;
  color?: string;
}

export default function Button({
  children,
  fontSize,
  padding,
  borderRadius,
  backgroundColor,
  hoverBackgroundColor,
  className = "",
  type,
  color,

  ...props
}: ButtonProps) {
  const safeType = type ?? 'button';

  const styleVars: CSSProperties = {
    ['--button-font-size' as string]: fontSize || '1.25rem',
    ['--button-padding' as string]: padding || '.9375rem 1.5625rem',
    ['--button-border-radius' as string]: borderRadius || '.625rem',
    ['--button-color' as string]: color || '#fff',
    ['--button-background-color' as string]: backgroundColor || '#4480EA',
    ['--button-hover-background-color' as string]: hoverBackgroundColor || '#3568C3',
  };

  return (
    <button className={`${className} ${styles.button}`} style={styleVars} type={safeType} {...props}>
      {children}
    </button>
  );
}
