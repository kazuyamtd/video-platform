"use client";

import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { VimeoPlayer } from "@/components/vimeo-player";

/** 動画（あれば）と「完了にする」ボタン */
export function LessonViewer({
  lessonId,
  video,
  initialCompleted,
  canMarkCompleted,
}: {
  lessonId: string;
  video: string | null;
  initialCompleted: boolean;
  /** false のとき（未ログインのプレビュー視聴）はボタンを出さない */
  canMarkCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const value = !completed;
    setCompleted(value);
    startTransition(async () => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: value }),
      }).catch(() => null);
      if (!res?.ok) setCompleted(!value);
      // 目次のチェックや進捗率を更新する
      router.refresh();
    });
  };

  return (
    <div>
      {video ? (
        <VimeoPlayer video={video} />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-floe text-pebble">
          動画は準備中です
        </div>
      )}
      {canMarkCompleted && (
        <div className="mt-3 flex justify-end">
          <Button
            variant={completed ? "secondary" : "outline"}
            size="sm"
            disabled={pending}
            onClick={toggle}
          >
            {completed ? (
              <>
                <CheckCircle2Icon className="text-emerald-600" />
                完了済み（取り消す）
              </>
            ) : (
              <>
                <CircleIcon />
                完了にする
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
