import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="font-semibold">
          Video Platform
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground">
            講座一覧
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            料金プラン
          </Link>
          {session && (
            <Link href="/account/purchases" className="hover:text-foreground">
              購入履歴
            </Link>
          )}
          {session?.user.role === "admin" && (
            <Link href="/admin/courses" className="hover:text-foreground">
              管理画面
            </Link>
          )}
        </nav>
        {session ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              ログイン
            </Link>
            <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
              新規登録
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
