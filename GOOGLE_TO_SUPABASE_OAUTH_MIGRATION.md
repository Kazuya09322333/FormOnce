# Google OAuth から Supabase OAuth への移行ガイド

このドキュメントでは、NextAuth + Google ProviderからSupabase OAuthへの移行について説明します。

## 移行の概要

### 変更前 (NextAuth + Google Provider)
```
ユーザー → Google OAuth → NextAuth → アプリケーション
                          ↓
                    環境変数にクライアント情報
```

### 変更後 (Supabase OAuth)
```
ユーザー → Google OAuth → Supabase Auth → アプリケーション
                          ↓
                    Supabaseダッシュボードで管理
```

## メリット

1. **一元管理**: 認証プロバイダーの設定をSupabaseダッシュボードで管理
2. **セキュリティ向上**: クライアントシークレットを環境変数に保存する必要がない
3. **簡素化**: NextAuthの設定が不要になる
4. **統合性**: Supabase Storageと同じ認証システムを使用
5. **スケーラビリティ**: Supabaseが認証インフラを管理

## 現在の状態

### 既に実装済みの機能

✅ **Supabaseクライアント設定**
- `src/lib/supabase.ts` - クライアントサイドSupabaseクライアント
- `src/lib/supabase-server.ts` - サーバーサイドSupabaseクライアント

✅ **認証コンポーネント**
- `src/components/auth/UserAuthForm.supabase.tsx` - Supabase OAuth対応のフォーム
- `src/components/auth/index.ts` - デフォルトでSupabaseコンポーネントをエクスポート

✅ **OAuth Callback ページ**
- `src/pages/auth/callback.tsx` - OAuth認証後のコールバック処理

✅ **サーバーサイド認証**
- `src/server/auth-supabase.ts` - Supabaseセッション取得ヘルパー
- `src/pages/dashboard/forms/[id]/index.tsx` - 既にSupabase認証を使用

✅ **パッケージ**
- `@supabase/supabase-js` - インストール済み
- `@supabase/auth-helpers-nextjs` - インストール済み

### 残存するNextAuthコード

以下のファイルにはまだNextAuth関連のコードが残っています:

📝 **保持されているファイル**
- `src/server/auth.ts` - NextAuthの設定（GoogleProvider含む）
- `src/pages/api/auth/[...nextauth].ts` - NextAuth APIルート
- `src/components/auth/UserAuthForm.tsx` - NextAuth版フォーム（使用されていない）
- `src/components/auth/UserAuthForm.nextauth.tsx` - NextAuth版フォーム（バックアップ）

これらは、完全な移行が確認されるまで保持することをお勧めします。

## 移行手順

### ステップ 1: Supabase OAuth設定

詳細は `SUPABASE_OAUTH_SETUP.md` を参照してください。

1. Google Cloud ConsoleでOAuthクライアント作成
2. Supabase DashboardでGoogleプロバイダー有効化
3. リダイレクトURL設定

### ステップ 2: 環境変数の更新

`.env` ファイルを更新:

```env
# 必須: Supabase認証情報
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 互換性のため保持（完全移行後は削除可能）
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

### ステップ 3: アプリケーションのテスト

```bash
# 開発サーバー起動
pnpm dev

# テスト項目
# 1. サインインページにアクセス: http://localhost:3000/auth/signin
# 2. Googleボタンをクリック
# 3. Google認証フローを完了
# 4. ダッシュボードにリダイレクトされることを確認
# 5. フォーム作成など、認証が必要な操作をテスト
```

### ステップ 4: NextAuthコードの削除（オプション）

完全にSupabase OAuthに移行した後、以下のファイルを削除できます:

```bash
# NextAuth設定ファイル
# rm src/server/auth.ts
# rm src/pages/api/auth/[...nextauth].ts

# NextAuth版コンポーネント
# rm src/components/auth/UserAuthForm.tsx
# rm src/components/auth/UserAuthForm.nextauth.tsx

# 環境変数から削除
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
# GITHUB_CLIENT_ID (使用していない場合)
# GITHUB_CLIENT_SECRET (使用していない場合)
```

⚠️ **注意**: 削除する前に、すべての機能が正常に動作することを確認してください。

## コード比較

### 認証フォーム

**NextAuth版** (`UserAuthForm.tsx`):
```typescript
import { signIn } from 'next-auth/react'

const handleGoogleSignIn = () => {
  setisGoogleLoading(true)
  void signIn('google', { callbackUrl: '/dashboard' })
  setisGoogleLoading(false)
}
```

**Supabase版** (`UserAuthForm.supabase.tsx`):
```typescript
import { supabase } from '~/lib/supabase'

const handleGoogleSignIn = async () => {
  setisGoogleLoading(true)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) toast.error(error.message)
  setisGoogleLoading(false)
}
```

### サーバーサイド認証

**NextAuth版** (`src/server/auth.ts`):
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '~/server/auth'

export const getServerAuthSession = (ctx) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
```

**Supabase版** (`src/server/auth-supabase.ts`):
```typescript
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export const getServerAuthSessionSupabase = async (ctx) => {
  const supabase = createPagesServerClient(ctx)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name || user.email,
    },
  }
}
```

### ページでの使用

**NextAuth版**:
```typescript
import { getServerAuthSession } from '~/server/auth'

export const getServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx)

  if (!session) {
    return { redirect: { destination: '/auth/signin', permanent: false } }
  }

  return { props: { formId: ctx.query.id } }
}
```

**Supabase版** (既に実装済み):
```typescript
import { getServerAuthSessionSupabase } from '~/server/auth-supabase'

export const getServerSideProps = async (ctx) => {
  const session = await getServerAuthSessionSupabase(ctx)

  if (!session) {
    return { redirect: { destination: '/auth/signin', permanent: false } }
  }

  return { props: { formId: ctx.query.id } }
}
```

## データベース移行

### ユーザーデータの互換性

NextAuthとSupabaseは異なるユーザーIDを生成します。既存のユーザーデータを移行する場合:

**オプション 1: 新規ユーザーとして開始**
- 最もシンプル
- 既存ユーザーは新しいアカウントを作成

**オプション 2: メールアドレスでマッピング**
- 同じメールアドレスを持つユーザーを関連付ける
- 追加のマッピングテーブルが必要

**オプション 3: 両方のシステムをサポート**
- NextAuthとSupabaseの両方で認証可能
- より複雑だが、段階的な移行が可能

現在の実装では、**オプション 1** が推奨されます。

## トラブルシューティング

### 両方の認証システムが有効な場合

現在、以下の状況が発生する可能性があります:

1. **NextAuth APIルートが存在** (`/api/auth/[...nextauth]`)
2. **Supabaseコンポーネントが使用されている** (デフォルト)

この場合、サインインページではSupabase OAuthが使用されますが、NextAuth APIは動作したままです。

### 混在環境でのデバッグ

どちらの認証システムが使用されているか確認:

```typescript
// クライアントサイド
console.log('Using Supabase Auth:', !!window.supabase)

// サーバーサイド
console.log('Auth method:', session.user.provider) // nextauth or supabase
```

### セッション管理の違い

| 項目 | NextAuth | Supabase Auth |
|------|----------|---------------|
| セッション保存 | JWTまたはデータベース | JWTのみ |
| Cookie名 | `next-auth.session-token` | `sb-*-auth-token` |
| セッション期限 | 設定可能（デフォルト30日） | 設定可能（デフォルト1時間） |
| リフレッシュトークン | オプション | 自動 |

## ロールバック手順

Supabase OAuthで問題が発生した場合、NextAuthに戻す方法:

1. `src/components/auth/index.ts` を変更:
```typescript
// Supabase版
export { UserAuthFormSupabase as UserAuthForm } from './UserAuthForm.supabase'

// NextAuth版にロールバック
export { UserAuthForm } from './UserAuthForm.nextauth'
```

2. サーバーサイド認証を変更:
```typescript
// pages/dashboard/forms/[id]/index.tsx
import { getServerAuthSession } from '~/server/auth'

export const getServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx)
  // ...
}
```

3. 環境変数を元に戻す:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## チェックリスト

移行が完了したことを確認するためのチェックリスト:

### 設定
- [ ] Google Cloud ConsoleでOAuthクライアント作成済み
- [ ] Supabase DashboardでGoogleプロバイダー有効化済み
- [ ] 環境変数設定済み（Supabase URL, Keys）
- [ ] リダイレクトURL設定済み

### 機能テスト
- [ ] Googleでサインイン可能
- [ ] Googleでサインアップ可能
- [ ] メール/パスワードでサインイン可能
- [ ] メール/パスワードでサインアップ可能
- [ ] ダッシュボードアクセス可能
- [ ] フォーム作成・編集可能
- [ ] ビデオアップロード可能（同じSupabase認証を使用）
- [ ] サインアウト可能

### プロダクション準備
- [ ] Vercel環境変数設定済み
- [ ] プロダクションURLをGoogle Cloud Consoleに追加済み
- [ ] プロダクションURLをSupabase設定に追加済み
- [ ] HTTPSで動作確認済み
- [ ] 本番環境でのテスト完了

## サポート

質問や問題がある場合:

1. `SUPABASE_OAUTH_SETUP.md` のトラブルシューティングセクションを参照
2. Supabase Dashboard の Auth Logs を確認
3. ブラウザのコンソールログを確認
4. [Supabase Discord](https://discord.supabase.com/) でサポートを求める

## 関連ドキュメント

- [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md) - 詳細なセットアップガイド
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase Storage設定
- [.env.example](./.env.example) - 環境変数のサンプル

## まとめ

この移行により、以下が実現されます:

✅ **シンプルな認証フロー**: Supabaseが全て管理
✅ **一貫性**: Storage と Auth が同じシステム
✅ **セキュリティ**: クライアントシークレットを環境変数に保存不要
✅ **スケーラビリティ**: Supabaseの堅牢なインフラを活用

移行は既に**80%完了**しています。残りは設定とテストのみです！
