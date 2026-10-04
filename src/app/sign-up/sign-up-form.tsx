"use client";

import Link from "next/link";
import { useState } from "react";
import { FormMessage } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignUpForm({ callbackURL }: { callbackURL: string }) {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = String(formData.get("email"));
    const { error } = await authClient.signUp.email({
      name: String(formData.get("name")),
      email,
      password: String(formData.get("password")),
      callbackURL,
    });
    setPending(false);
    if (error) {
      setError(
        error.code?.startsWith("USER_ALREADY_EXISTS")
          ? "このメールアドレスは既に登録されています。"
          : error.code === "PASSWORD_TOO_SHORT"
            ? "パスワードは8文字以上にしてください。"
            : "登録に失敗しました。時間をおいて再度お試しください。",
      );
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <p className="text-sm">
        <strong>{sentTo}</strong>{" "}
        に確認メールを送信しました。メール内のリンクを開いて登録を完了してください。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">お名前</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード（8文字以上）</Label>
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
          {pending ? "送信中…" : "登録する"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        登録済みの方は{" "}
        <Link
          href={`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`}
          className="underline"
        >
          ログイン
        </Link>
      </p>
    </div>
  );
}
