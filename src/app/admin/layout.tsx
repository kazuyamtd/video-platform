import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">管理画面</span>
        <Link href="/admin/courses" className="hover:text-foreground">
          講座
        </Link>
      </div>
      {children}
    </div>
  );
}
