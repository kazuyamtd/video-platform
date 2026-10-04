import type { Metadata } from "next";
import { BIZ_UDPGothic, Geist_Mono, Zen_Maru_Gothic } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// 見出し: 丸ゴシックで親しみやすく / 本文: 長いレッスンでも読みやすい UD フォント
const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-display",
  weight: ["500", "700", "900"],
  subsets: ["latin"],
});

const bizUdpGothic = BIZ_UDPGothic({
  variable: "--font-body",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ペンギンラボ | 動画で学ぶオンライン講座", template: "%s | ペンギンラボ" },
  description: "今話題のAIの使い方から広告運用まで。仕事に使えるスキルを短い動画で学べるオンライン講座。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${zenMaruGothic.variable} ${bizUdpGothic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
