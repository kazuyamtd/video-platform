import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type Email = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: Email) {
  if (!resend) {
    // 開発用: APIキー未設定ならコンソールに出す（リンクをコピーして使う）
    console.log(`\n[email] to=${to}\nsubject=${subject}\n${html}\n`);
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`メール送信に失敗しました: ${error.message}`);
}
