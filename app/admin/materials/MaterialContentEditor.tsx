"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "@/app/styles/Admin.module.css";

type MaterialContentEditorProps = {
  defaultValue: string;
};

type EditorMode = "edit" | "preview";

const articleTemplate = `## Кратко

Здесь напишите 2–3 предложения: о чём материал и кому он будет полезен.

## Основная часть

Опишите тему простым языком. Лучше разбивать текст на короткие абзацы.

### На что обратить внимание

- первый важный пункт;
- второй важный пункт;
- третий важный пункт.

> Важно: здесь можно добавить клиническое замечание, предупреждение или акцент.

## Итог

Короткий вывод по материалу.`;

export default function MaterialContentEditor({
  defaultValue,
}: MaterialContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState(defaultValue);
  const [mode, setMode] = useState<EditorMode>("edit");

  function focusTextareaSoon() {
    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }

  function insertBlock(block: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((currentContent) => {
        if (!currentContent.trim()) return block;

        return `${currentContent.trimEnd()}\n\n${block}`;
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);

    const textToInsert = selected.trim()
      ? block.replace("Текст", selected.trim())
      : block;

    const prefix = before.trimEnd() ? "\n\n" : "";
    const suffix = after.trimStart() ? "\n\n" : "";

    const nextContent = `${before.trimEnd()}${prefix}${textToInsert}${suffix}${after.trimStart()}`;

    setContent(nextContent);

    window.setTimeout(() => {
      const nextPosition = `${before.trimEnd()}${prefix}${textToInsert}`.length;
      textarea.focus();
      textarea.setSelectionRange(nextPosition, nextPosition);
    }, 0);
  }

  function wrapSelection(prefix: string, suffix: string, fallback: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((currentContent) => `${currentContent}${prefix}${fallback}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const selected = content.slice(start, end) || fallback;
    const after = content.slice(end);

    const nextContent = `${before}${prefix}${selected}${suffix}${after}`;

    setContent(nextContent);

    window.setTimeout(() => {
      const selectionStart = before.length + prefix.length;
      const selectionEnd = selectionStart + selected.length;

      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  }

  function applyTemplate() {
    if (content.trim()) {
      const confirmed = window.confirm(
        "Заменить текущий текст шаблоном статьи? Текущий текст в поле будет удалён.",
      );

      if (!confirmed) return;
    }

    setContent(articleTemplate);
    setMode("edit");
    focusTextareaSoon();
  }

  return (
    <div className={styles.visualEditor}>
      <input type="hidden" name="content" value={content} />

      <div className={styles.visualEditorTop}>
        <div>
          <h3>Редактор статьи</h3>
          <p>
            Можно писать обычный текст и пользоваться кнопками. Markdown знать не нужно.
          </p>
        </div>

        <div className={styles.visualEditorModeSwitch}>
          <button
            type="button"
            className={mode === "edit" ? styles.visualEditorModeActive : ""}
            onClick={() => setMode("edit")}
          >
            Редактировать
          </button>

          <button
            type="button"
            className={mode === "preview" ? styles.visualEditorModeActive : ""}
            onClick={() => setMode("preview")}
          >
            Предпросмотр
          </button>
        </div>
      </div>

      <div className={styles.visualEditorToolbar}>
        <button type="button" onClick={() => insertBlock("## Новый раздел")}>
          Заголовок
        </button>

        <button type="button" onClick={() => insertBlock("### Подзаголовок")}>
          Подзаголовок
        </button>

        <button type="button" onClick={() => insertBlock("Текст нового абзаца.")}>
          Абзац
        </button>

        <button
          type="button"
          onClick={() => wrapSelection("**", "**", "важный текст")}
        >
          Жирный
        </button>

        <button
          type="button"
          onClick={() => insertBlock("- первый пункт\n- второй пункт\n- третий пункт")}
        >
          Список
        </button>

        <button
          type="button"
          onClick={() => insertBlock("1. первый пункт\n2. второй пункт\n3. третий пункт")}
        >
          Нумерация
        </button>

        <button type="button" onClick={() => insertBlock("> Важная цитата или заметка.")}>
          Цитата
        </button>

        <button
          type="button"
          onClick={() => insertBlock("> Важно: здесь можно добавить предупреждение или акцент.")}
        >
          Важно
        </button>

        <button
          type="button"
          onClick={() => insertBlock("[Текст ссылки](https://example.com)")}
        >
          Ссылка
        </button>

        <button type="button" onClick={() => insertBlock("---")}>
          Разделитель
        </button>

        <button type="button" onClick={applyTemplate}>
          Шаблон статьи
        </button>
      </div>

      {mode === "edit" ? (
        <div className={styles.visualEditorWorkArea}>
          <textarea
            ref={textareaRef}
            className={styles.visualEditorTextarea}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Начните писать текст статьи. Для оформления используйте кнопки сверху."
          />

          <div className={styles.visualEditorTips}>
            <h4>Как работать</h4>

            <ul>
              <li>Пиши текст как в обычном редакторе.</li>
              <li>Для оформления выдели текст и нажми кнопку.</li>
              <li>Для структуры используй заголовки и списки.</li>
              <li>Перед публикацией открой вкладку «Предпросмотр».</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className={styles.visualEditorPreview}>
          {content.trim() ? (
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
          ) : (
            <div className={styles.visualEditorPreviewEmpty}>
              Текст пока не заполнен.
            </div>
          )}
        </div>
      )}
    </div>
  );
}