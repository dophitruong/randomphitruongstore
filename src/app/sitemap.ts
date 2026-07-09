import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getPublicShopProducts } from "@/lib/public-catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/shop",
    "/order-request",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/shipping-policy",
    "/return-refund-policy"
  ];

  const staticEntries = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" || route === "/shop" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1.0 : route === "/shop" ? 0.9 : 0.7
  }));

  try {
    const products = await getPublicShopProducts();
    const productEntries = products.map((product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));
    return [...staticEntries, ...productEntries];
  } catch (error) {
    console.error("[Sitemap] Failed to load dynamic product pages, fallback to static sitemap.", error);
    return staticEntries;
  }
}
