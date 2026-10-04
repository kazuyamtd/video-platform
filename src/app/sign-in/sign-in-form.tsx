"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "@/components/auth-card";
import { GoogleButton } from "@/components/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignInForm({
  callbackURL,
  googleEnabled,
}: {
  callbackURL: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      callbackURL,
    });
    setPending(false);
    if (error) {
      setError(
        error.code === "EMAIL_NOT_VERIFIED"
          ? "メールアドレスが未確認です。確認メールを再送しました。"
          : "メールアドレスまたはパスワードが正しくありません。",
      );
      return;
    }
    router.push(callbackURL);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">パスワード</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:underline"
            >
              パスワードを忘れた方
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <FormMessage error={error} />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "ログイン中…" : "ログイン"}
        </Button>
      </form>
      {googleEnabled && <GoogleButton callbackURL={callbackURL} />}
      <p className="text-center text-sm text-muted-foreground">
        アカウントをお持ちでない方は{" "}
        <Link
          href={`/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`}
          className="underline"
        >
          新規登録
        </Link>
      </p>
    </div>
  );
}
