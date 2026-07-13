const emptyContentMarkers = [
  "Материал пока заполняется.",
  "Материал пока заполняется через админку.",
];

export function isMaterialContentFilled(content?: string | null) {
  const normalizedContent = content?.trim();

  if (!normalizedContent) {
    return false;
  }

  return !emptyContentMarkers.some((marker) => {
    return normalizedContent.toLowerCase() === marker.toLowerCase();
  });
}

export function getMaterialContentStatus(content?: string | null) {
  return isMaterialContentFilled(content) ? "filled" : "empty";
}

export function getMaterialContentStatusLabel(content?: string | null) {
  return isMaterialContentFilled(content) ? "Заполнен" : "Пустой";
}