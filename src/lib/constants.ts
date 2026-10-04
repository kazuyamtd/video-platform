export const ACCESS_TYPES = ["free", "purchase", "subscription"] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];

export const THUMBNAIL_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;

/** レッスン添付ファイルとして受け付ける拡張子と Content-Type */
export const ATTACHMENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
};
export const ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024;

export function attachmentExtension(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ext in ATTACHMENT_TYPES ? ext : null;
}

/**
 * 保存先パス attachments/<lessonId>/<uuid>.<拡張子> か確認する。
 * Blob SDK の署名URLが ASCII 以外のパスに対応していないため、元のファイル名はパスに含めない
 */
export function isAttachmentPathname(pathname: string, lessonId: string) {
  const prefix = `attachments/${lessonId}/`;
  if (!lessonId || !pathname.startsWith(prefix)) return false;
  const match = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.([a-z]+)$/.exec(
    pathname.slice(prefix.length),
  );
  return !!match && match[1] in ATTACHMENT_TYPES;
}
