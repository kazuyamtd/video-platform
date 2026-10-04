import type { Metadata } from "next";
import { CourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "講座一覧" };

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-black sm:text-4xl">講座一覧</h1>
      <p className="mt-3 text-pebble">無料の講座は、メールアドレスで登録するとすぐに受講できます。</p>
      {courses.length === 0 ? (
        <p className="mt-10 text-pebble">公開中の講座はまだありません。</p>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
