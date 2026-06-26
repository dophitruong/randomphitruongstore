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
