"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VimeoPlayer } from "@/components/vimeo-player";
import type { Lesson } from "@/db/schema";
import { updateLesson } from "../../actions";

export function LessonForm({ lesson }: { lesson: Lesson }) {
  const [state, action, pending] = useActionState(
    updateLesson.bind(null, lesson.id),
    undefined,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={action} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" defaultValue={lesson.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vimeo">Vimeo 動画ID または URL</Label>
          <Input
            id="vimeo"
            name="vimeo"
            defaultValue={lesson.vimeoVideoId ?? ""}
            placeholder="123456789 / https://vimeo.com/123456789/abcdef"
          />
          <p className="text-xs text-muted-foreground">
            限定公開動画はハッシュ付きのURL（vimeo.com/ID/ハッシュ）を貼ってください。
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationSec">再生時間（秒）</Label>
          <Input
            id="durationSec"
            name="durationSec"
            type="number"
            min={0}
            defaultValue={lesson.durationSec ?? ""}
            placeholder="空欄なら Vimeo から自動取得"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPreview" defaultChecked={lesson.isPreview} />
          無料プレビュー（未購入・未ログインでも視聴可）
        </label>
        <div className="space-y-1.5">
          <Label htmlFor="bodyMarkdown">補足テキスト（Markdown）</Label>
          <Textarea
            id="bodyMarkdown"
            name="bodyMarkdown"
            rows={10}
            defaultValue={lesson.bodyMarkdown}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "保存中…" : "保存"}
          </Button>
          <FormMessage error={state?.error} success={state?.message} />
        </div>
      </form>

      <div>
        <p className="mb-2 text-sm font-medium">プレビュー</p>
        {lesson.vimeoVideoId ? (
          <VimeoPlayer video={lesson.vimeoVideoId} />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            動画未設定
          </div>
        )}
      </div>
    </div>
  );
}
