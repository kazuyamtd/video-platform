import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4 rounded-2xl bg-ink px-4 py-3 text-sm text-white/75">
        <span className="font-heading font-bold text-white">管理画面</span>
        <Link href="/admin/courses" className="font-bold hover:text-white">
          講座
        </Link>
        <Link href="/" className="ml-auto hover:text-white">
          サイトを表示
        </Link>
      </div>
      {children}
    </div>
  );
}
