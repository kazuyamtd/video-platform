import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { safeCallback } from "@/lib/safe-callback";
import { getSession } from "@/lib/session";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "新規登録" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const callbackURL = safeCallback((await searchParams).callbackURL);
  if (await getSession()) redirect(callbackURL);

  return (
    <AuthCard
      title="新規登録"
      description="登録後、確認メールのリンクを開くと受講を始められます。"
    >
      <SignUpForm callbackURL={callbackURL} />
    </AuthCard>
  );
}
