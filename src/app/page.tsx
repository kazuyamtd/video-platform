import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { buttonVariants } from "@/components/ui/button";
import { listPublishedCourses } from "@/lib/courses";

export default async function HomePage() {
  const courses = await listPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          学びを、いつでもどこでも。
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          無料講座から本格的な有料講座まで。自分のペースで動画で学べます。
        </p>
        <Link href="/courses" className={buttonVariants({ size: "lg", className: "mt-8" })}>
          講座を見る
        </Link>
      </section>

      {courses.length > 0 && (
        <section className="pb-16">
          <h2 className="mb-6 text-xl font-semibold">新着講座</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
