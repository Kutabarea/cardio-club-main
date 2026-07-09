'use client';

import type React from 'react';
import { type TextareaHTMLAttributes, type CSSProperties } from 'react';
import styles from '../styles/Textarea.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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

export default function Textarea({
  fontSize,
  padding,
  borderRadius,
  backgroundColor,
  focusBorderColor,
  className = '',
  color,
  disabled = false,
  value = '',
  ...props
}: TextareaProps) {
  const styleVars: CSSProperties = {
    ['--input-font-size' as string]: fontSize || '1rem',
    ['--input-padding' as string]: padding || '.625rem 1rem',
    ['--input-border-radius' as string]: borderRadius || '.5rem',
    ['--input-color' as string]: color || '#000',
    ['--input-background-color' as string]: backgroundColor || '#fff',
    ['--input-focus-border-color' as string]: focusBorderColor || '#4480EA',
  };

  return (
    <textarea
      className={`${className} ${styles.input}`}
      style={styleVars}
      disabled={disabled}
      defaultValue={value}
      {...props}
    />
  );
}
