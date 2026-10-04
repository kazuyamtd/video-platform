"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { course, purchase } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { COURSE_CHECKOUT_IDENTIFIER, stripe } from "@/lib/stripe";

/** 買い切り講座の Stripe Checkout を作成し、決済ページへ移動する */
export async function startCourseCheckout(courseId: string, returnPath: string) {
  const target = await db.query.course.findFirst({ where: eq(course.id, courseId) });
  if (
    !target ||
    !target.isPublished ||
    target.accessType !== "purchase" ||
    target.priceJpy == null
  ) {
    throw new Error("この講座は購入できません");
  }
  const coursePath = `/courses/${target.slug}`;
  // 戻り先は講座内のページだけに限定する
  const back = returnPath.startsWith(`${coursePath}/`) ? returnPath : coursePath;
  const session = await requireUser(back);

  const owned = await db.query.purchase.findFirst({
    where: and(eq(purchase.userId, session.user.id), eq(purchase.courseId, courseId)),
    columns: { id: true },
  });
  if (owned) redirect(back);

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "jpy",
          // 円はゼロ小数通貨なので金額をそのまま渡す
          unit_amount: target.priceJpy,
          product_data: { name: target.title },
        },
      },
    ],
    customer_email: session.user.email,
    client_reference_id: session.user.id,
    metadata: { userId: session.user.id, courseId: target.id },
    integration_identifier: COURSE_CHECKOUT_IDENTIFIER,
    success_url: `${baseUrl}${coursePath}?checkout_session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}${back}`,
  });
  if (!checkout.url) throw new Error("決済ページを作成できませんでした");
  redirect(checkout.url);
}
