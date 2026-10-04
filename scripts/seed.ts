/**
 * 開発用サンプルデータ。3種類の受講方式（無料 / 買い切り / サブスク）の講座を作る。
 * 既に同じスラッグの講座があればスキップする。
 *   npm run seed
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { course, lesson, section } from "../src/db/schema";

// Vimeo 公式の公開デモ動画
const SAMPLE_VIDEO = "76979871";

type SeedCourse = typeof course.$inferInsert & {
  sections: { title: string; lessons: { title: string; isPreview?: boolean }[] }[];
};

const courses: SeedCourse[] = [
  {
    slug: "getting-started",
    title: "はじめての動画学習（無料）",
    description: "ログインするだけで受講できる無料講座のサンプルです。",
    accessType: "free",
    isPublished: true,
    sortOrder: 0,
    sections: [
      {
        title: "イントロダクション",
        lessons: [{ title: "この講座について" }, { title: "受講の進め方" }],
      },
    ],
  },
  {
    slug: "pro-course",
    title: "実践プロ講座（買い切り）",
    description: "一度購入すればずっと視聴できる買い切り講座のサンプルです。",
    accessType: "purchase",
    priceJpy: 9800,
    isPublished: true,
    sortOrder: 1,
    sections: [
      {
        title: "第1章 基礎",
        lessons: [{ title: "全体像をつかむ", isPreview: true }, { title: "基本操作" }],
      },
      { title: "第2章 応用", lessons: [{ title: "応用テクニック" }] },
    ],
  },
  {
    slug: "members-library",
    title: "メンバー限定ライブラリ（サブスク）",
    description: "月額サブスク会員なら見放題になる講座のサンプルです。",
    accessType: "subscription",
    isPublished: true,
    sortOrder: 2,
    sections: [
      {
        title: "今月のテーマ",
        lessons: [{ title: "今月のテーマ紹介", isPreview: true }, { title: "深掘り解説" }],
      },
    ],
  },
];

async function main() {
  for (const { sections, ...data } of courses) {
    const exists = await db.query.course.findFirst({ where: eq(course.slug, data.slug) });
    if (exists) {
      console.log(`skip: ${data.slug}`);
      continue;
    }
    const [c] = await db.insert(course).values(data).returning({ id: course.id });
    for (const [i, s] of sections.entries()) {
      const [sec] = await db
        .insert(section)
        .values({ courseId: c.id, title: s.title, sortOrder: i })
        .returning({ id: section.id });
      await db.insert(lesson).values(
        s.lessons.map((l, j) => ({
          sectionId: sec.id,
          title: l.title,
          isPreview: l.isPreview ?? false,
          vimeoVideoId: SAMPLE_VIDEO,
          durationSec: 62,
          bodyMarkdown: `${l.title} の補足テキストです。`,
          sortOrder: j,
        })),
      );
    }
    console.log(`created: ${data.slug}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
