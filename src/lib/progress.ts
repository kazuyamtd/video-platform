import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import type { LessonProgressState } from "@/lib/progress-utils";

export async function getProgressMap(userId: string, lessonIds: string[]) {
  const map = new Map<string, LessonProgressState>();
  if (lessonIds.length === 0) return map;
  const rows = await db
    .select({
      lessonId: lessonProgress.lessonId,
      completedAt: lessonProgress.completedAt,
      updatedAt: lessonProgress.updatedAt,
    })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)));
  for (const { lessonId, ...rest } of rows) map.set(lessonId, rest);
  return map;
}

/** レッスンの完了状態を保存する（最初に完了した日時を保つ） */
export async function setLessonCompleted(userId: string, lessonId: string, completed: boolean) {
  const now = new Date();
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, completedAt: completed ? now : null })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        completedAt: completed
          ? sql`coalesce(${lessonProgress.completedAt}, excluded.completed_at)`
          : null,
        updatedAt: now,
      },
    });
}
