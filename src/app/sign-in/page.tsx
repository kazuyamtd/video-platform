import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { safeCallback } from "@/lib/safe-callback";
import { getSession } from "@/lib/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "ログイン" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const callbackURL = safeCallback((await searchParams).callbackURL);
  if (await getSession()) redirect(callbackURL);

  return (
    <AuthCard title="ログイン">
      <SignInForm callbackURL={callbackURL} />
    </AuthCard>
  );
}
