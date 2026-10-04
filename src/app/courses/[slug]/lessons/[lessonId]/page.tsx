import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessCta } from "@/components/access-cta";
import { AttachmentList } from "@/components/attachment-list";
import { LessonOutline } from "@/components/lesson-outline";
import { buttonVariants } from "@/components/ui/button";
import { LessonViewer } from "@/components/lesson-viewer";
import { Markdown } from "@/components/markdown";
import { db } from "@/db";
import { lessonAttachment, lesson as lessonTable } from "@/db/schema";
import { canAccessCourse, canAccessLesson } from "@/lib/access";
import { flattenLessons, getCourseOutline } from "@/lib/courses";
import { getProgressMap } from "@/lib/progress";
import type { LessonProgressState } from "@/lib/progress-utils";
import { getSession, getViewer } from "@/lib/session";

type Props = PageProps<"/courses/[slug]/lessons/[lessonId]">;

async function load({ params }: Props) {
  const { slug, lessonId } = await params;
  const session = await getSession();
  const outline = await getCourseOutline(slug, {
    includeUnpublished: session?.user.role === "admin",
  });
  // 目次に含まれるか確認し、別講座のレッスンIDを指定されても表示しない
  const lessons = outline ? flattenLessons(outline) : [];
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (!outline || index === -1) return null;
  return { slug, outline, lessons, index };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  return data ? { title: `${data.lessons[data.index].title} | ${data.outline.title}` } : {};
}

export default async function LessonPage(props: Props) {
  const data = await load(props);
  if (!data) notFound();
  const { slug, outline, lessons, index } = data;

  const viewer = await getViewer(outline.id);
  const meta = lessons[index];
  const accessible = canAccessLesson(outline, meta, viewer);

  // 権限があるときだけ Vimeo ID・本文・添付ファイルを読み込む
  const lesson = accessible
    ? await db.query.lesson.findFirst({
        where: eq(lessonTable.id, meta.id),
        with: {
          attachments: {
            columns: { id: true, fileName: true, sizeBytes: true },
            orderBy: asc(lessonAttachment.createdAt),
          },
        },
      })
    : null;

  const progress = viewer
    ? await getProgressMap(viewer.userId, lessons.map((l) => l.id))
    : new Map<string, LessonProgressState>();
  const current = progress.get(meta.id);

  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const lessonPath = `/courses/${slug}/lessons/${meta.id}`;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        {lesson ? (
          <LessonViewer
            // レッスンを移動したら完了状態などを作り直す
            key={lesson.id}
            lessonId={lesson.id}
            video={lesson.vimeoVideoId}
            initialCompleted={!!current?.completedAt}
            canMarkCompleted={!!viewer}
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-lg bg-muted p-6 text-center">
            <p className="font-medium">このレッスンを視聴するには受講登録が必要です</p>
            <AccessCta course={outline} viewer={viewer} callbackPath={lessonPath} />
          </div>
        )}

        <h1 className="mt-6 text-2xl font-bold">{meta.title}</h1>
        {lesson?.bodyMarkdown && <Markdown className="mt-4">{lesson.bodyMarkdown}</Markdown>}
        {lesson && lesson.attachments.length > 0 && (
          <AttachmentList attachments={lesson.attachments} />
        )}

        <div className="mt-8 flex justify-between gap-4">
          {prev ? (
            <Link
              href={`/courses/${slug}/lessons/${prev.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              ← 前のレッスン
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/courses/${slug}/lessons/${next.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              次のレッスン →
            </Link>
          )}
        </div>
      </div>

      <aside>
        <Link href={`/courses/${slug}`} className="mb-4 block font-semibold hover:underline">
          {outline.title}
        </Link>
        <LessonOutline
          outline={outline}
          courseAccessible={canAccessCourse(outline, viewer)}
          currentLessonId={meta.id}
          progress={progress}
        />
      </aside>
    </div>
  );
}
