"use client";

import { useState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SUBSCRIPTION_PLAN } from "@/lib/plan";

/** Stripe Checkout（サブスク）へ移動する */
export function SubscribeButton({ label, successPath }: { label: string; successPath: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <div className="space-y-2">
      <Button
        variant="cta"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(undefined);
          const { error } = await authClient.subscription.upgrade({
            plan: SUBSCRIPTION_PLAN.name,
            successUrl: successPath,
            cancelUrl: "/pricing",
          });
          // 成功時は Stripe へ移動するので、ここに来るのは失敗時だけ
          if (error) {
            setError("決済ページを開けませんでした。時間をおいて再度お試しください。");
            setPending(false);
          }
        }}
      >
        {pending ? "移動中…" : label}
      </Button>
      <FormMessage error={error} />
    </div>
  );
}

/** Stripe カスタマーポータル（解約・カード変更・請求履歴）へ移動する */
export function ManageSubscriptionButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(undefined);
          const { error } = await authClient.subscription.billingPortal({
            returnUrl: "/pricing",
          });
          if (error) {
            setError("管理ページを開けませんでした。時間をおいて再度お試しください。");
            setPending(false);
          }
        }}
      >
        {pending ? "移動中…" : "契約内容の確認・解約・カード変更"}
      </Button>
      <FormMessage error={error} />
    </div>
  );
}
