import { LockIcon, PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CourseOutline } from "@/lib/courses";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 講座の目次。courseAccessible=false のときプレビュー以外に鍵アイコンを付ける */
export function LessonOutline({
  outline,
  courseAccessible,
  currentLessonId,
}: {
  outline: CourseOutline;
  courseAccessible: boolean;
  currentLessonId?: string;
}) {
  return (
    <div className="space-y-6">
      {outline.sections.map((s) => (
        <div key={s.id}>
          <h3 className="mb-2 text-sm font-semibold">{s.title}</h3>
          <ul className="divide-y rounded-lg border">
            {s.lessons.map((l) => {
              const open = courseAccessible || l.isPreview;
              return (
                <li key={l.id}>
                  <Link
                    href={`/courses/${outline.slug}/lessons/${l.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted",
                      l.id === currentLessonId && "bg-muted font-medium",
                    )}
                  >
                    {open ? (
                      <PlayCircleIcon className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <LockIcon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1">{l.title}</span>
                    {!courseAccessible && l.isPreview && (
                      <Badge variant="outline">プレビュー</Badge>
                    )}
                    {l.durationSec != null && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(l.durationSec)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
