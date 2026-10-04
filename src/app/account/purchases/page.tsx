import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { course, purchase } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "購入履歴" };

const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeZone: "Asia/Tokyo",
});

export default async function PurchasesPage() {
  const session = await requireUser("/account/purchases");
  const rows = await db
    .select({
      id: purchase.id,
      amountJpy: purchase.amountJpy,
      createdAt: purchase.createdAt,
      title: course.title,
      slug: course.slug,
    })
    .from(purchase)
    .innerJoin(course, eq(purchase.courseId, course.id))
    .where(eq(purchase.userId, session.user.id))
    .orderBy(desc(purchase.createdAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-black">購入履歴</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          購入した講座はまだありません。
          <Link href="/courses" className="ml-1 underline">
            講座一覧を見る
          </Link>
        </p>
      ) : (
        <ul className="mt-8 divide-y overflow-hidden rounded-2xl border">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <Link href={`/courses/${row.slug}`} className="font-medium hover:underline">
                  {row.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {dateFormat.format(row.createdAt)}
                </p>
              </div>
              <span className="text-sm">{formatPrice(row.amountJpy)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
