export interface ParsedYoutubeUrl {
  videoId: string;
  start?: number;
}

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function parseStartTime(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const secs = parseInt(trimmed, 10);
    return secs >= 0 ? secs : undefined;
  }
  if (/^\d+s$/i.test(trimmed)) {
    const secs = parseInt(trimmed, 10);
    return secs >= 0 ? secs : undefined;
  }
  const hmsMatch = trimmed.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (hmsMatch && (hmsMatch[1] || hmsMatch[2] || hmsMatch[3])) {
    const hours = parseInt(hmsMatch[1] || "0", 10);
    const mins = parseInt(hmsMatch[2] || "0", 10);
    const secs = parseInt(hmsMatch[3] || "0", 10);
    return hours * 3600 + mins * 60 + secs;
  }
  return undefined;
}

export function isValidYoutubeId(id: string | null | undefined): id is string {
  return typeof id === "string" && YOUTUBE_ID_REGEX.test(id);
}

export function parseYoutubeUrl(rawUrl: string): ParsedYoutubeUrl | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  let videoId: string | null = null;
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host === "www.youtu.be") {
    videoId = segments[0] || null;
  } else if (parsed.pathname === "/watch") {
    videoId = parsed.searchParams.get("v");
  } else if (
    segments.length >= 2 &&
    (segments[0] === "shorts" ||
      segments[0] === "embed" ||
      segments[0] === "live")
  ) {
    videoId = segments[1] || null;
  }

  if (!isValidYoutubeId(videoId)) {
    return null;
  }

  const start =
    parseStartTime(parsed.searchParams.get("t")) ??
    parseStartTime(parsed.searchParams.get("start"));

  return start !== undefined ? { videoId, start } : { videoId };
}
