import Image from "next/image";
import { cn } from "@/lib/utils";

/** ペンギンラボのロゴマーク（ペンギンのみ・白フチ付きの透過画像） */
export function PenguinMark({
  className,
  size = 32,
  priority = false,
}: {
  className?: string;
  /** 表示サイズ（px）。画像はこの大きさに合わせて最適化される */
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/penguin-mark.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** ロゴ（マーク + サイト名） */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PenguinMark size={36} priority />
      <span className="font-heading text-lg font-black tracking-wide">ペンギンラボ</span>
    </span>
  );
}

/** ロゴ全体（ペンギン + 文字）。ログイン画面など、ロゴを大きく見せたい場所用 */
export function FullLogo({ className, width = 180 }: { className?: string; width?: number }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="ペンギンラボ"
      width={width}
      height={Math.round((width * 372) / 480)}
      priority
      className={cn("select-none", className)}
    />
  );
}
