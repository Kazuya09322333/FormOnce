# Supabase OAuth Setup Guide

このガイドでは、FormOnceアプリケーションでSupabase OAuthを使用してGoogle認証を設定する方法を説明します。

## 前提条件

- Supabaseアカウント（無料プランで十分）
- Supabaseプロジェクトが作成済み
- Google Cloud Console アカウント

## セットアップ手順

### 1. Google Cloud Console でOAuth認証情報を作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択または新規作成
3. 左側のメニューから **APIとサービス** > **認証情報** に移動
4. **認証情報を作成** > **OAuthクライアントID** をクリック
5. アプリケーションの種類: **ウェブアプリケーション** を選択
6. 以下の情報を入力:
   - **名前**: `FormOnce - Supabase Auth`
   - **承認済みのJavaScript生成元**:
     - `http://localhost:3000` (開発環境用)
     - あなたのプロダクションURL (例: `https://your-app.com`)
   - **承認済みのリダイレクトURI**:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - **重要**: `YOUR_SUPABASE_PROJECT_REF` を実際のSupabaseプロジェクト参照IDに置き換えてください

7. **作成** をクリック
8. **クライアントID** と **クライアントシークレット** をコピーして保存

### 2. Supabase でGoogle OAuth プロバイダーを設定

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. 左側のメニューから **Authentication** > **Providers** に移動
4. **Google** プロバイダーを見つけてクリック
5. 以下の設定を行う:
   - **Enable Sign in with Google**: トグルをONにする
   - **Client ID**: Google Cloud ConsoleからコピーしたクライアントIDを貼り付け
   - **Client Secret**: Google Cloud Consoleからコピーしたクライアントシークレットを貼り付け
   - **Redirect URL**: 自動的に表示されるURL（これをGoogle Cloud Consoleに追加済みであることを確認）
6. **Save** をクリック

### 3. Supabaseの認証設定を確認

1. **Authentication** > **URL Configuration** に移動
2. 以下のURLを追加:
   - **Site URL**: `http://localhost:3000` (開発環境) または プロダクションURL
   - **Redirect URLs**: 以下を追加
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com/auth/callback` (プロダクション用)

### 4. 環境変数を設定

`.env` ファイルに以下の環境変数を設定します:

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth設定（互換性のため残す場合）
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

**Supabase認証情報の取得方法:**
1. Supabase Dashboard で **Project Settings** (歯車アイコン) をクリック
2. **API** セクションに移動
3. 以下をコピー:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ これは秘密情報です！)

### 5. アプリケーションを起動

```bash
# 依存関係をインストール（必要な場合）
pnpm install

# 開発サーバーを起動
pnpm dev
```

## 使用方法

### サインイン/サインアップ

1. ブラウザで `http://localhost:3000/auth/signin` にアクセス
2. **Google** ボタンをクリック
3. Googleアカウントでサインイン
4. 認証が完了すると `/dashboard` にリダイレクトされます

### 認証フロー

1. ユーザーがGoogleボタンをクリック
2. Supabase OAuthフローが開始される
3. Googleの認証ページにリダイレクト
4. ユーザーがGoogleアカウントで認証
5. `/auth/callback` にリダイレクト
6. Supabaseセッションが確立される
7. `/dashboard` にリダイレクト

## トラブルシューティング

### Google OAuthが機能しない

**症状**: Googleボタンをクリックしても何も起こらない、またはエラーが発生する

**解決方法**:
1. ブラウザのコンソールでエラーを確認
2. Supabase環境変数が正しく設定されているか確認
3. Google Cloud ConsoleのリダイレクトURIが正しく設定されているか確認
4. Supabase DashboardでGoogleプロバイダーが有効になっているか確認

### リダイレクトエラー

**症状**: `redirect_uri_mismatch` エラー

**解決方法**:
1. Google Cloud ConsoleのリダイレクトURIを確認
2. 正しいSupabaseプロジェクト参照IDを使用しているか確認
3. URIは完全一致する必要があります（末尾のスラッシュにも注意）

### セッションが確立されない

**症状**: 認証後にダッシュボードにリダイレクトされない

**解決方法**:
1. ブラウザのCookieが有効になっているか確認
2. `/auth/callback` ページが正しく動作しているか確認
3. ブラウザのコンソールでログを確認
4. Supabaseのログを確認（Dashboard > Logs > Auth）

### 開発環境でのデバッグ

`src/components/auth/UserAuthForm.supabase.tsx` にはデバッグログが含まれています:

```typescript
console.log('[Google OAuth] Starting sign in with redirect:', redirectUrl)
console.log('[Google OAuth] Response:', { data, error })
```

これらのログをブラウザコンソールで確認してください。

## NextAuthから移行する場合

既存のNextAuth + Google Providerを使用している場合:

### 削除できるもの

1. **NextAuth関連のコード**:
   - `src/server/auth.ts` の GoogleProvider 設定
   - `src/pages/api/auth/[...nextauth].ts` (完全移行後)

2. **環境変数**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - これらはSupabase側で管理されます

### 保持するもの

1. **コンポーネント**:
   - `src/components/auth/UserAuthForm.supabase.tsx` (既にSupabase用)
   - `src/pages/auth/callback.tsx` (OAuth callback handler)

2. **サーバーサイド認証**:
   - `src/server/auth-supabase.ts` (Supabaseセッション取得)
   - `getServerAuthSessionSupabase` を使用しているページ

## セキュリティのベストプラクティス

1. ⚠️ **Service Role Key を公開しない**
   - `.env.local` に保存し、Gitにコミットしない
   - Vercelなどのホスティングサービスでは環境変数として設定

2. **Redirect URLを制限する**
   - 信頼できるドメインのみをSupabaseの設定に追加

3. **Row Level Security (RLS) を有効にする**
   - Supabase Databaseでユーザーデータを保護

4. **HTTPS を使用する**
   - プロダクション環境では必ずHTTPSを使用

## プロダクション デプロイメント

### Vercelにデプロイする場合

1. Vercelプロジェクトの **Settings** > **Environment Variables** に移動
2. 以下の環境変数を追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET` (互換性のため)
   - `NEXTAUTH_URL` (プロダクションURL)

3. Google Cloud ConsoleにプロダクションURLを追加:
   - **承認済みのJavaScript生成元**: `https://your-app.vercel.app`
   - **承認済みのリダイレクトURI**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

4. Supabase の **URL Configuration** にプロダクションURLを追加:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## 追加機能

### GitHub OAuthを追加する

同様の手順で、GitHubプロバイダーも追加できます:

1. [GitHub Developer Settings](https://github.com/settings/developers) で OAuth App を作成
2. Supabase Dashboard で GitHub プロバイダーを有効化
3. `UserAuthForm.supabase.tsx` の `handleGithubSignIn` が既に実装済み

### メール/パスワード認証

Supabaseでは、Email/Password認証も自動的に有効になっています。
`UserAuthForm.supabase.tsx` では既に実装済みです。

## 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Next.js with Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## サポート

問題が発生した場合:
1. ブラウザのコンソールログを確認
2. Supabase Dashboard の Auth Logs を確認
3. このドキュメントのトラブルシューティングセクションを参照
4. [Supabase Discord](https://discord.supabase.com/) でサポートを求める
