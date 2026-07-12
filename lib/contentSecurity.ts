export const MAX_MATERIAL_CONTENT_LENGTH = 60_000;

const dangerousHtmlTagsPattern =
  /<\s*\/?\s*(script|iframe|object|embed|style|link|meta|base|form|input|button)[^>]*>/gi;

const dangerousHtmlAttributesPattern =
  /\s(on[a-z]+|srcdoc)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

const dangerousUrlAttributePattern =
  /\s(href|src)\s*=\s*(['"]?)\s*(javascript|data|vbscript):[^'"\s>]*/gi;

function hasControlCharacters(value: string) {
  return /[\u0000-\u001F\u007F]/.test(value.replace(/[\n\r\t]/g, ""));
}

export function sanitizeMaterialContent(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(dangerousHtmlTagsPattern, "")
    .replace(dangerousHtmlAttributesPattern, "")
    .replace(dangerousUrlAttributePattern, "");
}

export function isExternalContentUrl(value: string) {
  const trimmedValue = value.trim();

  return /^https?:\/\//i.test(trimmedValue);
}

export function isSafeContentUrl(value?: string | null) {
  if (!value) return false;

  const trimmedValue = value.trim();

  if (!trimmedValue) return false;
  if (hasControlCharacters(trimmedValue)) return false;

  const lowerValue = trimmedValue.toLowerCase();

  if (
    lowerValue.startsWith("javascript:") ||
    lowerValue.startsWith("data:") ||
    lowerValue.startsWith("vbscript:")
  ) {
    return false;
  }

  if (trimmedValue.startsWith("#")) {
    return true;
  }

  if (trimmedValue.startsWith("/") && !trimmedValue.startsWith("//")) {
    return !trimmedValue.includes("\\");
  }

  if (lowerValue.startsWith("mailto:") || lowerValue.startsWith("tel:")) {
    return true;
  }

  try {
    const url = new URL(trimmedValue);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeAssetUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;
  if (hasControlCharacters(trimmedValue)) return null;

  if (trimmedValue.startsWith("/") && !trimmedValue.startsWith("//")) {
    if (trimmedValue.includes("\\")) return null;

    const allowedPrefixes = ["/images/", "/uploads/"];

    return allowedPrefixes.some((prefix) => trimmedValue.startsWith(prefix))
      ? trimmedValue
      : null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeVideoUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;
  if (hasControlCharacters(trimmedValue)) return null;

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}