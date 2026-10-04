"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourse } from "../actions";

export function NewCourseForm() {
  const [state, action, pending] = useActionState(createCourse, undefined);

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">新しい講座</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">スラッグ（URL）</Label>
          <Input id="slug" name="slug" required placeholder="nextjs-basics" />
        </div>
      </div>
      <FormMessage error={state?.error} />
      <Button type="submit" disabled={pending}>
        作成
      </Button>
    </form>
  );
}
