# 動画機能セットアップ（5分で完了）

## ステップ1: Supabaseダッシュボードを開く

1. https://app.supabase.com にアクセス
2. 自分のプロジェクトを選択

## ステップ2: Storageバケットを作成

1. 左メニューから **Storage** をクリック
2. 右上の **New bucket** をクリック
3. 以下を入力：
   - **Name**: `videos` （必ずこの名前で）
   - **Public bucket**: ✅ チェックを入れる
4. **Create bucket** をクリック

## ステップ3: ポリシーを設定

1. 作成した `videos` バケットをクリック
2. 上部の **Policies** タブをクリック
3. **New Policy** をクリック

### ポリシー1: アップロード許可
1. **For Full customization** を選択
2. 以下をコピペ：

**Policy name**: `Users can upload videos`

```sql
-- INSERT policy
bucket_id = 'videos' AND
(storage.foldername(name))[1] = auth.uid()::text
```

- **Policy command**: INSERT を選択
- **Target roles**: authenticated を選択
- **WITH CHECK expression** に上記のSQLを貼り付け
- **Create policy** をクリック

### ポリシー2: 閲覧許可（公開フォーム用）
1. もう一度 **New Policy** をクリック
2. **For Full customization** を選択
3. 以下をコピペ：

**Policy name**: `Anyone can view videos`

```sql
-- SELECT policy
bucket_id = 'videos'
```

- **Policy command**: SELECT を選択
- **Target roles**: public を選択
- **USING expression** に上記のSQLを貼り付け
- **Create policy** をクリック

### ポリシー3: 削除許可
1. もう一度 **New Policy** をクリック
2. **For Full customization** を選択
3. 以下をコピペ：

**Policy name**: `Users can delete their videos`

```sql
-- DELETE policy
bucket_id = 'videos' AND
(storage.foldername(name))[1] = auth.uid()::text
```

- **Policy command**: DELETE を選択
- **Target roles**: authenticated を選択
- **USING expression** に上記のSQLを貼り付け
- **Create policy** をクリック

## ステップ4: 完了！

これで設定完了です。アプリを起動して動画をアップロードできます。

```bash
pnpm run dev
```

---

## 簡単バージョン（テンプレート使用）

上記の方法が難しい場合、以下のSQLを **SQL Editor** で実行してください：

1. 左メニューから **SQL Editor** をクリック
2. **New query** をクリック
3. 以下のSQLをコピペして **Run** をクリック：

```sql
-- バケット作成（既に作成済みなら不要）
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- アップロード許可ポリシー
CREATE POLICY "Users can upload videos to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 閲覧許可ポリシー
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');

-- 削除許可ポリシー
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

実行後、エラーがなければ完了です！

---

## トラブルシューティング

### エラー: "Failed to create upload URL"
→ Supabase Service Role Keyが `.env` に設定されているか確認

### エラー: "Policy already exists"
→ すでにポリシーが設定済みなので、そのまま進めてOK

### 動画が表示されない
→ `videos` バケットが **Public** になっているか確認
