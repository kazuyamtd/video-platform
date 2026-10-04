import type { AccessType } from "@/lib/constants";

export const ACCESS_LABELS: Record<AccessType, string> = {
  free: "無料",
  purchase: "買い切り",
  subscription: "サブスク",
};

export function formatPrice(jpy: number) {
  return `¥${jpy.toLocaleString("ja-JP")}`;
}

/** 秒 → "12:34" / "1:02:03" */
export function formatDuration(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** バイト数 → "512 KB" / "12.3 MB" */
export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
