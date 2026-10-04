import type { Metadata } from "next";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { and, asc, eq, isNotNull, or } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { course, subscription } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { SUBSCRIPTION_PLAN } from "@/lib/plan";
import { safeCallback } from "@/lib/safe-callback";
import { getActiveSubscription, getSession } from "@/lib/session";
import { ManageSubscriptionButton, SubscribeButton } from "./subscription-buttons";

export const metadata: Metadata = { title: "料金プラン" };

const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
  timeZone: "Asia/Tokyo",
});

/** 無料期間はユーザーごとに初回の1回だけ（プラグインと同じ判定） */
async function hasUsedTrial(userId: string) {
  const used = await db.query.subscription.findFirst({
    where: and(
      eq(subscription.referenceId, userId),
      or(
        isNotNull(subscription.trialStart),
        isNotNull(subscription.trialEnd),
        eq(subscription.status, "trialing"),
      ),
    ),
    columns: { id: true },
  });
  return !!used;
}

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const { callbackURL } = await searchParams;
  // 講座ページから来た場合は、登録後にその講座へ戻す
  const successPath = callbackURL ? safeCallback(callbackURL) : "/pricing";

  const session = await getSession();
  const [active, trialUsed, courses] = await Promise.all([
    session ? getActiveSubscription(session.user.id) : undefined,
    session ? hasUsedTrial(session.user.id) : false,
    db.query.course.findMany({
      where: and(eq(course.isPublished, true), eq(course.accessType, "subscription")),
      orderBy: [asc(course.sortOrder), asc(course.createdAt)],
      columns: { slug: true, title: true },
    }),
  ]);
  const trialAvailable = !trialUsed;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-black sm:text-4xl">料金プラン</h1>
      <p className="mt-3 text-pebble">
        無料・買い切りの講座は、この登録なしでも受講できます。
      </p>

      <div className="mt-8 rounded-3xl bg-floe p-6 sm:p-8">
        <h2 className="text-xl font-bold">{SUBSCRIPTION_PLAN.label}</h2>
        <p className="mt-3 flex items-baseline gap-1">
          <span className="font-heading text-5xl font-black">
            {formatPrice(SUBSCRIPTION_PLAN.priceJpy)}
          </span>
          <span className="font-bold text-pebble">/ 月（税込）</span>
        </p>
        {!active && trialAvailable && (
          <p className="mt-4 inline-block rounded-xl bg-white px-3 py-2 text-sm font-bold">
            初回登録は{SUBSCRIPTION_PLAN.trialDays}日間無料。期間内に解約すれば料金はかかりません。
          </p>
        )}
        <ul className="mt-5 space-y-2">
          {["サブスク対象の講座がすべて見放題", "いつでも解約できます（次回更新日まで視聴できます）"].map(
            (text) => (
              <li key={text} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-5 shrink-0 rounded-full bg-beak p-0.5" />
                <span>{text}</span>
              </li>
            ),
          )}
        </ul>

        <div className="mt-8">
          {active ? (
            <div className="space-y-4">
              <SubscriptionStatus subscription={active} />
              <ManageSubscriptionButton />
            </div>
          ) : session ? (
            <SubscribeButton
              successPath={successPath}
              label={
                trialAvailable
                  ? `${SUBSCRIPTION_PLAN.trialDays}日間無料で始める`
                  : "登録する"
              }
            />
          ) : (
            <Link
              href={`/sign-in?callbackURL=${encodeURIComponent("/pricing")}`}
              className={buttonVariants({ variant: "cta", size: "lg", className: "w-full" })}
            >
              ログインして登録する
            </Link>
          )}
        </div>
      </div>

      {courses.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold">見放題の対象講座</h2>
          <ul className="mt-4 divide-y overflow-hidden rounded-2xl border">
            {courses.map((c) => (
              <li key={c.slug}>
                <Link href={`/courses/${c.slug}`} className="block px-4 py-3 hover:bg-muted">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SubscriptionStatus({
  subscription: sub,
}: {
  subscription: NonNullable<Awaited<ReturnType<typeof getActiveSubscription>>>;
}) {
  let detail: string | null = null;
  if (sub.cancelAtPeriodEnd || sub.cancelAt) {
    const until = sub.cancelAt ?? sub.periodEnd;
    detail = until ? `解約手続き済みです。${dateFormat.format(until)}まで視聴できます。` : "解約手続き済みです。";
  } else if (sub.status === "trialing" && sub.trialEnd) {
    detail = `無料期間中です。${dateFormat.format(sub.trialEnd)}から月額料金が発生します。`;
  } else if (sub.periodEnd) {
    detail = `次回更新日：${dateFormat.format(sub.periodEnd)}`;
  }

  return (
    <div className="rounded-xl bg-white px-4 py-3 text-sm">
      <p className="font-bold">ご契約中です</p>
      {detail && <p className="mt-1">{detail}</p>}
    </div>
  );
}
