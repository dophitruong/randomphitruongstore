/**
 * Helper to build optimized Cloudinary image URLs.
 * 
 * Cloudinary URL formats:
 * https://res.cloudinary.com/<cloud_name>/image/upload/v12345678/folder/file.jpg
 * https://res.cloudinary.com/<cloud_name>/image/upload/f_auto,q_auto,w_600/v12345678/folder/file.jpg
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryOptions = {}
): string {
  if (!url) return "";
  
  // If not a Cloudinary image URL, return original
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = width || height ? "limit" : undefined
  } = options;

  const transforms: string[] = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  const transformString = transforms.join(",");

  // Check if URL already has transformation params after /image/upload/
  // URL pattern: .../image/upload/(optional_transforms/)v123... or filename
  const uploadIndex = url.indexOf("/image/upload/");
  if (uploadIndex === -1) return url;

  const prefix = url.substring(0, uploadIndex + "/image/upload/".length);
  let rest = url.substring(uploadIndex + "/image/upload/".length);

  // If rest already starts with transformations (e.g. contains f_auto or similar or ends with / before v123/public_id)
  // Let's strip existing f_auto,q_auto,w_xxx transformations if any exist so we replace cleanly
  const restParts = rest.split("/");
  
  // Check if first part of rest is a transformation segment (doesn't start with 'v' followed by digits and contains comma or underscore or width)
  const firstPart = restParts[0];
  const isVersion = /^v\d+$/.test(firstPart);
  
  if (!isVersion && (firstPart.includes(",") || firstPart.includes("_"))) {
    // Already has transformations segment, strip it
    restParts.shift();
    rest = restParts.join("/");
  }

  return `${prefix}${transformString}/${rest}`;
}
