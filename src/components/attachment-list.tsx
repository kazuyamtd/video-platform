"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { formatFileSize } from "@/lib/format";

type Attachment = { id: string; fileName: string; sizeBytes: number };

/** レッスンの添付ファイル。元のファイル名で保存できるよう、ブラウザで取得してから保存する */
export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  async function download(attachment: Attachment) {
    setDownloadingId(attachment.id);
    setError(undefined);
    try {
      const res = await fetch(`/api/attachments/${attachment.id}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { url, fileName }: { url: string; fileName: string } = await res.json();
      const file = await fetch(url);
      if (!file.ok) throw new Error(`status ${file.status}`);
      const objectUrl = URL.createObjectURL(await file.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error(e);
      setError("ダウンロードに失敗しました。ページを再読み込みしてもう一度お試しください。");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className="mt-8 space-y-2">
      <h2 className="font-semibold">資料ダウンロード</h2>
      <ul className="divide-y rounded-lg border">
        {attachments.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => download(a)}
              disabled={downloadingId !== null}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted disabled:opacity-60"
            >
              <Download className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{a.fileName}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {downloadingId === a.id ? "ダウンロード中…" : formatFileSize(a.sizeBytes)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
