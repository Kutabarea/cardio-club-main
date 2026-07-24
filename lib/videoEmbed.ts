const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const DIRECT_VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|ogv)$/i;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const YOUTUBE_PATH_TYPES = new Set([
  "embed",
  "shorts",
  "live",
  "v",
]);

export type MaterialVideoSource =
  | {
      kind: "youtube";
      originalUrl: string;
      embedUrl: string;
      videoId: string;
    }
  | {
      kind: "direct";
      url: string;
    }
  | {
      kind: "external";
      url: string;
    }
  | {
      kind: "invalid";
    };

function parseSafeHttpUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/[\u0000-\u001F\u007F]/.test(trimmedValue)) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function parseYouTubeStartTime(value?: string | null) {
  if (!value) {
    return 0;
  }

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/^t=/, "");

  if (!normalizedValue) {
    return 0;
  }

  if (/^\d+$/.test(normalizedValue)) {
    return Number.parseInt(normalizedValue, 10);
  }

  if (/^\d+:\d{1,2}(?::\d{1,2})?$/.test(normalizedValue)) {
    const parts = normalizedValue
      .split(":")
      .map((part) => Number.parseInt(part, 10));

    if (parts.some((part) => !Number.isFinite(part))) {
      return 0;
    }

    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }

    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  const durationMatch = normalizedValue.match(
    /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/,
  );

  if (!durationMatch) {
    return 0;
  }

  const hours = Number.parseInt(durationMatch[1] ?? "0", 10);
  const minutes = Number.parseInt(durationMatch[2] ?? "0", 10);
  const seconds = Number.parseInt(durationMatch[3] ?? "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function extractYouTubeVideoId(url: URL) {
  const hostname = url.hostname.toLowerCase();
  const pathnameParts = url.pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  let videoId: string | null = null;

  if (hostname === "youtu.be" || hostname === "www.youtu.be") {
    videoId = pathnameParts[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(hostname)) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (
      pathnameParts.length >= 2 &&
      YOUTUBE_PATH_TYPES.has(pathnameParts[0])
    ) {
      videoId = pathnameParts[1];
    }
  }

  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
    return null;
  }

  return videoId;
}

function getStartTimeFromUrl(url: URL) {
  const hash = url.hash.startsWith("#")
    ? url.hash.slice(1)
    : url.hash;

  const hashParameters = new URLSearchParams(hash);

  const rawStartTime =
    url.searchParams.get("start") ??
    url.searchParams.get("t") ??
    hashParameters.get("start") ??
    hashParameters.get("t");

  return parseYouTubeStartTime(rawStartTime);
}

export function getYouTubeEmbedUrl(value: string) {
  const url = parseSafeHttpUrl(value);

  if (!url) {
    return null;
  }

  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  const embedUrl = new URL(
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  );

  embedUrl.searchParams.set("rel", "0");
  embedUrl.searchParams.set("playsinline", "1");

  const startTime = getStartTimeFromUrl(url);

  if (startTime > 0) {
    embedUrl.searchParams.set("start", String(startTime));
  }

  return {
    videoId,
    originalUrl: url.toString(),
    embedUrl: embedUrl.toString(),
  };
}

export function resolveMaterialVideoSource(
  value?: string | null,
): MaterialVideoSource {
  if (!value) {
    return {
      kind: "invalid",
    };
  }

  const url = parseSafeHttpUrl(value);

  if (!url) {
    return {
      kind: "invalid",
    };
  }

  const youtubeSource = getYouTubeEmbedUrl(url.toString());

  if (youtubeSource) {
    return {
      kind: "youtube",
      ...youtubeSource,
    };
  }

  if (DIRECT_VIDEO_FILE_PATTERN.test(url.pathname)) {
    return {
      kind: "direct",
      url: url.toString(),
    };
  }

  return {
    kind: "external",
    url: url.toString(),
  };
}