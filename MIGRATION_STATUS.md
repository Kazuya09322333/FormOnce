# FormOnce Supabase 移行ステータス

最終更新: 2025-10-30

## ✅ 完了した作業

### 1. Supabaseプロジェクトのセットアップ
- **プロジェクト名**: formonce-test
- **プロジェクトID**: rmldynmhlrllervplyxq
- **リージョン**: ap-northeast-1 (東京)
- **ステータス**: ACTIVE_HEALTHY

### 2. 環境変数の設定
`.env` ファイルに以下を追加済み：

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:***@db.rmldynmhlrllervplyxq.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:***@db.rmldynmhlrllervplyxq.supabase.co:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://rmldynmhlrllervplyxq.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. パッケージのインストール
```bash
✅ @supabase/supabase-js
✅ @supabase/auth-helpers-nextjs
```

### 4. Supabaseクライアントファイルの作成
- ✅ `src/lib/supabase.ts` - クライアント用Supabaseクライアント
- ✅ `src/lib/supabase-server.ts` - サーバー用Supabaseクライアント

### 5. Prismaスキーマの更新
- ✅ `directUrl` 設定を追加（Supabase Connection Pooler対応）
- ✅ データベーススキーマ適用完了（15テーブル）

### 6. データベース接続確認
- ✅ Supabase PostgreSQLに接続成功
- ✅ Prismaスキーマと同期済み

---

## 🚧 次のステップ（段階的移行）

### フェーズ1: データベース接続テスト（最優先）
現在の状態で既にSupabaseデータベースに接続されているため、動作確認を行います。

**やること:**
1. ローカル開発サーバーを起動（既に起動している場合は再起動）
   ```bash
   pnpm dev
   ```
2. ブラウザで http://localhost:3000 を開く
3. 既存の機能が正常に動作するか確認

**期待される動作:**
- NextAuth認証が動作する（Supabaseデータベース使用）
- フォームの作成・編集が動作する
- データがSupabase PostgreSQLに保存される

---

### フェーズ2: Authentication（NextAuth → Supabase Auth）
**状態**: 未実施（NextAuthは現在も動作中）

**必要な作業:**
1. Supabase Dashboard でOAuthプロバイダーを設定
   - Google OAuth設定
   - GitHub OAuth設定
   - Email/Password認証設定

2. 認証関連ファイルの作成:
   - `src/app/api/auth/callback/route.ts`（OAuth コールバック）
   - `src/app/api/auth/signout/route.ts`（サインアウト）
   - `src/hooks/useAuth.ts`（認証フック）

3. 認証ページの書き換え:
   - `src/pages/auth/signin.tsx`
   - `src/pages/auth/signup.tsx`

4. tRPC認証ミドルウェアの更新:
   - `src/server/api/trpc.ts`

**注意事項:**
- NextAuthの設定は残したまま、並行してSupabase Authを実装
- 完全に動作確認後、NextAuthを削除

---

### フェーズ3: Storage（Backblaze B2 → Supabase Storage）
**状態**: 未実施

**必要な作業:**
1. Supabase Storageバケットの作成
   - バケット名: `uploads`
   - RLSポリシー設定

2. ビデオアップロード機能の書き換え:
   - `src/server/api/routers/video/router.ts`

3. フロントエンドのアップロードコンポーネント更新

**注意事項:**
- Bunny.net（ビデオCDN）は継続使用
- Supabase Storageは一時アップロード先として使用

---

## 📊 現在の状態

| コンポーネント | 移行前 | 現在 | 最終目標 |
|-------------|--------|------|---------|
| Database | Neon | **Supabase** ✅ | Supabase |
| ORM | Prisma | **Prisma** ✅ | Prisma |
| Auth | NextAuth | **NextAuth** ⚠️ | Supabase Auth |
| Storage | Backblaze B2 | **Backblaze B2** ⚠️ | Supabase Storage |
| Video CDN | Bunny.net | **Bunny.net** ✅ | Bunny.net |

**凡例:**
- ✅ = 移行完了
- ⚠️ = 移行前（既存システム使用中）
- 🚧 = 移行作業中

---

## 🔍 動作確認チェックリスト

### データベース接続
- [ ] `pnpm dev` でサーバー起動
- [ ] エラーなく起動する
- [ ] データベース接続が成功する

### 既存機能の動作確認
- [ ] サインイン/サインアップが動作する
- [ ] フォーム作成が動作する
- [ ] ワークスペース管理が動作する
- [ ] データがSupabaseに保存される

### Prisma Studio確認
```bash
pnpx prisma studio
```
- [ ] Prisma Studioが起動する
- [ ] テーブル一覧が表示される
- [ ] データが表示される

---

## ⚠️ 既知の問題

### Prisma Client生成エラー
**症状:**
```
EPERM: operation not permitted, rename 'query-engine-windows.exe.tmp'
```

**原因:**
- 開発サーバーが起動中でファイルがロックされている
- ウイルス対策ソフトがファイルアクセスをブロック

**対処方法:**
1. 開発サーバーを停止する
2. VSCodeを再起動する
3. 以下のコマンドを実行:
   ```bash
   pnpm install
   pnpx prisma generate
   ```

**影響:**
現時点では影響なし。データベース接続は正常に動作しています。

---

## 📝 次回作業時の手順

### 1. 動作確認（最優先）
```bash
# 1. サーバーを起動
pnpm dev

# 2. ブラウザで開く
http://localhost:3000

# 3. 既存機能をテスト
- サインイン/サインアップ
- フォーム作成
- データ保存確認
```

### 2. フェーズ2（Authentication移行）を開始する場合

#### 2-1. Supabase Dashboard設定
1. https://app.supabase.com/ にアクセス
2. formonce-test プロジェクトを開く
3. Authentication → Providers
4. Google、GitHub、Email認証を設定

#### 2-2. コード実装
移行ガイド（SUPABASE_MIGRATION_GUIDE.md）の「認証の移行」セクションを参照

---

## 🎯 最終目標

完全にSupabaseに移行した状態：

```
┌─────────────────────────────────────────┐
│         FormOnce (Next.js)              │
├─────────────────────────────────────────┤
│ Database:  Supabase PostgreSQL ✅       │
│ Auth:      Supabase Auth       🚧       │
│ Storage:   Supabase Storage    🚧       │
│ Video CDN: Bunny.net           ✅       │
│ ORM:       Prisma              ✅       │
└─────────────────────────────────────────┘
```

---

## 📞 サポート

問題が発生した場合：
1. `SUPABASE_MIGRATION_GUIDE.md` のトラブルシューティングを確認
2. Supabase Dashboard → Logs でエラーを確認
3. GitHub Issuesで報告

---

**作業担当**: Claude Code
**プロジェクト**: FormOnce
**移行開始日**: 2025-10-30
**移行方式**: 段階的移行（Database → Auth → Storage）
