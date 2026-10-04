import type { Course, Lesson } from "@/db/schema";

/** 閲覧者の状態。未ログインなら null */
export type Viewer = {
  userId: string;
  isAdmin: boolean;
  ownsCourse: boolean;
  hasActiveSubscription: boolean;
} | null;

export function canAccessCourse(
  course: Pick<Course, "accessType">,
  viewer: Viewer,
): boolean {
  if (!viewer) return false;
  if (viewer.isAdmin) return true;
  switch (course.accessType) {
    case "free":
      return true;
    case "purchase":
      return viewer.ownsCourse;
    case "subscription":
      return viewer.hasActiveSubscription;
  }
}

export function canAccessLesson(
  course: Pick<Course, "accessType">,
  lesson: Pick<Lesson, "isPreview">,
  viewer: Viewer,
): boolean {
  return lesson.isPreview || canAccessCourse(course, viewer);
}
