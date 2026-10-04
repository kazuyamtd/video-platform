import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessBadge } from "@/components/access-badge";
import { AccessCta } from "@/components/access-cta";
import { LessonOutline } from "@/components/lesson-outline";
import { buttonVariants } from "@/components/ui/button";
import { canAccessCourse } from "@/lib/access";
import { flattenLessons, getCourseOutline } from "@/lib/courses";
import { getProgressMap } from "@/lib/progress";
import {
  type LessonProgressState,
  resumeLessonId,
  summarizeProgress,
} from "@/lib/progress-utils";
import { getSession, getViewer } from "@/lib/session";
import { fulfillCheckoutSession, stripe } from "@/lib/stripe";

async function confirmCheckout(checkoutSessionId: string, courseId: string) {
  const session = await getSession();
  if (!session) return false;
  try {
    const checkout = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    // 他人の Session ID を URL に入れられても購入扱いにしない
    if (
      checkout.metadata?.userId !== session.user.id ||
      checkout.metadata?.courseId !== courseId
    ) {
      return false;
    }
    return await fulfillCheckoutSession(checkout);
  } catch (err) {
    console.error("[stripe] failed to confirm checkout session", err);
    return false;
  }
}

async function loadCourse(slug: string) {
  const session = await getSession();
  return getCourseOutline(slug, { includeUnpublished: session?.user.role === "admin" });
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const outline = await loadCourse((await params).slug);
  return outline ? { title: outline.title, description: outline.description } : {};
}

export default async function CoursePage({
  params,
  searchParams,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const outline = await loadCourse(slug);
  if (!outline) notFound();

  // Stripe Checkout から戻ってきた場合、webhook を待たずに購入を確定させる
  const { checkout_session } = await searchParams;
  const purchased =
    typeof checkout_session === "string" &&
    (await confirmCheckout(checkout_session, outline.id));

  const viewer = await getViewer(outline.id);
  const accessible = canAccessCourse(outline, viewer);
  const lessons = flattenLessons(outline);
  const firstLesson = lessons[0];
  const previewLesson = lessons.find((l) => l.isPreview);

  const lessonIds = lessons.map((l) => l.id);
  const progress =
    viewer && accessible ? await getProgressMap(viewer.userId, lessonIds) : new Map<string, LessonProgressState>();
  const summary = summarizeProgress(lessonIds, progress);
  const resumeId = resumeLessonId(lessonIds, progress);

  return (
    <>
      <section className="bg-floe">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:py-14 md:grid-cols-[1fr_minmax(0,24rem)] md:items-center">
          <div>
            {!outline.isPublished && (
              <p className="mb-4 rounded-xl bg-beak/25 px-3 py-2 text-sm font-bold">
                この講座は非公開です（管理者のみ表示）
              </p>
            )}
            {purchased && (
              <p className="mb-4 rounded-xl bg-white px-3 py-2 text-sm font-bold text-emerald-800">
                ご購入ありがとうございます。この講座をすぐに受講できます。
              </p>
            )}
            <AccessBadge
              course={outline}
              className={outline.accessType === "free" ? "bg-white" : undefined}
            />
            <h1 className="mt-3 text-3xl leading-snug font-black sm:text-4xl">{outline.title}</h1>
            <p className="mt-4 max-w-prose leading-relaxed whitespace-pre-wrap text-ink/80">
              {outline.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {accessible ? (
                firstLesson && (
                  <Link
                    href={`/courses/${slug}/lessons/${resumeId ?? firstLesson.id}`}
                    className={buttonVariants({ variant: "cta", size: "lg" })}
                  >
                    {resumeId ? "続きから受講する" : progress.size > 0 ? "もう一度受講する" : "受講する"}
                  </Link>
                )
              ) : (
                <>
                  <AccessCta course={outline} viewer={viewer} callbackPath={`/courses/${slug}`} />
                  {previewLesson && (
                    <Link
                      href={`/courses/${slug}/lessons/${previewLesson.id}`}
                      className={buttonVariants({ size: "lg", variant: "outline", className: "bg-white" })}
                    >
                      無料プレビューを見る
                    </Link>
                  )}
                </>
              )}
            </div>

            {accessible && progress.size > 0 && (
              <div className="mt-8 max-w-md">
                <div className="flex justify-between text-sm font-bold">
                  <span>受講の進み具合</span>
                  <span>
                    {summary.completed} / {summary.total} レッスン完了（{summary.percent}%）
                  </span>
                </div>
                <div
                  className="mt-2 h-3 overflow-hidden rounded-full bg-white"
                  role="progressbar"
                  aria-label="受講の進み具合"
                  aria-valuenow={summary.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full bg-beak" style={{ width: `${summary.percent}%` }} />
                </div>
              </div>
            )}
          </div>

          {outline.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={outline.thumbnailUrl}
              alt=""
              className="aspect-video w-full rounded-2xl object-cover"
            />
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mt-12 mb-5 text-2xl font-bold">カリキュラム</h2>
        {lessons.length === 0 ? (
          <p className="text-pebble">レッスンは準備中です。</p>
        ) : (
          <div className="max-w-3xl">
            <LessonOutline outline={outline} courseAccessible={accessible} progress={progress} />
          </div>
        )}
      </div>
    </>
  );
}
