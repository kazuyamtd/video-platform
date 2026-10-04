import Stripe from "stripe";
import { db } from "@/db";
import { purchase } from "@/db/schema";

// Better-Auth の設定読み込み時に必要なため、キー未設定でも生成だけはできるようにしておく
// （その場合 API 呼び出し時に認証エラーになる）
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_not_configured");

/** Stripe ダッシュボードで買い切り Checkout を見分けるためのラベル */
export const COURSE_CHECKOUT_IDENTIFIER = "course-purchase-kqzvmtra";

/**
 * 支払い済みの Checkout Session から購入レコードを作る。
 * webhook と購入完了ページの両方から呼ばれるため冪等にしてある。
 * @returns 購入が確定していれば true
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment" || session.payment_status !== "paid") return false;
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  if (!userId || !courseId) return false;

  await db
    .insert(purchase)
    .values({
      userId,
      courseId,
      stripeCheckoutSessionId: session.id,
      amountJpy: session.amount_total ?? 0,
    })
    // 同じ Session の再送や、同じ講座の二重購入では何もしない
    .onConflictDoNothing();
  return true;
}
