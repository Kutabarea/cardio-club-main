import styles from "../styles/SubHeaderText.module.css";
import React from "react";

import { type CSSProperties } from "react";

interface SubHeaderProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  color?: string;
  fontSize?: string;
}

export default function SubHeaderText({
  children,
  className = "",
  color,
  fontSize,
  ...props
}: SubHeaderProps) {
    const styleVars: CSSProperties = {
        ['--p-color' as string]: color || '#000',
        ['--p-fontSize' as string]: fontSize || '1.25rem',
    }

    return (
        <h3
        style={styleVars}
        className={`${styles.text} ${className}`}
        {...props}
        >
        {children}
        </h3>
    );
}