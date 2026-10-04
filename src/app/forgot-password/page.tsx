"use client";

import { useState } from "react";
import { AuthCard, FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({
      email: String(formData.get("email")),
      redirectTo: "/reset-password",
    });
    setPending(false);
    if (error) {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
      return;
    }
    setSent(true);
  }

  return (
    <AuthCard
      title="パスワード再設定"
      description="登録したメールアドレスに再設定用のリンクを送ります。"
    >
      {sent ? (
        <FormMessage success="メールアドレスが登録されていれば、再設定用のメールが届きます。" />
      ) : (
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <FormMessage error={error} />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "送信中…" : "再設定メールを送る"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
