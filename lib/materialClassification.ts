export const CONTENT_MATERIAL_TYPES = [
  "NEWS",
  "VIDEO_LECTURE",
  "ECG_ARTICLE",
  "VIDEO_COURSE",
  "LITERATURE",
  "HELPER",
] as const;

export type ContentMaterialType =
  (typeof CONTENT_MATERIAL_TYPES)[number];

export const CONTENT_SUBSECTION_KINDS = [
  "NONE",
  "ECG",
  "VIDEO_LECTURE",
] as const;

export type ContentSubsectionKind =
  (typeof CONTENT_SUBSECTION_KINDS)[number];

export function isContentMaterialType(
  value: string,
): value is ContentMaterialType {
  return (
    CONTENT_MATERIAL_TYPES as readonly string[]
  ).includes(value);
}

export function isContentSubsectionKind(
  value: string,
): value is ContentSubsectionKind {
  return (
    CONTENT_SUBSECTION_KINDS as readonly string[]
  ).includes(value);
}