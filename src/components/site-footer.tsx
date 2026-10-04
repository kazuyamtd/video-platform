import Link from "next/link";
import { Logo } from "./penguin-mark";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-white/70">
            今話題のAIの使い方から広告運用まで。仕事に使えるスキルを短い動画で学べるオンライン講座です。
          </p>
        </div>
        <nav className="flex gap-8 text-sm text-white/80">
          <Link href="/courses" className="hover:text-white">
            講座一覧
          </Link>
          <Link href="/pricing" className="hover:text-white">
            サブスクプラン
          </Link>
        </nav>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} ペンギンラボ
      </p>
    </footer>
  );
}
