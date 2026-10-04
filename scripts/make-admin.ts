/**
 * 登録済みユーザーを管理者にする。
 *   npm run make-admin -- you@example.com
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { user } from "../src/db/schema";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("使い方: npm run make-admin -- <email>");
    process.exit(1);
  }
  const updated = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id });
  if (updated.length === 0) {
    console.error(`ユーザーが見つかりません: ${email}（先にサイトで新規登録してください）`);
    process.exit(1);
  }
  console.log(`${email} を管理者にしました`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
