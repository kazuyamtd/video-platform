import "server-only";
import { del } from "@vercel/blob";

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
