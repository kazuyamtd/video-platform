"use client";

import Link from "next/link";
import { useState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const { error } = await authClient.resetPassword({
      newPassword: String(formData.get("password")),
      token,
    });
    setPending(false);
    if (error) {
      setError(
        error.code === "INVALID_TOKEN"
          ? "リンクの有効期限が切れています。もう一度再設定メールを送ってください。"
          : "再設定に失敗しました。",
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm">
        パスワードを変更しました。{" "}
        <Link href="/sign-in" className="underline">
          ログイン
        </Link>
      </p>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">新しいパスワード（8文字以上）</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <FormMessage error={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "変更中…" : "パスワードを変更"}
      </Button>
    </form>
  );
}
