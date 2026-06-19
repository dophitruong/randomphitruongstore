export type ProductPriceInput = {
  basePrice: number;
};

export type ProductVariantPriceInput = {
  priceAdjustment?: number | null;
};

export function productBasePrice(product: ProductPriceInput) {
  if (!Number.isFinite(product.basePrice)) {
    throw new Error("Product basePrice is required");
  }

  return product.basePrice;
}

export function productVariantPrice(
  product: ProductPriceInput,
  variant?: ProductVariantPriceInput | null
) {
  return productBasePrice(product) + (variant?.priceAdjustment ?? 0);
}
