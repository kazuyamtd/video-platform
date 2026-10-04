import { stripe as stripePlugin } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { SUBSCRIPTION_PLAN } from "@/lib/plan";
import { stripe } from "@/lib/stripe";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "パスワード再設定のご案内",
        html: `<p>以下のリンクからパスワードを再設定してください。</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // 未確認のままログインしようとしたら確認メールを再送する
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "メールアドレスの確認",
        html: `<p>以下のリンクからメールアドレスを確認してください。</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  plugins: [
    admin(),
    // Stripe からの通知は /api/stripe/webhook で受け、サブスク関連だけこのプラグインへ転送する
    stripePlugin({
      stripeClient: stripe,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      subscription: {
        enabled: true,
        requireEmailVerification: true,
        plans: [
          {
            name: SUBSCRIPTION_PLAN.name,
            lookupKey: SUBSCRIPTION_PLAN.lookupKey,
            // 無料期間はユーザーごとに初回の1回だけ適用される
            freeTrial: { days: SUBSCRIPTION_PLAN.trialDays },
          },
        ],
        getCheckoutSessionParams: () => ({
          params: { integration_identifier: "standard-subscription-pwhcnbfd" },
        }),
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
