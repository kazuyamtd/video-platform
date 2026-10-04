import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/db/schema";
import { ACCESS_LABELS, formatPrice } from "@/lib/format";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
    >
      <div className="aspect-video bg-muted">
        {course.thumbnailUrl && (
          // 外部URLのサムネイルを許可するため next/image ではなく img を使う
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <Badge variant={course.accessType === "free" ? "secondary" : "default"}>
            {ACCESS_LABELS[course.accessType]}
          </Badge>
          {course.accessType === "purchase" && course.priceJpy != null && (
            <span className="text-sm font-medium">{formatPrice(course.priceJpy)}</span>
          )}
        </div>
        <h3 className="font-semibold leading-snug">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
      </div>
    </Link>
  );
}
