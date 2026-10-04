/** サブスクのプラン定義（画面表示と Better-Auth Stripe プラグインで共有する） */
export const SUBSCRIPTION_PLAN = {
  name: "standard",
  label: "スタンダードプラン",
  // Stripe の Price に付けた lookup key。金額を変えるときは Stripe 側で新しい Price を作り、このキーを付け替える
  lookupKey: "standard_monthly",
  priceJpy: 2980,
  trialDays: 14,
} as const;

/** 受講できるサブスクの状態 */
export const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;
