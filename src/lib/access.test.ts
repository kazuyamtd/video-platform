import { describe, expect, it } from "vitest";
import { canAccessCourse, canAccessLesson, type Viewer } from "./access";

const member = (over: Partial<NonNullable<Viewer>> = {}): Viewer => ({
  userId: "u1",
  isAdmin: false,
  ownsCourse: false,
  hasActiveSubscription: false,
  ...over,
});

const free = { accessType: "free" } as const;
const paid = { accessType: "purchase" } as const;
const sub = { accessType: "subscription" } as const;
const preview = { isPreview: true };
const normal = { isPreview: false };

describe("canAccessCourse", () => {
  it("未ログインはどの講座も不可", () => {
    for (const c of [free, paid, sub]) expect(canAccessCourse(c, null)).toBe(false);
  });

  it("無料講座はログインだけで可", () => {
    expect(canAccessCourse(free, member())).toBe(true);
  });

  it("買い切り講座は購入者のみ", () => {
    expect(canAccessCourse(paid, member())).toBe(false);
    expect(canAccessCourse(paid, member({ hasActiveSubscription: true }))).toBe(false);
    expect(canAccessCourse(paid, member({ ownsCourse: true }))).toBe(true);
  });

  it("サブスク講座は有効なサブスク会員のみ", () => {
    expect(canAccessCourse(sub, member())).toBe(false);
    expect(canAccessCourse(sub, member({ ownsCourse: true }))).toBe(false);
    expect(canAccessCourse(sub, member({ hasActiveSubscription: true }))).toBe(true);
  });

  it("管理者はすべて可", () => {
    for (const c of [free, paid, sub])
      expect(canAccessCourse(c, member({ isAdmin: true }))).toBe(true);
  });
});

describe("canAccessLesson", () => {
  it("プレビューレッスンは未ログインでも可", () => {
    for (const c of [free, paid, sub]) expect(canAccessLesson(c, preview, null)).toBe(true);
  });

  it("通常レッスンは講座の権限に従う", () => {
    expect(canAccessLesson(paid, normal, member())).toBe(false);
    expect(canAccessLesson(paid, normal, member({ ownsCourse: true }))).toBe(true);
    expect(canAccessLesson(free, normal, null)).toBe(false);
  });
});
