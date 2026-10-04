import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { fulfillCheckoutSession, stripe } from "@/lib/stripe";

/**
 * Stripe の webhook 窓口。
 * 買い切り（mode=payment）の Checkout はここで処理し、
 * それ以外（サブスク関連）は Better-Auth Stripe プラグインの webhook へ転送する。
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Missing signature", { status: 400 });
  }

  // 署名検証には加工前の生のボディが必要
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    console.error("[stripe] webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (isCoursePurchaseEvent(event)) {
    await fulfillCheckoutSession(event.data.object);
    return Response.json({ received: true });
  }

  // プラグイン側でも同じ署名で検証されるので、ボディとヘッダーをそのまま渡す
  return auth.handler(
    new Request(new URL("/api/auth/stripe/webhook", request.url), {
      method: "POST",
      headers: request.headers,
      body: payload,
    }),
  );
}

function isCoursePurchaseEvent(
  event: Stripe.Event,
): event is Stripe.CheckoutSessionCompletedEvent | Stripe.CheckoutSessionAsyncPaymentSucceededEvent {
  return (
    // コンビニ払いなど後から入金される支払い方法は async_payment_succeeded で確定する
    (event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded") &&
    event.data.object.mode === "payment"
  );
}
