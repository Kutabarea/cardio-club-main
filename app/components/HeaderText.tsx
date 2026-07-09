import styles from "../styles/HeaderText.module.css";
import React from "react";

import { type CSSProperties } from "react";

interface HeaderTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  color?: string;
  fontSize?: string;
}

export default function HeaderText({
  children,
  className = "",
  color,
  fontSize,
  ...props
}: HeaderTextProps) {
    const styleVars: CSSProperties = {
        ['--h2-color' as string]: color || '#4480EA',
        ['--h2-fontSize' as string]: fontSize || '2.1875rem',
    }

    return (
        <h2
        style={styleVars}
        className={`${styles.text} ${className}`}
        {...props}
        >
        {children}
        </h2>
    );
}