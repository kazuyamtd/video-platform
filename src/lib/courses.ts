import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { course, lesson, section } from "@/db/schema";

export async function listPublishedCourses() {
  return db.query.course.findMany({
    where: eq(course.isPublished, true),
    orderBy: [asc(course.sortOrder), asc(course.createdAt)],
  });
}

/**
 * 講座の目次（章・レッスン）を取得する。
 * 目次には Vimeo ID や本文を含めない（権限チェック前に漏れないように）。
 */
export async function getCourseOutline(
  slug: string,
  { includeUnpublished }: { includeUnpublished: boolean },
) {
  const found = await db.query.course.findFirst({
    where: eq(course.slug, slug),
    with: {
      sections: {
        orderBy: [asc(section.sortOrder), asc(section.createdAt)],
        with: {
          lessons: {
            orderBy: [asc(lesson.sortOrder), asc(lesson.createdAt)],
            columns: { id: true, title: true, durationSec: true, isPreview: true },
          },
        },
      },
    },
  });
  if (!found || (!found.isPublished && !includeUnpublished)) return null;
  return found;
}

export type CourseOutline = NonNullable<Awaited<ReturnType<typeof getCourseOutline>>>;

export function flattenLessons(outline: CourseOutline) {
  return outline.sections.flatMap((s) => s.lessons);
}
