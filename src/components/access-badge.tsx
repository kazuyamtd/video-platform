import type { Course } from "@/db/schema";
import { ACCESS_LABELS, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const STYLES: Record<Course["accessType"], string> = {
  free: "bg-floe text-ink",
  purchase: "bg-beak/25 text-ink",
  subscription: "bg-ink text-white",
};

/** 受講方式（無料 / 買い切り＋価格 / 見放題） */
export function AccessBadge({
  course,
  className,
}: {
  course: Pick<Course, "accessType" | "priceJpy">;
  className?: string;
}) {
  const label =
    course.accessType === "purchase" && course.priceJpy != null
      ? `${ACCESS_LABELS.purchase} ${formatPrice(course.priceJpy)}`
      : course.accessType === "subscription"
        ? "サブスクで見放題"
        : ACCESS_LABELS[course.accessType];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold",
        STYLES[course.accessType],
        className,
      )}
    >
      {label}
    </span>
  );
}
