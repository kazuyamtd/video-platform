import Link from "next/link";
import { PenguinMark } from "@/components/penguin-mark";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <PenguinMark size={96} className="-rotate-12" />
      <h1 className="mt-6 text-3xl font-black">ページが見つかりません</h1>
      <p className="mt-3 text-pebble">
        URL が変わったか、ページが削除された可能性があります。講座一覧から探してください。
      </p>
      <Link href="/courses" className={buttonVariants({ size: "lg", className: "mt-8" })}>
        講座一覧へ
      </Link>
    </div>
  );
}
