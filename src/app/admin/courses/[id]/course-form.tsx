"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Course } from "@/db/schema";
import { ACCESS_TYPES } from "@/lib/constants";
import { ACCESS_LABELS } from "@/lib/format";
import { updateCourse } from "../../actions";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CourseForm({ course }: { course: Course }) {
  const [state, action, pending] = useActionState(
    updateCourse.bind(null, course.id),
    undefined,
  );

  return (
    <form action={action} className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="タイトル" name="title">
          <Input id="title" name="title" defaultValue={course.title} required />
        </Field>
        <Field label="スラッグ（URL）" name="slug">
          <Input id="slug" name="slug" defaultValue={course.slug} required />
        </Field>
      </div>
      <Field label="説明" name="description">
        <Textarea id="description" name="description" rows={4} defaultValue={course.description} />
      </Field>
      <Field label="サムネイル画像URL" name="thumbnailUrl">
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          defaultValue={course.thumbnailUrl ?? ""}
          placeholder="https://..."
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="受講方式" name="accessType">
          <select
            id="accessType"
            name="accessType"
            defaultValue={course.accessType}
            className={selectClass}
          >
            {ACCESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCESS_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="価格（円・買い切りのみ）" name="priceJpy">
          <Input
            id="priceJpy"
            name="priceJpy"
            type="number"
            min={0}
            defaultValue={course.priceJpy ?? ""}
          />
        </Field>
        <Field label="表示順" name="sortOrder">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={course.sortOrder}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={course.isPublished} />
        公開する
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
        <FormMessage error={state?.error} success={state?.message} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
    </div>
  );
}
