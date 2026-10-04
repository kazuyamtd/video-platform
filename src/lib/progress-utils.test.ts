import { describe, expect, it } from "vitest";
import { type LessonProgressState, resumeLessonId, summarizeProgress } from "./progress-utils";

const at = (minutes: number) => new Date(2026, 0, 1, 0, minutes);
const state = (minutes: number, completed = false): LessonProgressState => ({
  completedAt: completed ? at(minutes) : null,
  updatedAt: at(minutes),
});

describe("summarizeProgress", () => {
  it("完了数と割合を返す", () => {
    const progress = new Map([
      ["a", state(1, true)],
      ["b", state(2, false)],
      ["c", state(3, true)],
    ]);
    expect(summarizeProgress(["a", "b", "c"], progress)).toEqual({
      completed: 2,
      total: 3,
      percent: 66,
    });
  });
  it("レッスンが無ければ0%", () => {
    expect(summarizeProgress([], new Map()).percent).toBe(0);
  });
});

describe("resumeLessonId", () => {
  const ids = ["a", "b", "c", "d"];

  it("何も見ていなければ null", () => {
    expect(resumeLessonId(ids, new Map())).toBeNull();
  });
  it("最後に見ていた未完了レッスンを返す", () => {
    const progress = new Map([
      ["a", state(1, true)],
      ["c", state(5, false)],
      ["b", state(3, false)],
    ]);
    expect(resumeLessonId(ids, progress)).toBe("c");
  });
  it("最後に見たレッスンが完了済みなら次の未完了レッスン", () => {
    const progress = new Map([
      ["a", state(1, true)],
      ["b", state(2, true)],
      ["c", state(3, true)],
    ]);
    expect(resumeLessonId(ids, progress)).toBe("d");
  });
  it("後ろが全部完了なら前に戻って未完了を探す", () => {
    const progress = new Map([
      ["c", state(1, true)],
      ["d", state(2, true)],
    ]);
    expect(resumeLessonId(ids, progress)).toBe("a");
  });
  it("全部完了なら null", () => {
    const progress = new Map(ids.map((id, i) => [id, state(i, true)]));
    expect(resumeLessonId(ids, progress)).toBeNull();
  });
});
