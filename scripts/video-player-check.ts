import fs from "node:fs";
import path from "node:path";

import {
  getYouTubeEmbedUrl,
  parseYouTubeStartTime,
  resolveMaterialVideoSource,
} from "@/lib/videoEmbed";

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function readProjectFile(...parts: string[]) {
  return fs.readFileSync(
    path.join(process.cwd(), ...parts),
    "utf8",
  );
}

function main() {
  const videoId = "M7lc1UVf-VE";

  const supportedYouTubeUrls = [
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtu.be/${videoId}`,
    `https://www.youtube.com/shorts/${videoId}`,
    `https://www.youtube.com/live/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  ];

  for (const url of supportedYouTubeUrls) {
    const result = getYouTubeEmbedUrl(url);

    assertCondition(
      result?.videoId === videoId,
      `YouTube URL was not recognized: ${url}`,
    );

    assertCondition(
      result.embedUrl.startsWith(
        `https://www.youtube-nocookie.com/embed/${videoId}`,
      ),
      `Unsafe YouTube embed URL: ${url}`,
    );
  }

  const timedVideo = getYouTubeEmbedUrl(
    `https://youtu.be/${videoId}?t=1m30s`,
  );

  assertCondition(
    timedVideo?.embedUrl.includes("start=90"),
    "YouTube start time was not preserved",
  );

  assertCondition(
    parseYouTubeStartTime("1:30") === 90,
    "Colon time parser failed",
  );

  assertCondition(
    parseYouTubeStartTime("1h2m3s") === 3723,
    "Duration time parser failed",
  );

  const directVideo = resolveMaterialVideoSource(
    "https://cdn.example.com/lecture.mp4?token=test",
  );

  assertCondition(
    directVideo.kind === "direct",
    "Direct MP4 URL was not recognized",
  );

  const fakeYouTube = resolveMaterialVideoSource(
    `https://youtube.com.example.org/watch?v=${videoId}`,
  );

  assertCondition(
    fakeYouTube.kind === "external",
    "Fake YouTube domain was accepted as YouTube",
  );

  const unsafeSource = resolveMaterialVideoSource(
    "javascript:alert(1)",
  );

  assertCondition(
    unsafeSource.kind === "invalid",
    "Unsafe video URL was accepted",
  );

  const lecturePageSource = readProjectFile(
    "app",
    "videolecture",
    "[slug]",
    "page.tsx",
  );

  const coursePageSource = readProjectFile(
    "app",
    "videocourses",
    "[slug]",
    "page.tsx",
  );

  for (const [name, source] of [
    ["video lecture", lecturePageSource],
    ["video course", coursePageSource],
  ] as const) {
    assertCondition(
      source.includes("MaterialVideoPlayer"),
      `MaterialVideoPlayer is missing from ${name}`,
    );

    assertCondition(
      source.includes("access.canRead"),
      `Premium access check is missing from ${name}`,
    );
  }

  console.log("");
  console.log("Video player audit");
  console.log("------------------");
  console.log("YouTube URL formats: OK");
  console.log("Privacy-enhanced embeds: OK");
  console.log("Start time parsing: OK");
  console.log("Direct video files: OK");
  console.log("Unsafe URL rejection: OK");
  console.log("Premium route integration: OK");
  console.log("");
  console.log("Video player state is OK.");
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Unknown video player audit error",
  );

  process.exitCode = 1;
}