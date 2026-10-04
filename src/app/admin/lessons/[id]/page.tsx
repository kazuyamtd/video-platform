import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { lesson } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { deleteLesson } from "../../actions";
import { DeleteButton } from "../../delete-button";
import { LessonForm } from "./lesson-form";

export const metadata: Metadata = { title: "レッスンの編集" };

export default async function AdminLessonPage({ params }: PageProps<"/admin/lessons/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const found = await db.query.lesson.findFirst({
    where: eq(lesson.id, id),
    with: { section: { with: { course: { columns: { id: true, title: true } } } } },
  });
  if (!found) notFound();
  const { section, ...lessonRow } = found;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/courses/${section.course.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {section.course.title} / {section.title}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{found.title}</h1>
          <DeleteButton action={deleteLesson.bind(null, found.id)} label="レッスンを削除" />
        </div>
      </div>
      <LessonForm lesson={lessonRow} />
    </div>
  );
}
