export const ACCESS_TYPES = ["free", "purchase", "subscription"] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];
