# 動画機能セットアップガイド

FormOnceの動画アップロード・表示機能を使用するためのセットアップ手順です。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- `.env`ファイルにSupabase認証情報が設定済みであること

## 1. Supabase Storageのセットアップ

### 1.1 ストレージバケットの作成

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. 左メニューから **Storage** を選択
4. **New bucket** をクリック
5. 以下の設定でバケットを作成：
   - **Name**: `videos`
   - **Public bucket**: ✅ チェックを入れる（公開アクセス可能にする）
   - **File size limit**: 500 MB（任意）
   - **Allowed MIME types**: `video/*`（任意）

### 1.2 バケットのポリシー設定

動画をアップロード・閲覧できるようにするため、以下のポリシーを設定します。

1. Storage > **videos** バケット > **Policies** タブを開く
2. 以下のポリシーを追加：

#### アップロードポリシー（INSERT）
```sql
-- 認証済みユーザーが自分のフォルダにアップロード可能
CREATE POLICY "Users can upload videos to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 読み取りポリシー（SELECT）
```sql
-- すべてのユーザーが動画を閲覧可能（公開フォーム用）
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');
```

#### 削除ポリシー（DELETE）
```sql
-- 認証済みユーザーが自分のファイルを削除可能
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 2. 環境変数の確認

`.env`ファイルに以下の環境変数が設定されていることを確認してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database
DATABASE_URL="postgresql://..."

# NextAuth (Supabase Auth使用時も必要)
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (任意)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

## 3. データベースマイグレーション

Videoテーブルが存在することを確認します：

```bash
pnpm prisma migrate dev
```

もしマイグレーションがない場合は、以下のコマンドで作成します：

```bash
pnpm prisma migrate dev --name add_video_table
```

## 4. 使用方法

### 4.1 フォームビルダーで動画をアップロード

1. ダッシュボードからフォームを作成・編集
2. Flow Builderで質問ノードをホバー
3. **Video** ボタンをクリック
4. 動画ファイルを選択（対応形式: MP4, MOV, AVI, WebM、最大500MB）
5. アップロード完了後、ノードに緑色のアイコンが表示される

### 4.2 フォーム回答時の動画表示

- フォームを公開し、回答URLにアクセス
- 動画が設定された質問では、質問文の上に動画プレイヤーが表示される
- 回答者は動画を視聴してから質問に回答できる

## 5. トラブルシューティング

### アップロードエラー

**エラー**: "Failed to create upload URL"
- Supabase Service Role Keyが正しく設定されているか確認
- `videos`バケットが作成されているか確認

**エラー**: "対応していないファイル形式です"
- MP4, MOV, AVI, WebM形式の動画ファイルを使用してください

**エラー**: "ファイルサイズが大きすぎます"
- 500MB以下のファイルをアップロードしてください

### 動画が表示されない

1. ブラウザの開発者ツールでネットワークエラーを確認
2. Supabase Storageの`videos`バケットがpublicになっているか確認
3. 動画URLが正しく保存されているか確認（Prisma Studioで`Video`テーブルを確認）

### Supabase Storageの容量制限

- Supabaseの無料プランでは1GBまでのストレージが利用可能
- 容量を超える場合は、プランのアップグレードを検討してください

## 6. 技術詳細

### アーキテクチャ

```
フォームビルダー
  ↓
VideoUploadDialog (動画選択)
  ↓
tRPC: video.getUploadUrl (署名付きURL取得)
  ↓
XMLHttpRequest (Supabase Storageへ直接アップロード)
  ↓
tRPC: video.finalizeVideo (メタデータをDBに保存)
  ↓
QuestionNode (videoId, videoUrlを質問に保存)
  ↓
フォーム回答画面
  ↓
InputRenderer (HTML5 videoタグで表示)
```

### ファイル構成

- **型定義**: `src/types/question.types.ts` - `videoId`, `videoUrl`フィールド
- **アップロードUI**: `src/components/form-builder/flow-builder/VideoUploadDialog.tsx`
- **API**: `src/server/api/routers/video/router.ts`
- **表示**: `src/components/form-builder/input-renderer.tsx`
- **データベース**: `prisma/schema.prisma` - `Video`モデル

## 7. 今後の拡張機能

現在の実装では以下の機能は未実装です：

- [ ] 動画のトランスコーディング（HLS/DASH形式への変換）
- [ ] 動画のサムネイル自動生成
- [ ] 動画再生の進捗トラッキング
- [ ] Bunny CDNとの統合（高速配信）
- [ ] 動画の編集機能（トリミング、字幕追加など）

必要に応じて、これらの機能を追加実装できます。
