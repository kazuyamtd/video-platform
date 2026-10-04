import Link from "next/link";
import { AccessBadge } from "@/components/access-badge";
import { CourseCard } from "@/components/course-card";
import { PenguinMark } from "@/components/penguin-mark";
import { buttonVariants } from "@/components/ui/button";
import { listPublishedCourses } from "@/lib/courses";
import { formatPrice } from "@/lib/format";
import { SUBSCRIPTION_PLAN } from "@/lib/plan";

export default async function HomePage() {
  const courses = await listPublishedCourses();
  // 最初の一歩には無料講座をすすめる
  const featured = courses.find((c) => c.accessType === "free") ?? courses[0];

  return (
    <>
      <section className="overflow-hidden bg-floe">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            {/* 文節ごとに折り返して、単語の途中で改行しないようにする */}
            <h1 className="text-[2.25rem] leading-[1.3] font-black sm:text-5xl sm:leading-[1.25] lg:text-[3.25rem]">
              <span className="inline-block">動画を見ながら、</span>
              <span className="inline-block">手を動かして</span>
              <span className="inline-block">身につける。</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/80">
              ChatGPT の使い方や LP の作り方など、仕事にすぐ使えるスキルを短い動画で。まずは無料の講座から始められます。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={featured ? `/courses/${featured.slug}` : "/courses"}
                className={buttonVariants({ variant: "cta", size: "lg" })}
              >
                {featured?.accessType === "free" ? "無料の講座から始める" : "講座を見てみる"}
              </Link>
              <Link
                href="/courses"
                className={buttonVariants({ variant: "outline", size: "lg", className: "bg-white" })}
              >
                講座一覧
              </Link>
            </div>
          </div>

          {featured && (
            <Link href={`/courses/${featured.slug}`} className="group relative block pt-12 sm:pt-14">
              <PenguinMark size={84} priority className="penguin-hop absolute top-0 left-[16%]" />
              <div className="floe-shape aspect-video overflow-hidden bg-floe-deep shadow-[0_20px_0_-8px_var(--floe-deep)]">
                {featured.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                )}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 px-2">
                <AccessBadge course={featured} className={featured.accessType === "free" ? "bg-white" : undefined} />
                <span className="font-heading text-lg font-bold group-hover:underline group-hover:decoration-beak group-hover:decoration-2 group-hover:underline-offset-4">
                  {featured.title}
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {courses.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold sm:text-3xl">講座</h2>
            <Link href="/courses" className="text-sm font-bold text-pebble hover:text-ink">
              すべての講座を見る
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-20 sm:pt-24">
        <h2 className="text-2xl font-bold sm:text-3xl">受講のしかた</h2>
        <p className="mt-3 max-w-xl text-pebble">
          講座ごとに受講のしかたが決まっています。講座ページで確認できます。
        </p>
        <dl className="mt-10 grid gap-10 sm:grid-cols-3">
          <div>
            <dt>
              <AccessBadge course={{ accessType: "free", priceJpy: null }} />
            </dt>
            <dd className="mt-3 leading-relaxed">
              メールアドレスで登録すれば、そのまま全レッスンを見られます。
            </dd>
          </div>
          <div>
            <dt>
              <AccessBadge
                course={{ accessType: "purchase", priceJpy: null }}
              />
            </dt>
            <dd className="mt-3 leading-relaxed">
              一度購入すれば、期限なくいつでも見返せます。無料プレビューがある講座は、購入前に一部を見られます。
            </dd>
          </div>
          <div>
            <dt>
              <AccessBadge course={{ accessType: "subscription", priceJpy: null }} />
            </dt>
            <dd className="mt-3 leading-relaxed">
              月額{formatPrice(SUBSCRIPTION_PLAN.priceJpy)}で対象講座がすべて見放題。初回は
              {SUBSCRIPTION_PLAN.trialDays}日間無料で試せます。{" "}
              <Link href="/pricing" className="font-bold underline decoration-beak decoration-2 underline-offset-4">
                サブスクプラン
              </Link>
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
