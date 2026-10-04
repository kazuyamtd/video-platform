"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const tabClass = "rounded-md px-2.5 py-1 text-xs font-medium";

/** 補足テキストの入力欄。プレビューに切り替えても入力内容はフォーム送信に含まれる */
export function MarkdownEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>補足テキスト（Markdown）</Label>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {[
            { label: "編集", on: false },
            { label: "プレビュー", on: true },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setPreview(tab.on)}
              className={cn(tabClass, preview === tab.on && "bg-background shadow-sm")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <Textarea
        id={name}
        name={name}
        rows={12}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn("font-mono", preview && "hidden")}
      />
      {preview && (
        <div className="min-h-48 rounded-lg border p-4">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">本文はまだありません</p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        「# 見出し」「**太字**」「- 箇条書き」「[リンク名](https://...)」「![画像](https://...)」などが使えます
      </p>
    </div>
  );
}
