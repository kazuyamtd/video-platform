import type { Metadata } from "next";
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
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold">料金プラン</h1>

      <div className="mt-8 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">{SUBSCRIPTION_PLAN.label}</h2>
        <p className="mt-2">
          <span className="text-3xl font-bold">{formatPrice(SUBSCRIPTION_PLAN.priceJpy)}</span>
          <span className="text-muted-foreground"> / 月</span>
        </p>
        {!active && trialAvailable && (
          <p className="mt-2 text-sm font-medium text-emerald-700">
            初回登録は{SUBSCRIPTION_PLAN.trialDays}日間無料。期間内に解約すれば料金はかかりません。
          </p>
        )}
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>サブスク対象の講座がすべて見放題</li>
          <li>いつでも解約できます（次回更新日まで視聴できます）</li>
        </ul>

        <div className="mt-6">
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
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              ログインして登録する
            </Link>
          )}
        </div>
      </div>

      {courses.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold">見放題の対象講座</h2>
          <ul className="mt-3 space-y-2">
            {courses.map((c) => (
              <li key={c.slug}>
                <Link href={`/courses/${c.slug}`} className="hover:underline">
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
    <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      <p className="font-medium">ご契約中です</p>
      {detail && <p className="mt-1">{detail}</p>}
    </div>
  );
}
