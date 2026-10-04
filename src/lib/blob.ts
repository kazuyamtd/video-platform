import "server-only";
import { del, issueSignedToken, presignUrl } from "@vercel/blob";

function isBlobUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** 差し替え・削除で不要になった Vercel Blob の画像を消す（外部URLは対象外） */
export async function deleteBlobIfUnused(oldUrl: string | null, newUrl: string | null = null) {
  if (!oldUrl || oldUrl === newUrl || !isBlobUrl(oldUrl)) return;
  try {
    await del(oldUrl);
  } catch (error) {
    // 画像が残るだけなので保存処理は失敗させない
    console.error("Failed to delete blob", oldUrl, error);
  }
}

// ---------- レッスン添付ファイル（非公開ストア） ----------

/** 添付ファイル用の非公開ストアのトークン（サムネイル用の公開ストアとは別） */
export function attachmentsToken() {
  const token = process.env.ATTACHMENTS_READ_WRITE_TOKEN;
  if (!token) throw new Error("ATTACHMENTS_READ_WRITE_TOKEN is not set");
  return token;
}

export async function deleteAttachmentBlobs(pathnames: string[]) {
  if (pathnames.length === 0) return;
  try {
    await del(pathnames, { token: attachmentsToken() });
  } catch (error) {
    // ファイルが残るだけなので削除処理は失敗させない
    console.error("Failed to delete attachment blobs", pathnames, error);
  }
}

/** 数分だけ有効なダウンロードURLを発行する */
export async function presignAttachmentUrl(pathname: string) {
  const validUntil = Date.now() + 5 * 60 * 1000;
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
    token: attachmentsToken(),
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname,
    access: "private",
    validUntil,
  });
  return presignedUrl;
}
