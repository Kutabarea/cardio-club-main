import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  isExternalContentUrl,
  isSafeContentUrl,
} from "@/lib/contentSecurity";

import styles from "../styles/MarkdownContent.module.css";

type MarkdownContentProps = {
  content?: string | null;
  emptyText?: string;
};

export default function MarkdownContent({
  content,
  emptyText = "Материал пока заполняется.",
}: MarkdownContentProps) {
  if (!content?.trim()) {
    return (
      <div className={styles.markdown}>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href, ...props }) => {
            const safeHref =
              typeof href === "string" && isSafeContentUrl(href)
                ? href
                : undefined;

            return (
              <a
                {...props}
                href={safeHref}
                target={
                  safeHref && isExternalContentUrl(safeHref)
                    ? "_blank"
                    : undefined
                }
                rel={
                  safeHref && isExternalContentUrl(safeHref)
                    ? "noreferrer"
                    : undefined
                }
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}