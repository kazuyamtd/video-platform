import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Logo } from "./penguin-mark";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-6">
        <Link href="/" aria-label="ペンギンラボ トップへ">
          <Logo />
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm font-bold text-pebble sm:gap-5">
          <Link href="/courses" className="hover:text-ink">
            講座一覧
          </Link>
          {/* スマホではフッターから辿る */}
          <Link href="/pricing" className="hidden hover:text-ink sm:inline">
            サブスクプラン
          </Link>
          {session && (
            <Link href="/account/purchases" className="hidden hover:text-ink sm:inline">
              購入履歴
            </Link>
          )}
          {session?.user.role === "admin" && (
            <Link href="/admin/courses" className="hidden hover:text-ink sm:inline">
              管理画面
            </Link>
          )}
        </nav>
        {session ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-pebble md:inline">{session.user.name} さん</span>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href="/sign-in"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}
            >
              ログイン
            </Link>
            <Link href="/sign-up" className={buttonVariants({ variant: "cta", size: "sm" })}>
              無料で登録
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
