import type { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "講座一覧" };

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">講座一覧</h1>
      {courses.length === 0 ? (
        <p className="text-muted-foreground">公開中の講座はまだありません。</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
