import Link from "next/link";
import type { Course } from "@/db/schema";
import { AccessBadge } from "./access-badge";
import { PenguinMark } from "./penguin-mark";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="aspect-video overflow-hidden rounded-2xl bg-floe">
        {course.thumbnailUrl ? (
          // 外部URLのサムネイルを許可するため next/image ではなく img を使う
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <PenguinMark size={64} className="opacity-70" />
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1.5 px-1">
        <AccessBadge course={course} />
        <h3 className="text-lg font-bold leading-snug group-hover:underline group-hover:decoration-beak group-hover:decoration-2 group-hover:underline-offset-4">
          {course.title}
        </h3>
        {course.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>
    </Link>
  );
}
