import Link from "next/link";
import { startCourseCheckout } from "@/app/courses/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Course } from "@/db/schema";
import type { Viewer } from "@/lib/access";
import { formatPrice } from "@/lib/format";

/** 講座を受講できない人に表示する導線（ログイン / 購入 / サブスク登録） */
export function AccessCta({
  course,
  viewer,
  callbackPath,
}: {
  course: Pick<Course, "id" | "accessType" | "priceJpy">;
  viewer: Viewer;
  callbackPath: string;
}) {
  if (!viewer && course.accessType === "free") {
    return (
      <Link
        href={`/sign-in?callbackURL=${encodeURIComponent(callbackPath)}`}
        className={buttonVariants({ variant: "cta", size: "lg" })}
      >
        ログインして受講する（無料）
      </Link>
    );
  }

  if (course.accessType === "purchase") {
    // 未ログインの場合はアクション側でログイン画面へ送る
    return (
      <form action={startCourseCheckout.bind(null, course.id, callbackPath)}>
        <Button type="submit" variant="cta" size="lg" disabled={course.priceJpy == null}>
          {course.priceJpy != null ? `${formatPrice(course.priceJpy)}で購入する` : "購入（価格未設定）"}
        </Button>
      </form>
    );
  }
  return (
    <Link
      href={`/pricing?callbackURL=${encodeURIComponent(callbackPath)}`}
      className={buttonVariants({ variant: "cta", size: "lg" })}
    >
      サブスクに登録して受講する
    </Link>
  );
}
