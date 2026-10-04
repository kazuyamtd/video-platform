export type LessonProgressState = {
  completedAt: Date | null;
  updatedAt: Date;
};

/** 完了したレッスン数と割合（0〜100の整数） */
export function summarizeProgress(
  lessonIds: string[],
  progress: Map<string, LessonProgressState>,
) {
  const completed = lessonIds.filter((id) => progress.get(id)?.completedAt).length;
  const percent = lessonIds.length === 0 ? 0 : Math.floor((completed / lessonIds.length) * 100);
  return { completed, total: lessonIds.length, percent };
}

/**
 * 「続きから受講する」で開くレッスン。
 * 最後に操作したレッスンが未完了ならそれ、完了済みならその次の未完了レッスン。
 * まだ何も記録がなければ null（最初から）。
 */
export function resumeLessonId(
  lessonIds: string[],
  progress: Map<string, LessonProgressState>,
): string | null {
  let lastIndex = -1;
  let lastAt = -Infinity;
  lessonIds.forEach((id, i) => {
    const p = progress.get(id);
    if (p && p.updatedAt.getTime() > lastAt) {
      lastAt = p.updatedAt.getTime();
      lastIndex = i;
    }
  });
  if (lastIndex === -1) return null;
  if (!progress.get(lessonIds[lastIndex])?.completedAt) return lessonIds[lastIndex];

  const after = [...lessonIds.slice(lastIndex + 1), ...lessonIds.slice(0, lastIndex)];
  return after.find((id) => !progress.get(id)?.completedAt) ?? null;
}
