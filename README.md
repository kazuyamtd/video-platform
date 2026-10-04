# Video Platform

Vimeo の動画を使った講座販売プラットフォーム。講座ごとに **無料（ログインのみ） / 買い切り / 月額サブスク** を選べる。

- Next.js 16（App Router）/ Better-Auth / Turso（libSQL）+ Drizzle ORM / Tailwind CSS + shadcn/ui
- 決済は Stripe（買い切り = Checkout、サブスク = `@better-auth/stripe`）
- 視聴進捗・資料DL（Cloudflare R2）は今後のフェーズで実装

## セットアップ

```bash
npm install
cp .env.example .env.local   # BETTER_AUTH_SECRET を設定（下記）
npm run db:migrate           # ローカルDB（local.db）にテーブル作成
npm run seed                 # サンプル講座（無料 / 買い切り / サブスク）を投入
npm run dev
```

`BETTER_AUTH_SECRET` は次のコマンドで生成できる:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 管理者になる

1. http://localhost:3000/sign-up で登録する
2. `RESEND_API_KEY` が未設定なら、確認メールの本文は **dev サーバーのコンソール** に出力される。そのリンクを開いて確認を完了する
3. `npm run make-admin -- you@example.com`
4. ヘッダーの「管理画面」から講座・章・レッスンを編集できる

### 任意の外部サービス

| 変数 | 未設定のとき |
|---|---|
| `RESEND_API_KEY` / `EMAIL_FROM` | メールをコンソールに出力する |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | `file:local.db` を使う（本番は Turso の URL とトークン） |

## Stripe（決済）

1. Stripe のサンドボックスで「開発者 → APIキー」のシークレットキーを `STRIPE_SECRET_KEY` に設定
2. サブスク用に、月額の Price を作成して lookup key `standard_monthly` を付ける（金額などは `src/lib/plan.ts`）
3. カスタマーポータルの設定を保存しておく（解約・カード変更に使う）
4. ローカルで webhook を受けるには、別ターミナルで次を実行し、表示された `whsec_...` を `STRIPE_WEBHOOK_SECRET` に設定する

```bash
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

webhook は `/api/stripe/webhook` に1本化している。買い切りはそこで処理し、サブスク関連は Better-Auth Stripe プラグインへ転送する。

テストカード: `4242 4242 4242 4242`（有効期限は未来の日付、CVC は任意）

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm test` | ユニットテスト（Vitest） |
| `npm run db:generate` | スキーマ変更からマイグレーションを生成 |
| `npm run db:migrate` | マイグレーションを適用 |
| `npm run seed` | サンプルデータ投入 |
| `npm run make-admin -- <email>` | ユーザーを管理者にする |

## 動画の保護について

- レッスンの Vimeo ID は、視聴権限がある場合にだけサーバーから HTML に出力する（`src/lib/access.ts` で判定）。
- **リリース前に必ず**: Vimeo を有料プラン（Starter 以上）にして、各動画のプライバシーを「埋め込み: 特定のドメインのみ」に本番ドメインを設定する。無料プランのままだと、ID を知っている人は Vimeo 上で直接再生できる。
