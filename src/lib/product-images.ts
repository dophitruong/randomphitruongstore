export const MAX_PRODUCT_IMAGES = 10;

export function isSupportedProductImageUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) {
    return true;
  }

  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function splitProductImageUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export function duplicateProductImageUrlIndex(urls: string[]) {
  const seen = new Set<string>();
  return urls.findIndex((url) => {
    if (seen.has(url)) {
      return true;
    }
    seen.add(url);
    return false;
  });
}

export function removeProductImageUrl(urls: string[], index: number) {
  return urls.filter((_, currentIndex) => currentIndex !== index);
}

export function moveProductImageUrl(
  urls: string[],
  index: number,
  direction: "earlier" | "later"
) {
  const targetIndex = direction === "earlier" ? index - 1 : index + 1;
  if (
    index < 0 ||
    index >= urls.length ||
    targetIndex < 0 ||
    targetIndex >= urls.length
  ) {
    return [...urls];
  }

  const next = [...urls];
  const [selected] = next.splice(index, 1);
  next.splice(targetIndex, 0, selected);
  return next;
}

export function setPrimaryProductImageUrl(urls: string[], index: number) {
  if (index <= 0 || index >= urls.length) {
    return [...urls];
  }

  const next = [...urls];
  const [selected] = next.splice(index, 1);
  return [selected, ...next];
}
