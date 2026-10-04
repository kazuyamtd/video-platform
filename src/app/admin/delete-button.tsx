"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "./actions";

/** 1回目のクリックで確認表示、2回目で実行する削除ボタン */
export function DeleteButton({
  action,
  label = "削除",
  confirmLabel = "本当に削除する",
}: {
  action: () => Promise<ActionState | void>;
  label?: string;
  confirmLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={pending}
        onBlur={() => setArmed(false)}
        onClick={() => {
          if (!armed) return setArmed(true);
          startTransition(async () => {
            const result = await action();
            setArmed(false);
            if (result?.error) setError(result.error);
          });
        }}
      >
        {armed ? confirmLabel : label}
      </Button>
    </span>
  );
}
