import {
  resolveMaterialVideoSource,
} from "@/lib/videoEmbed";

import styles from "@/app/styles/MaterialVideoPlayer.module.css";

type MaterialVideoPlayerProps = {
  url: string;
  title: string;
  poster?: string | null;
};

export default function MaterialVideoPlayer({
  url,
  title,
  poster,
}: MaterialVideoPlayerProps) {
  const source = resolveMaterialVideoSource(url);

  if (source.kind === "invalid") {
    return null;
  }

  if (source.kind === "youtube") {
    return (
      <section
        className={styles.player}
        aria-label={`Видео: ${title}`}
      >
        <div className={styles.playerViewport}>
          <iframe
            className={styles.iframe}
            src={source.embedUrl}
            title={`Видео: ${title}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className={styles.playerFooter}>
          <div className={styles.playerInformation}>
            <span>Видео</span>
            <strong>{title}</strong>
          </div>

          <a
            href={source.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            Открыть на YouTube
          </a>
        </div>
      </section>
    );
  }

  if (source.kind === "direct") {
    return (
      <section
        className={styles.player}
        aria-label={`Видео: ${title}`}
      >
        <div className={styles.playerViewport}>
          <video
            className={styles.nativeVideo}
            controls
            preload="metadata"
            playsInline
            poster={poster ?? undefined}
          >
            <source src={source.url} />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        </div>

        <div className={styles.playerFooter}>
          <div className={styles.playerInformation}>
            <span>Видео</span>
            <strong>{title}</strong>
          </div>

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            Открыть отдельно
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.externalCard}>
      <div>
        <span>Видео</span>
        <strong>Этот источник нельзя встроить в плеер</strong>
        <p>
          Видео откроется на сайте, где оно опубликовано.
        </p>
      </div>

      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Открыть видео
      </a>
    </section>
  );
}