import styles from "../styles/DescriptionText.module.css";
import React from "react";

import { type CSSProperties } from "react";

interface DescriptionTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
  color?: string;
  fontWeight?: string;
}

export default function DescriptionText({
  children,
  className = "",
  color,
  fontWeight,
  ...props
}: DescriptionTextProps) {
    const styleVars: CSSProperties = {
        ['--p-color' as string]: color || '#000',
        ['--p-fontWeight' as string]: fontWeight || '400',
    }

    return (
        <p
        style={styleVars}
        className={`${styles.text} ${className}`}
        {...props}
        >
        {children}
        </p>
    );
}