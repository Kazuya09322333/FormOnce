# FormOnce Vercelデプロイガイド 🚀

プログラミング初心者のための完全ガイド

## 目次

1. [はじめに](#はじめに)
2. [このプロジェクトについて](#このプロジェクトについて)
3. [デプロイまでのステップ](#デプロイまでのステップ)
4. [学ぶべき技術と解説](#学ぶべき技術と解説)
5. [詳細な手順](#詳細な手順)
6. [トラブルシューティング](#トラブルシューティング)
7. [学習リソース](#学習リソース)

---

## はじめに

このガイドでは、FormOnceアプリケーションをVercelにデプロイするまでの全手順と、必要な知識について解説します。プログラミング初心者の方でも理解できるよう、各技術の基礎から説明しています。

---

## このプロジェクトについて

FormOnceは、インタラクティブなビデオベースのフォームを作成できるオープンソースのアプリケーションです。

### 使用技術（Tech Stack）

- **Next.js 13** - Reactベースのフルスタックフレームワーク
- **TypeScript** - JavaScriptに型安全性を追加
- **Prisma** - TypeScript/Node.js用のORMツール
- **tRPC** - 型安全なAPIを構築するフレームワーク
- **NextAuth** - Next.js用の認証ライブラリ
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク
- **pnpm** - 高速で効率的なパッケージマネージャー
- **PostgreSQL** - リレーショナルデータベース（Neon使用）
- **Backblaze B2** - S3互換のクラウドストレージ

---

## デプロイまでのステップ

### 全体の流れ

```
1. 基礎知識の習得
   ↓
2. 必要なアカウント作成
   ↓
3. データベースとストレージの準備
   ↓
4. 環境変数の設定
   ↓
5. GitHubへのプッシュ
   ↓
6. Vercelへのデプロイ
   ↓
7. 動作確認とトラブルシューティング
```

### チェックリスト

デプロイ前に以下を確認してください：

- [ ] Node.jsとpnpmがインストールされている
- [ ] Gitがインストールされている
- [ ] GitHubアカウントを作成済み
- [ ] Neon（PostgreSQL）アカウントを作成済み
- [ ] Backblaze B2アカウントを作成済み
- [ ] Vercelアカウントを作成済み
- [ ] ローカル環境でアプリが正常に動作する
- [ ] 環境変数が正しく設定されている
- [ ] データベースマイグレーションが完了している

---

## 学ぶべき技術と解説

### 1. Next.js とは？

#### 概要
Next.jsは、Reactベースのフルスタックフレームワークです。Webアプリケーションを構築するために必要な機能がすべて含まれています。

#### 主な特徴
- **サーバーサイドレンダリング（SSR）** - ページを高速に表示
- **静的サイト生成（SSG）** - SEOに強い静的ページを生成
- **API Routes** - バックエンドAPIを簡単に作成
- **ファイルベースルーティング** - フォルダ構造がそのままURLになる

#### なぜNext.jsを使うのか？
- Vercelが開発しているため、Vercelへのデプロイが超簡単
- ReactだけでなくバックエンドAPIも作れる（フルスタック）
- パフォーマンスが良く、初心者でも使いやすい

#### 学習のポイント
1. Reactの基礎（コンポーネント、Props、State）
2. ファイルベースルーティング（`pages/` または `app/` ディレクトリ）
3. データフェッチング（getServerSideProps、getStaticProps）
4. API Routes（`pages/api/` ディレクトリ）

---

### 2. Git & GitHub とは？

#### Git（バージョン管理システム）

##### 概要
Gitは、コードの変更履歴を管理するツールです。「いつ」「誰が」「何を」変更したかを記録します。

##### 基本的なコマンド
```bash
# リポジトリを初期化
git init

# 変更をステージング
git add .

# 変更をコミット
git commit -m "コミットメッセージ"

# リモートリポジトリに送信
git push origin main

# 最新の状態を確認
git status

# 変更内容を確認
git diff
```

##### 学習のポイント
- リポジトリ、コミット、ブランチの概念
- 基本的な Git コマンド（add, commit, push, pull）
- コミットメッセージの書き方

#### GitHub（コード共有プラットフォーム）

##### 概要
GitHubは、Gitリポジトリをオンラインで管理・共有できるサービスです。

##### 主な機能
- リポジトリの公開・非公開管理
- プルリクエスト（コードレビュー）
- Issues（タスク管理）
- GitHub Actions（CI/CD）

##### なぜGitHubを使うのか？
- Vercelと簡単に連携できる
- 自動デプロイが可能（GitHubにプッシュ → 自動的にVercelにデプロイ）
- コードのバックアップになる

---

### 3. Vercel とは？

#### 概要
Vercelは、フロントエンド・フルスタックアプリケーションをホスティングするためのクラウドプラットフォームです。

#### 主な特徴
- **簡単デプロイ** - GitHubと連携すれば、数クリックでデプロイ可能
- **自動プレビュー** - プルリクエストごとにプレビュー環境を自動生成
- **無料プラン** - 個人プロジェクトなら無料で使える
- **高速配信** - グローバルCDN（コンテンツ配信ネットワーク）
- **環境変数管理** - ダッシュボードから簡単に設定可能

#### なぜVercelを使うのか？
- Next.jsを開発している会社なので、相性が抜群
- 設定がほぼ不要（ゼロコンフィグ）
- 無料で始められる
- 自動スケーリング（アクセスが増えても自動対応）

#### 料金プラン
- **Hobby（無料）** - 個人プロジェクト向け
- **Pro** - 商用プロジェクト向け
- **Enterprise** - 大規模プロジェクト向け

---

### 4. pnpm とは？

#### 概要
pnpmは、npm（Node Package Manager）の代替となるパッケージマネージャーです。

#### npm との違い

| 特徴 | npm | pnpm |
|------|-----|------|
| インストール速度 | 普通 | 高速 |
| ディスク使用量 | 多い | 少ない（最大50%削減） |
| 依存関係の管理 | 緩い | 厳格 |
| 学習コスト | 低い | 低い（ほぼ同じコマンド） |

#### 主なコマンド

```bash
# パッケージをインストール
pnpm install

# 開発サーバーを起動
pnpm dev

# 本番ビルド
pnpm build

# パッケージを追加
pnpm add パッケージ名

# パッケージを削除
pnpm remove パッケージ名
```

#### なぜpnpmを使うのか？
- ディスク容量を節約できる
- インストールが高速
- 依存関係の問題を防げる

---

### 5. Prisma & PostgreSQL とは？

#### Prisma（ORM）

##### 概要
PrismaはORMツール（Object-Relational Mapping）で、データベースを簡単に扱えるようにするライブラリです。

##### 主な特徴
- **型安全** - TypeScriptと完全統合
- **直感的なAPI** - SQLを書かずにデータベース操作
- **マイグレーション** - データベーススキーマの変更を管理
- **Prisma Studio** - データベースをGUIで確認・編集

##### 基本的な使い方

```typescript
// ユーザーを取得
const user = await prisma.user.findUnique({
  where: { id: 1 }
});

// ユーザーを作成
const newUser = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe"
  }
});

// ユーザーを更新
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane Doe" }
});
```

##### schema.prisma ファイル

```prisma
// データベースモデルの定義
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

#### PostgreSQL（データベース）

##### 概要
PostgreSQLは、オープンソースのリレーショナルデータベース管理システム（RDBMS）です。

##### 主な特徴
- 信頼性が高い
- 高機能（複雑なクエリに対応）
- 無料で使える

#### Neon（PostgreSQL のホスティングサービス）

##### 概要
NeonはサーバーレスなPostgreSQLデータベースを提供するサービスです。

##### 無料プランの内容
- ストレージ: 512MB
- CPU: 0.25 コア
- RAM: 1GB
- ブランチ: プロジェクトあたり10個

##### なぜNeonを使うのか？
- 無料で始められる
- セットアップが簡単（数分で完了）
- Git風のブランチ機能（開発・本番環境を分離）
- 自動バックアップ

##### 注意点
- 日本リージョンがない（シンガポールが最も近い）
- 無料プランには容量制限がある

---

### 6. NextAuth とは？

#### 概要
NextAuthは、Next.jsアプリケーションに認証機能を追加するライブラリです。

#### 主な特徴
- **簡単セットアップ** - 数行のコードで認証機能を追加
- **複数プロバイダー対応** - Google、GitHub、メールなど
- **セキュア** - セキュリティのベストプラクティスを実装済み
- **データベース連携** - Prismaと簡単に統合

#### 対応する認証方法
- メール/パスワード
- OAuth（Google、GitHub、Facebook等）
- Magic Link（パスワードレス認証）
- JWT（JSON Web Token）

#### 基本的な設定

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
```

#### なぜNextAuthを使うのか？
- 認証機能を一から作るのは難しい
- セキュリティの専門知識が必要
- NextAuthなら安全で簡単に実装できる

---

### 7. tRPC とは？

#### 概要
tRPCは、TypeScriptで型安全なAPIを構築するためのフレームワークです。

#### 主な特徴
- **エンドツーエンドの型安全性** - サーバーとクライアント間で型を共有
- **コード生成不要** - TypeScriptの型推論を活用
- **自動補完** - IDEで引数や戻り値が自動補完される
- **軽量** - ランタイムオーバーヘッドが少ない

#### REST API との違い

| 特徴 | REST API | tRPC |
|------|----------|------|
| 型安全性 | なし（手動で型定義が必要） | 自動（型推論） |
| エンドポイント | URLで定義 | 関数で定義 |
| ドキュメント | 手動作成が必要 | 型から自動生成 |
| 学習コスト | 中程度 | 低い（TypeScript知識があれば） |

#### 基本的な使い方

サーバー側：
```typescript
// server/api/routers/user.ts
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({
        where: { id: input.id }
      });
    }),
});
```

クライアント側：
```typescript
// 型安全にAPIを呼び出し
const user = await trpc.user.getById.query({ id: "123" });
// user の型は自動的に推論される
```

#### なぜtRPCを使うのか？
- APIの型エラーをコンパイル時に検出できる
- フロントエンドとバックエンドの型が自動的に同期される
- REST APIより開発が速い

---

### 8. 環境変数とは？

#### 概要
環境変数は、アプリケーションの設定情報（API キー、データベース URL など）を保存するための仕組みです。

#### なぜ環境変数を使うのか？
1. **セキュリティ** - 機密情報をコードに直接書かない
2. **環境ごとの切り替え** - 開発・本番で異なる設定を使える
3. **柔軟性** - コードを変更せずに設定を変更できる

#### このプロジェクトで必要な環境変数

```bash
# データベース
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth（認証）
NEXTAUTH_SECRET="ランダムな文字列（32文字以上推奨）"
NEXTAUTH_URL="https://your-domain.vercel.app"

# JWT
JWT_SECRET="ランダムな文字列"

# Google OAuth（オプション）
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth（オプション）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Backblaze B2（ファイルストレージ）
BACKBLAZE_KEY_ID="your-key-id"
BACKBLAZE_APPLICATION_KEY="your-application-key"
BACKBLAZE_KEY_NAME="your-key-name"
BACKBLAZE_ENDPOINT="s3.us-west-004.backblazeb2.com"
BACKBLAZE_BUCKET_NAME="your-bucket-name"
```

#### 環境変数の管理方法

**ローカル環境**:
```bash
# .env ファイルに記載
DATABASE_URL="..."
NEXTAUTH_SECRET="..."
```

**Vercel**:
1. Vercelダッシュボードを開く
2. プロジェクトの Settings → Environment Variables
3. 変数名と値を入力
4. 適用する環境（Production/Preview/Development）を選択
5. 保存

#### セキュリティの注意点
- `.env` ファイルは **絶対に** Gitにコミットしない
- `.gitignore` に `.env` が含まれていることを確認
- 公開リポジトリでは特に注意

---

## 詳細な手順

### ステップ1: 前提条件のセットアップ

#### 1.1 Node.js のインストール

1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. LTS版（推奨版）をダウンロード
3. インストーラーを実行
4. インストール確認：
   ```bash
   node --version
   # v18.x.x 以上が表示されればOK
   ```

#### 1.2 pnpm のインストール

```bash
# npmを使ってpnpmをインストール
npm install -g pnpm

# インストール確認
pnpm --version
```

#### 1.3 Git のインストール

1. [Git公式サイト](https://git-scm.com/)にアクセス
2. OSに合わせてダウンロード
3. インストール確認：
   ```bash
   git --version
   ```

#### 1.4 Git の初期設定

```bash
# ユーザー名を設定
git config --global user.name "あなたの名前"

# メールアドレスを設定
git config --global user.email "your-email@example.com"
```

---

### ステップ2: 必要なアカウントの作成

#### 2.1 GitHub アカウント

1. [GitHub](https://github.com/)にアクセス
2. 「Sign up」をクリック
3. メールアドレス、パスワードを入力して登録
4. メール認証を完了

#### 2.2 Vercel アカウント

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. **「Continue with GitHub」を選択**（GitHubアカウントで登録すると連携が簡単）
4. GitHubとの連携を承認

#### 2.3 Neon アカウント（PostgreSQL）

1. [Neon](https://neon.tech/)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで登録（推奨）
4. プロジェクトを作成：
   - Project Name: `formonce-db`（任意）
   - Region: `Singapore (ap-southeast-1)`（日本に最も近い）
   - PostgreSQL version: 最新版を選択
5. 接続文字列（Connection String）をコピーして保存

#### 2.4 Backblaze B2 アカウント（ファイルストレージ）

1. [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)にアクセス
2. 「Sign Up」をクリック
3. アカウント情報を入力して登録
4. バケットを作成：
   - Bucket Name: `formonce-uploads`（任意）
   - Files in Bucket: `Public`
5. アプリケーションキーを作成：
   - App Keys → Create a New App Key
   - キーIDとアプリケーションキーを保存（一度しか表示されない）

---

### ステップ3: ローカル環境のセットアップ

#### 3.1 リポジトリのフォーク（オプション）

元のリポジトリに書き込み権限がない場合：

1. [FormOnce GitHub](https://github.com/FormOnce/FormOnce)にアクセス
2. 右上の「Fork」ボタンをクリック
3. 自分のアカウントにフォーク

#### 3.2 リポジトリのクローン

```bash
# 自分のGitHubユーザー名に置き換える
git clone https://github.com/<あなたのユーザー名>/FormOnce.git

# プロジェクトディレクトリに移動
cd FormOnce
```

#### 3.3 依存関係のインストール

```bash
pnpm install
```

#### 3.4 環境変数の設定

1. `.env.example` をコピーして `.env` を作成：
   ```bash
   cp .env.example .env
   ```

2. `.env` ファイルを編集：
   ```bash
   # Windows
   notepad .env

   # Mac/Linux
   nano .env
   ```

3. 各環境変数を設定：

```bash
# Neon からコピーした接続文字列
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# ランダムな文字列を生成（PowerShellの場合）
# -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
NEXTAUTH_SECRET="ここに生成した文字列を貼り付け"

# ローカル環境のURL
NEXTAUTH_URL="http://localhost:3000"

# JWT Secret（NEXTAUTH_SECRETと同じでもOK）
JWT_SECRET="ここに生成した文字列を貼り付け"

# Backblaze B2の情報
BACKBLAZE_KEY_ID="あなたのキーID"
BACKBLAZE_APPLICATION_KEY="あなたのアプリケーションキー"
BACKBLAZE_KEY_NAME="あなたのキー名"
BACKBLAZE_ENDPOINT="s3.us-west-004.backblazeb2.com"
BACKBLAZE_BUCKET_NAME="あなたのバケット名"
```

#### 3.5 データベースのマイグレーション

```bash
# Prismaクライアントを生成
pnpx prisma generate

# データベースマイグレーションを実行
pnpx prisma migrate dev
```

#### 3.6 ローカル開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 にアクセスして動作確認

---

### ステップ4: GitHubへのプッシュ

#### 4.1 変更をコミット

```bash
# 変更されたファイルを確認
git status

# .env ファイルが含まれていないことを確認！
# もし含まれていたら .gitignore を確認

# すべての変更をステージング
git add .

# コミット
git commit -m "feat: initial setup for deployment"
```

#### 4.2 GitHubにプッシュ

```bash
# メインブランチにプッシュ
git push origin main
```

---

### ステップ5: Vercelへのデプロイ

#### 5.1 新しいプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択（FormOnce）
4. 「Import」をクリック

#### 5.2 プロジェクトの設定

**Build & Development Settings:**
- Framework Preset: `Next.js` （自動検出される）
- Build Command: `pnpm build`（自動設定される）
- Output Directory: `.next`（自動設定される）
- Install Command: `pnpm install`（自動設定される）

**Root Directory:**
- そのまま（ルートディレクトリ）

#### 5.3 環境変数の設定

1. 「Environment Variables」セクションを開く
2. `.env` ファイルの内容を1つずつ追加：

   **重要:** `NEXTAUTH_URL` は本番URLに変更！

   ```bash
   DATABASE_URL = postgresql://... （Neonの接続文字列）
   NEXTAUTH_SECRET = xxxxx （ローカルと同じ）
   NEXTAUTH_URL = https://your-app.vercel.app （デプロイ後のURL）
   JWT_SECRET = xxxxx （ローカルと同じ）
   BACKBLAZE_KEY_ID = xxxxx
   BACKBLAZE_APPLICATION_KEY = xxxxx
   BACKBLAZE_KEY_NAME = xxxxx
   BACKBLAZE_ENDPOINT = s3.us-west-004.backblazeb2.com
   BACKBLAZE_BUCKET_NAME = xxxxx
   ```

3. 各環境変数の適用環境を選択：
   - Production: ✓（チェック）
   - Preview: ✓（チェック推奨）
   - Development: （チェック不要）

#### 5.4 デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認（2〜5分程度）
3. デプロイ完了！

#### 5.5 デプロイ後の設定

**NEXTAUTH_URL の更新:**

1. デプロイが完了したら、URLをコピー（例: `https://formonce-xxx.vercel.app`）
2. Vercel ダッシュボード → Settings → Environment Variables
3. `NEXTAUTH_URL` を編集して本番URLに変更
4. 「Save」をクリック
5. Deployments → 最新のデプロイ → 右上の「...」→「Redeploy」

---

### ステップ6: 動作確認

#### 6.1 基本的な動作確認

1. デプロイされたURLにアクセス
2. ページが正しく表示されるか確認
3. ナビゲーションが動作するか確認

#### 6.2 認証機能の確認

1. ログイン/サインアップページにアクセス
2. アカウントを作成
3. ログインできるか確認

#### 6.3 データベースの確認

1. Prisma Studio を起動（ローカル）：
   ```bash
   pnpx prisma studio
   ```
2. データが正しく保存されているか確認

---

## トラブルシューティング

### よくあるエラーと解決方法

#### 1. ビルドエラー: "Module not found"

**原因:** 依存関係がインストールされていない

**解決方法:**
```bash
# 依存関係を再インストール
pnpm install

# node_modules を削除して再インストール
rm -rf node_modules
pnpm install
```

#### 2. データベース接続エラー

**原因:** DATABASE_URL が正しくない

**解決方法:**
1. Neon ダッシュボードで接続文字列を再確認
2. `?sslmode=require` が末尾に含まれているか確認
3. Vercel の環境変数を確認・更新
4. Redeploy を実行

#### 3. NextAuth エラー: "Invalid redirect_uri"

**原因:** NEXTAUTH_URL が正しくない

**解決方法:**
1. Vercel の環境変数で NEXTAUTH_URL を確認
2. デプロイされた実際のURLと一致しているか確認
3. 末尾にスラッシュ（/）がないことを確認
4. Redeploy を実行

#### 4. 環境変数が反映されない

**原因:** デプロイ後に環境変数を変更した

**解決方法:**
1. 環境変数を更新
2. **必ず Redeploy を実行**（自動的には反映されない）

#### 5. Prisma エラー: "Can't reach database server"

**原因:** データベースが起動していない、または接続情報が間違っている

**解決方法:**
1. Neon ダッシュボードでデータベースが起動しているか確認
2. 無料プランの制限（アイドル時間後の自動停止）を確認
3. DATABASE_URL を再確認

#### 6. "This Serverless Function has crashed"

**原因:** サーバーサイドでエラーが発生している

**解決方法:**
1. Vercel ダッシュボード → Functions → Logs でエラー内容を確認
2. 環境変数が正しく設定されているか確認
3. ローカル環境で同じエラーが再現できるか確認

---

## 学習リソース

### Next.js

#### 公式ドキュメント・チュートリアル
- [Next.js 公式ドキュメント（英語）](https://nextjs.org/docs)
- [Next.js 公式チュートリアル（日本語訳）](https://note.com/mega_gorilla/n/n43bff8af5247) - Next.js 15チュートリアル日本語訳版

#### 日本語記事
- [公式チュートリアルでNext.jsに入門してみた | DevelopersIO](https://dev.classmethod.jp/articles/introduction-to-nextjs/)
- [忙しい人のためのNext.js公式チュートリアル完走ガイド | DevelopersIO](https://dev.classmethod.jp/articles/complete-nextjs-tutorial/)
- [Next.jsチュートリアルまとめ | Zenn](https://zenn.dev/yossyxp/scraps/312e66748bf9aa)

### Vercel

#### 公式ドキュメント
- [Vercel 公式ドキュメント（英語）](https://vercel.com/docs)
- [Next.js Deployment | Next.js（日本語訳）](https://nextjs-ja-translation-docs.vercel.app/docs/deployment)

#### 日本語記事
- [初心者でもできるVercelへのデプロイ方法 | アールエフェクト](https://reffect.co.jp/react/next-js-github-vercel)
- [VercelでNext.jsを簡単デプロイ | WESEEK](https://weseek.co.jp/tech/621/)
- [Next.jsをVercelにデプロイするまでの簡易手順 | Zenn](https://zenn.dev/hayato94087/articles/b30efe589baa0e)
- [Vercel環境変数の正しい設定方法 | Qiita](https://qiita.com/CodeLeaf/items/c3e85f32d5d34c927a77)

### Git & GitHub

#### 公式ドキュメント
- [Git 公式ドキュメント（英語）](https://git-scm.com/doc)
- [GitHub Docs（日本語あり）](https://docs.github.com/ja)

#### 日本語記事
- [GitHubの使い方を徹底解説 | 侍エンジニアブログ](https://www.sejuku.net/blog/73468)
- [超入門：初心者のためのGitとGitHubの使い方 | RAKUS](https://tech-blog.rakus.co.jp/entry/20200529/git)
- [初心者向けGitとGitHubの使い方を徹底解説 | Qiita](https://qiita.com/renesisu727/items/248cb9468a402c622003)
- [GitHub超初心者入門 | Qiita](https://qiita.com/nnahito/items/565f8755e70c51532459)

### Prisma & データベース

#### 公式ドキュメント
- [Prisma 公式ドキュメント（日本語訳）](https://prisma.dokyumento.jp/docs/getting-started)
- [Neon 公式ドキュメント（英語）](https://neon.tech/docs)

#### 日本語記事
- [Prismaを初めて使うときに知りたいことまとめ | らくらくエンジニア](https://rakuraku-engineer.com/posts/prisma-introduction/)
- [Prismaを始めるときに押さえておきたいポイント | Zenn](https://zenn.dev/shintaro/articles/e649722e41af4f)
- [ゼロからPrismaを導入して基本をマスター | Wantedly](https://sg.wantedly.com/companies/jointcrew/post_articles/936508)
- [Neon Serverless Postgres: 便利な機能と導入パターン | Zenn](https://zenn.dev/bm_sms/articles/0212ba653c2136)
- [Neon（旧Vercel PostgreSQL）の紹介と導入 | Zenn](https://zenn.dev/b13o/articles/tutorial-neon)

### NextAuth

#### 公式ドキュメント
- [NextAuth.js 公式ドキュメント（英語）](https://next-auth.js.org)

#### 日本語記事
- [NextAuthを完全に理解する | Qiita](https://qiita.com/kage1020/items/bdefabcd09d86e78d474)
- [ソースコードから理解するNextAuth.jsのログイン処理 | RightCode](https://rightcode.co.jp/blogs/51242)
- [NextAuthでメールアドレスとパスワード認証を実装 | Neightbor](https://neightbor.jp/blog/nextauth-login)

### tRPC

#### 公式ドキュメント
- [tRPC 公式ドキュメント（英語）](https://trpc.io/)
- [T3 Stack - tRPC（日本語）](https://create.t3.gg/ja/usage/trpc)

#### 日本語記事
- [tRPCとは？TypeScriptでAPIの型安全性を高める | TSD](https://tsd.mitsue.co.jp/blog/2022-09-30-what-is-tRPC/)
- [tRPC超基本 | Zenn](https://zenn.dev/big_tanukiudon/articles/2f5e6efd851686)
- [tRPCを使うことで何がどう便利になるのか？ | Qiita](https://qiita.com/kbys-fumi/items/d27405d383ba4bb6f5a0)
- [tRPCを動かして理解する | アールエフェクト](https://reffect.co.jp/react/trpc-basic)

### pnpm

#### 公式ドキュメント
- [pnpm 公式ドキュメント（英語）](https://pnpm.io/)

#### 日本語記事
- [pnpm入門：高速＆省スペースの秘密 | Qiita](https://qiita.com/zawazawa5809/items/484b7e64a0bdecc09f72)
- [pnpm は npm と何が違うのか | azukiazusa.dev](https://azukiazusa.dev/blog/pnpm-npm/)
- [npm・yarn・pnpmの違いとは？速度や特徴をざっくり比較](https://it-bokenki.com/2025/06/24/npm-vs-pnpm-vs-yarn/)

---

## 次のステップ

デプロイが完了したら、以下のことに取り組んでみましょう：

### 1. カスタムドメインの設定
Vercelでカスタムドメイン（例: `www.your-domain.com`）を設定できます。

### 2. Analytics の設定
Vercel Analyticsを有効化してアクセス解析を開始しましょう。

### 3. 継続的な改善
- パフォーマンスの最適化
- エラーログの監視
- データベースの最適化

### 4. 機能追加
- 新しい機能の開発
- UIの改善
- テストの追加

---

## サポート

### 質問がある場合
- [FormOnce GitHub Discussions](https://github.com/FormOnce/FormOnce/discussions)
- [FormOnce Twitter](https://x.com/form_once)

### バグを見つけた場合
- [GitHub Issues](https://github.com/FormOnce/FormOnce/issues)

---

## まとめ

このガイドでは、FormOnceアプリケーションをVercelにデプロイするための完全な手順を説明しました。

### 学んだこと
1. Next.js の基礎
2. Git & GitHub の使い方
3. Vercel へのデプロイ方法
4. データベース（Prisma & Neon）のセットアップ
5. 環境変数の管理
6. 認証（NextAuth）の設定
7. tRPC の概念
8. pnpm の使い方

### 重要なポイント
- 環境変数は絶対にGitにコミットしない
- デプロイ後は必ず動作確認
- エラーが出たらログを確認
- 分からないことは学習リソースを参照

プログラミングは実践あるのみです。エラーを恐れず、少しずつ学んでいきましょう！

Happy Coding! 🎉
