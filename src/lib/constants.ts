export const ACCESS_TYPES = ["free", "purchase", "subscription"] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];

export const THUMBNAIL_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;
