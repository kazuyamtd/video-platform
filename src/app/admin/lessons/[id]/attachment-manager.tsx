"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_TYPES,
  attachmentExtension,
} from "@/lib/constants";
import { formatFileSize } from "@/lib/format";
import { addAttachment, deleteAttachment } from "../../actions";
import { DeleteButton } from "../../delete-button";

type Attachment = { id: string; fileName: string; sizeBytes: number };

const ACCEPT = Object.keys(ATTACHMENT_TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

/** レッスンの添付ファイルを非公開の Vercel Blob にアップロードして登録する */
export function AttachmentManager({
  lessonId,
  attachments,
}: {
  lessonId: string;
  attachments: Attachment[];
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setMessage(undefined);
    const ext = attachmentExtension(file.name);
    if (!ext) {
      setError("PDF・Word・Excel・PowerPoint・ZIP のファイルを選んでください");
      return;
    }
    if (file.size > ATTACHMENT_MAX_BYTES) {
      setError("ファイルは50MB以下にしてください");
      return;
    }
    setProgress(0);
    try {
      const blob = await upload(`attachments/${lessonId}/${crypto.randomUUID()}.${ext}`, file, {
        access: "private",
        contentType: ATTACHMENT_TYPES[ext],
        handleUploadUrl: "/api/admin/attachment-upload",
        clientPayload: lessonId,
        multipart: file.size > 10 * 1024 * 1024,
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });
      const result = await addAttachment(lessonId, {
        pathname: blob.pathname,
        fileName: file.name,
      });
      if (result?.error) setError(result.error);
      else setMessage(result?.message);
    } catch (e) {
      console.error(e);
      setError("アップロードに失敗しました");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const uploading = progress !== null;

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">添付ファイル</h2>
      {attachments.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                {a.fileName}
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatFileSize(a.sizeBytes)}
                </span>
              </span>
              <DeleteButton action={deleteAttachment.bind(null, a.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">添付ファイルはありません</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? `アップロード中… ${progress}%` : "ファイルを追加"}
        </Button>
        <span className="text-xs text-muted-foreground">
          PDF・Word・Excel・PowerPoint・ZIP、50MBまで。受講できる人だけがダウンロードできます
        </span>
      </div>
      <FormMessage error={error} success={message} />
    </section>
  );
}
