# 今日の予定 — MVP

Googleカレンダーと連携した1日のスケジュール管理アプリ。

## セットアップ

### 1. 依存関係のインストール

```bash
cd my-mvp
npm install
```

### 2. Supabase の準備

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. **SQL Editor** で `supabase/schema.sql` を実行
3. **Authentication → Providers → Google** を有効化
4. [Google Cloud Console](https://console.cloud.google.com/) で OAuth クライアントを作成
   - 承認済みリダイレクト URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - スコープに `https://www.googleapis.com/auth/calendar.readonly` を追加
5. Supabase の Google プロバイダに Client ID / Secret を設定
6. **Authentication → URL Configuration** に Site URL を追加
   - ローカル: `http://localhost:3000`
   - 本番: Vercel の URL
7. Redirect URLs に `http://localhost:3000/auth/callback` を追加

### 3. 環境変数

`.env.example` をコピーして `.env.local` を作成し、Supabase の値を入力:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. ローカル起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## デプロイ（Vercel）

`my-mvp` は **ai-course-starter とは別の Git リポジトリ**に push してください。

```bash
cd my-mvp
git init
git add .
git commit -m "initial commit"
# GitHub で空リポジトリを作成後
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Vercel でリポジトリを接続し、環境変数を設定してデプロイ。

## 画面

| ルート | 画面 |
|--------|------|
| `/` | S1 ログイン |
| `/today` | S2 今日の予定一覧 |
| `/settings` | S3 設定 |
