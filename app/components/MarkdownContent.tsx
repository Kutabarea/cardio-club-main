import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}