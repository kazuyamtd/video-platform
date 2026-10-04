import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { course } from "@/db/schema";
import { ACCESS_LABELS } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { NewCourseForm } from "./new-course-form";

export const metadata: Metadata = { title: "講座管理" };

export default async function AdminCoursesPage() {
  // レイアウトは部分レンダリングでスキップされ得るため、ページでも確認する
  await requireAdmin();
  const courses = await db.query.course.findMany({
    orderBy: [asc(course.sortOrder), asc(course.createdAt)],
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">講座</h1>

      <NewCourseForm />

      {courses.length === 0 ? (
        <p className="text-muted-foreground">講座はまだありません。</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/courses/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted"
              >
                <span className="flex-1 font-medium">{c.title}</span>
                <span className="text-xs text-muted-foreground">/{c.slug}</span>
                <Badge variant="outline">{ACCESS_LABELS[c.accessType]}</Badge>
                <Badge variant={c.isPublished ? "default" : "secondary"}>
                  {c.isPublished ? "公開" : "非公開"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
