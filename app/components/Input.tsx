'use client';

import type React from 'react';
import { type InputHTMLAttributes, type CSSProperties } from 'react';
import styles from '../styles/Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  backgroundColor?: string;
  focusBorderColor?: string;
  className?: string;
  color?: string;
  disabled?: boolean;
  value?: string;
}

export default function Input({
  fontSize,
  padding,
  borderRadius,
  backgroundColor,
  focusBorderColor,
  className = "",
  color,
  disabled = false,
  value = "",
  ...props
}: InputProps) {
  const styleVars: CSSProperties = {
    ['--input-font-size' as string]: fontSize || '1rem',
    ['--input-padding' as string]: padding || '.625rem 1rem',
    ['--input-border-radius' as string]: borderRadius || '.5rem',
    ['--input-color' as string]: color || '#000',
    ['--input-background-color' as string]: backgroundColor || '#fff',
    ['--input-focus-border-color' as string]: focusBorderColor || '#4480EA',
  };

  return (
    <input
      className={`${className} ${styles.input}`}
      style={styleVars}
      disabled={disabled}
      defaultValue={value}
      {...props}
    />
  );
}