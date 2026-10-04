import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { purchase, subscription } from "@/db/schema";
import type { Viewer } from "@/lib/access";
import { auth } from "@/lib/auth";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/lib/plan";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** 受講可能な（契約中・無料期間中の）サブスクを返す */
export const getActiveSubscription = cache(async (userId: string) =>
  db.query.subscription.findFirst({
    where: and(
      eq(subscription.referenceId, userId),
      inArray(subscription.status, [...ACTIVE_SUBSCRIPTION_STATUSES]),
    ),
  }),
);

export async function getViewer(courseId: string): Promise<Viewer> {
  const session = await getSession();
  if (!session) return null;
  const [owned, activeSubscription] = await Promise.all([
    db.query.purchase.findFirst({
      where: and(
        eq(purchase.userId, session.user.id),
        eq(purchase.courseId, courseId),
      ),
      columns: { id: true },
    }),
    getActiveSubscription(session.user.id),
  ]);
  return {
    userId: session.user.id,
    isAdmin: session.user.role === "admin",
    ownsCourse: !!owned,
    hasActiveSubscription: !!activeSubscription,
  };
}

export async function requireUser(callbackPath: string) {
  const session = await getSession();
  if (!session) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(callbackPath)}`);
  }
  return session;
}

/** 管理者以外には存在自体を見せない */
export async function requireAdmin() {
  const session = await getSession();
  if (session?.user.role !== "admin") notFound();
  return session;
}
