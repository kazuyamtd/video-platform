"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { THUMBNAIL_CONTENT_TYPES, THUMBNAIL_MAX_BYTES } from "@/lib/constants";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** サムネイル画像を Vercel Blob にアップロードし、URL をフォームの thumbnailUrl に入れる */
export function ThumbnailField({
  courseId,
  defaultValue,
}: {
  courseId: string;
  defaultValue: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    if (!THUMBNAIL_CONTENT_TYPES.includes(file.type)) {
      setError("JPEG・PNG・WebP の画像を選んでください");
      return;
    }
    if (file.size > THUMBNAIL_MAX_BYTES) {
      setError("画像は5MB以下にしてください");
      return;
    }
    setProgress(0);
    try {
      const blob = await upload(`thumbnails/${courseId}.${EXTENSIONS[file.type]}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/thumbnail-upload",
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });
      setUrl(blob.url);
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
    <div className="space-y-2">
      {url && (
        // 外部URLのサムネイルも表示するため next/image ではなく img を使う
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="サムネイルのプレビュー"
          className="aspect-video w-full max-w-xs rounded-md border object-cover"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={THUMBNAIL_CONTENT_TYPES.join(",")}
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
          {uploading ? `アップロード中… ${progress}%` : "画像を選択"}
        </Button>
        {url && !uploading && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")}>
            画像を外す
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          JPEG・PNG・WebP、5MBまで（16:9 推奨）
        </span>
      </div>
      <Input
        id="thumbnailUrl"
        name="thumbnailUrl"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="またはURLを直接入力 https://..."
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
