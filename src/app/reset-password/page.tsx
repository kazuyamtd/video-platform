import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "新しいパスワード" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;

  if (typeof token !== "string" || error) {
    return (
      <AuthCard title="リンクが無効です">
        <p className="text-sm">
          リンクの有効期限が切れているか、既に使用されています。{" "}
          <Link href="/forgot-password" className="underline">
            もう一度再設定メールを送る
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="新しいパスワード">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
