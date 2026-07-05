export const DRAFT_PRODUCT_NAME = "Draft product";
export const PRODUCT_DRAFT_SLUG_PREFIX = "draft-";

export type ProductDraftData = {
  nameVi?: string | null;
  nameEn?: string | null;
  slug?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  materialVi?: string | null;
  materialEn?: string | null;
  categoryId?: string | null;
  basePrice?: number | null;
  stockStatus?: string | null;
  images?: string[] | null;
  sizeCharts?: Array<Record<string, unknown>> | null;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function draftSlugForProductId(productId: string) {
  return `${PRODUCT_DRAFT_SLUG_PREFIX}${productId}`;
}

export function isDraftPlaceholderSlug(slug: string, productId?: string | null) {
  if (!slug.startsWith(PRODUCT_DRAFT_SLUG_PREFIX)) {
    return false;
  }

  return !productId || slug === draftSlugForProductId(productId);
}

export function isDraftPlaceholderName(value: string | null | undefined) {
  return value === DRAFT_PRODUCT_NAME;
}

export function hasMeaningfulProductDraftData(input: ProductDraftData) {
  if (
    hasText(input.nameVi) ||
    hasText(input.nameEn) ||
    hasText(input.slug) ||
    hasText(input.descriptionVi) ||
    hasText(input.descriptionEn) ||
    hasText(input.materialVi) ||
    hasText(input.materialEn)
  ) {
    return true;
  }

  if ((input.images ?? []).some((image) => hasText(image))) {
    return true;
  }

  return (input.sizeCharts ?? []).some((sizeChart) =>
    Object.entries(sizeChart).some(([key, value]) => {
      if (key === "unit") {
        return false;
      }

      if (typeof value === "string") {
        return hasText(value);
      }

      if (typeof value === "number") {
        return Number.isFinite(value) && value > 0;
      }

      if (value && typeof value === "object") {
        return Object.values(value).some(
          (measurement) => typeof measurement === "number" && measurement > 0
        );
      }

      return false;
    })
  );
}
