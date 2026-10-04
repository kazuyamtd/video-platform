import { asc, eq } from "drizzle-orm";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { course, lesson, section } from "@/db/schema";
import { formatDuration } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import {
  addLesson,
  addSection,
  deleteCourse,
  deleteSection,
  moveLesson,
  moveSection,
  renameSection,
} from "../../actions";
import { DeleteButton } from "../../delete-button";
import { CourseForm } from "./course-form";

export const metadata: Metadata = { title: "講座の編集" };

export default async function AdminCoursePage({ params }: PageProps<"/admin/courses/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const found = await db.query.course.findFirst({
    where: eq(course.id, id),
    with: {
      sections: {
        orderBy: [asc(section.sortOrder), asc(section.createdAt)],
        with: { lessons: { orderBy: [asc(lesson.sortOrder), asc(lesson.createdAt)] } },
      },
    },
  });
  if (!found) notFound();
  const { sections, ...courseRow } = found;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{found.title}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/courses/${found.slug}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            講座ページを見る
          </Link>
          <DeleteButton action={deleteCourse.bind(null, found.id)} label="講座を削除" />
        </div>
      </div>

      <CourseForm course={courseRow} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">カリキュラム</h2>

        {sections.map((s, i) => (
          <div key={s.id} className="rounded-lg border">
            <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 p-3">
              <form action={renameSection.bind(null, s.id)} className="flex flex-1 gap-2">
                <Input name="title" defaultValue={s.title} className="max-w-sm" required />
                <Button type="submit" variant="outline" size="sm">
                  名前を変更
                </Button>
              </form>
              <MoveButtons
                up={i > 0 ? moveSection.bind(null, s.id, -1) : null}
                down={i < sections.length - 1 ? moveSection.bind(null, s.id, 1) : null}
              />
              <DeleteButton
                action={deleteSection.bind(null, s.id)}
                label="章を削除"
                confirmLabel="章とレッスンを削除"
              />
            </div>

            <ul className="divide-y">
              {s.lessons.map((l, j) => (
                <li key={l.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <Link href={`/admin/lessons/${l.id}`} className="flex-1 hover:underline">
                    {l.title}
                  </Link>
                  {l.isPreview && <Badge variant="outline">プレビュー</Badge>}
                  {!l.vimeoVideoId && <Badge variant="secondary">動画未設定</Badge>}
                  {l.durationSec != null && (
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(l.durationSec)}
                    </span>
                  )}
                  <MoveButtons
                    up={j > 0 ? moveLesson.bind(null, l.id, -1) : null}
                    down={j < s.lessons.length - 1 ? moveLesson.bind(null, l.id, 1) : null}
                  />
                </li>
              ))}
            </ul>

            <form action={addLesson.bind(null, s.id)} className="flex gap-2 border-t p-3">
              <Input name="title" placeholder="新しいレッスンのタイトル" required />
              <Button type="submit" size="sm">
                レッスンを追加
              </Button>
            </form>
          </div>
        ))}

        <form action={addSection.bind(null, found.id)} className="flex gap-2">
          <Input name="title" placeholder="新しい章のタイトル" required className="max-w-sm" />
          <Button type="submit" variant="outline">
            章を追加
          </Button>
        </form>
      </section>
    </div>
  );
}

function MoveButtons({
  up,
  down,
}: {
  up: (() => Promise<void>) | null;
  down: (() => Promise<void>) | null;
}) {
  return (
    <span className="flex gap-1">
      <form action={up ?? undefined}>
        <Button type="submit" variant="ghost" size="icon-sm" disabled={!up} aria-label="上へ">
          <ArrowUpIcon />
        </Button>
      </form>
      <form action={down ?? undefined}>
        <Button type="submit" variant="ghost" size="icon-sm" disabled={!down} aria-label="下へ">
          <ArrowDownIcon />
        </Button>
      </form>
    </span>
  );
}
