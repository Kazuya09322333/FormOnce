# FormOnce Supabase 移行ガイド 🚀

Neon + NextAuth + Backblaze から Supabase への完全移行ガイド

## 目次

1. [移行の概要](#移行の概要)
2. [移行前の準備](#移行前の準備)
3. [Supabaseプロジェクトのセットアップ](#supabaseプロジェクトのセットアップ)
4. [データベースの移行](#データベースの移行)
5. [認証の移行（NextAuth → Supabase Auth）](#認証の移行nextauth--supabase-auth)
6. [ストレージの移行（Backblaze → Supabase Storage）](#ストレージの移行backblaze--supabase-storage)
7. [環境変数の更新](#環境変数の更新)
8. [コードの書き換え](#コードの書き換え)
9. [Vercelへのデプロイ](#vercelへのデプロイ)
10. [トラブルシューティング](#トラブルシューティング)
11. [学習リソース](#学習リソース)

---

## 移行の概要

### 現在の構成

```
┌─────────────────────────────────────────┐
│         FormOnce (Next.js)              │
├─────────────────────────────────────────┤
│ Database:  Neon PostgreSQL              │
│ Auth:      NextAuth                     │
│ Storage:   Backblaze B2                 │
│ Video CDN: Bunny.net (継続使用)         │
│ ORM:       Prisma                       │
└─────────────────────────────────────────┘
```

### 移行後の構成

```
┌─────────────────────────────────────────┐
│         FormOnce (Next.js)              │
├─────────────────────────────────────────┤
│ Database:  Supabase PostgreSQL          │
│ Auth:      Supabase Auth                │
│ Storage:   Supabase Storage             │
│ Video CDN: Bunny.net (そのまま)         │
│ ORM:       Prisma (継続使用)            │
└─────────────────────────────────────────┘
```

### 移行するもの

✅ **PostgreSQL Database**
- Neon → Supabase Database
- Prismaは継続使用（接続先を変更）

✅ **認証システム**
- NextAuth → Supabase Auth
- Google OAuth、GitHub OAuth、メール/パスワード認証

✅ **ファイルストレージ**
- Backblaze B2 → Supabase Storage
- ビデオファイルのアップロード機能

### そのまま使うもの

🔄 **Bunny.net**
- ビデオストリーミングCDN
- Supabaseには代替がないため継続使用

🔄 **Prisma ORM**
- Supabase Clientに置き換えることも可能だが、型安全性のため継続使用推奨
- DATABASE_URLをSupabaseに変更するだけでOK

---

## 移行前の準備

### チェックリスト

- [ ] 現在のプロジェクトがローカルで正常に動作している
- [ ] Gitで現在の状態をコミット済み
- [ ] データベースのバックアップを取得（オプション）
- [ ] Supabaseアカウントを作成済み
- [ ] 既存のOAuth設定情報（Google、GitHub）を把握

### 必要なアカウント

1. **Supabase** - https://supabase.com/
2. **Vercel** - https://vercel.com/
3. **Bunny.net** - https://bunny.net/（既存利用継続）

---

## Supabaseプロジェクトのセットアップ

### ステップ1: Supabaseプロジェクトを作成

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Project name**: `formonce`（任意）
   - **Database Password**: 強力なパスワードを生成（保存必須！）
   - **Region**: `Northeast Asia (Tokyo)`（日本リージョン利用可能！）
   - **Pricing Plan**: Free（無料プラン）

4. 「Create new project」をクリック
5. プロジェクトの作成完了を待つ（2〜3分）

### ステップ2: 接続情報を取得

1. サイドバーから「Project Settings」をクリック
2. 「Database」セクションを開く
3. 以下の情報をコピーして保存：

   ```
   Connection string (URI):
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

   Direct connection (Prisma用):
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```

4. 「API」セクションを開く
5. 以下をコピーして保存：
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon public key**: `eyJ...`（長いトークン）
   - **service_role key**: `eyJ...`（長いトークン、秘密鍵）

---

## データベースの移行

### オプション1: Prismaマイグレーション（推奨）

Prismaを使って既存のスキーマをSupabaseに適用します。

#### 手順

1. **環境変数を一時的に更新**

   `.env` ファイルを編集：
   ```bash
   # 既存のNeon URLをコメントアウト
   # DATABASE_URL="postgresql://..."

   # Supabase URLを追加
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```

2. **Prismaマイグレーションを実行**

   ```bash
   # Prismaクライアントを再生成
   pnpx prisma generate

   # マイグレーションを実行（新しいデータベースにスキーマを作成）
   pnpx prisma migrate deploy

   # または開発環境の場合
   pnpx prisma migrate dev
   ```

3. **Prisma Studioで確認**

   ```bash
   pnpx prisma studio
   ```

   ブラウザで http://localhost:5555 を開き、テーブルが作成されているか確認

### オプション2: データベースダンプで移行

既存のNeonデータベースにデータがある場合：

#### Neonからエクスポート

```bash
# pg_dumpを使用（PostgreSQL CLIツールが必要）
pg_dump "postgresql://[NEON-CONNECTION-STRING]" > formonce_dump.sql
```

#### Supabaseにインポート

1. Supabase Dashboardを開く
2. 「SQL Editor」をクリック
3. 「New query」をクリック
4. ダンプファイルの内容を貼り付けて実行

または、`psql`を使用：

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < formonce_dump.sql
```

---

## 認証の移行（NextAuth → Supabase Auth）

### Supabase Authの設定

#### ステップ1: Supabase Authプロバイダーを有効化

1. Supabase Dashboard → 「Authentication」→「Providers」
2. 以下のプロバイダーを有効化：

##### Email/Password 認証

- デフォルトで有効
- 「Enable Email Confirmations」を設定（推奨: 有効）

##### Google OAuth

1. 「Google」を選択
2. 「Enable Google provider」を有効化
3. 既存のGoogle OAuth認証情報を入力：
   - **Client ID**: `[YOUR_GOOGLE_CLIENT_ID]`
   - **Client Secret**: `[YOUR_GOOGLE_CLIENT_SECRET]`
4. **Authorized redirect URLs**に以下を追加：
   ```
   https://[PROJECT-REF].supabase.co/auth/v1/callback
   ```
5. Google Cloud Consoleで、上記のリダイレクトURIを承認済みリダイレクトURIに追加

##### GitHub OAuth

1. 「GitHub」を選択
2. 「Enable GitHub provider」を有効化
3. 既存のGitHub OAuth認証情報を入力：
   - **Client ID**: `[YOUR_GITHUB_CLIENT_ID]`
   - **Client Secret**: `[YOUR_GITHUB_CLIENT_SECRET]`
4. **Authorized redirect URLs**に以下を追加：
   ```
   https://[PROJECT-REF].supabase.co/auth/v1/callback
   ```
5. GitHub OAuth Appの設定で、上記のCallbackURLを更新

#### ステップ2: Supabase Clientパッケージをインストール

```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### ステップ3: Supabaseクライアントを作成

**新規ファイル**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**新規ファイル**: `src/lib/supabase-server.ts`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}
```

#### ステップ4: 認証フローを書き換え

##### 既存のNextAuth実装を削除

以下のファイルを削除またはコメントアウト：
- `src/pages/api/auth/[...nextauth].ts`
- `src/server/auth.ts`（NextAuth設定）

##### 新しいSupabase Auth実装

**新規ファイル**: `src/app/api/auth/callback/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home or dashboard
  return NextResponse.redirect(requestUrl.origin)
}
```

**新規ファイル**: `src/app/api/auth/signout/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/auth/signin', request.url))
}
```

#### ステップ5: 認証ページを更新

**サインインページ**: `src/pages/auth/signin.tsx`（または `src/app/auth/signin/page.tsx`）

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '~/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // メール/パスワードでサインイン
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  // Google OAuth
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) alert(error.message)
  }

  // GitHub OAuth
  const handleGithubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) alert(error.message)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-3xl font-bold">Sign In</h2>

        {/* メール/パスワードフォーム */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 text-white"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>

        {/* OAuth ボタン */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleSignIn}
            className="w-full rounded border p-2"
          >
            Sign in with Google
          </button>
          <button
            onClick={handleGithubSignIn}
            className="w-full rounded border p-2"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
```

**サインアップページ**: `src/pages/auth/signup.tsx`

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '~/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // メタデータとして保存
        },
      },
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for confirmation!')
      router.push('/auth/signin')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-3xl font-bold">Sign Up</h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2"
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 text-white"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### ステップ6: 認証状態の管理

**カスタムフック**: `src/hooks/useAuth.ts`

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '~/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 現在のユーザーを取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
```

#### ステップ7: tRPCの認証を更新

**ファイル**: `src/server/api/trpc.ts`

既存のNextAuth認証を削除し、Supabase認証に置き換え：

```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { prisma } from '~/server/db'
import { createServerSupabaseClient } from '~/lib/supabase-server'

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts

  // Supabaseクライアントを作成
  const supabase = createServerSupabaseClient()

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    prisma,
    supabase,
    user,
    req,
    res,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

// 認証が必要なプロシージャ
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // 型安全な user
    },
  })
})
```

---

## ストレージの移行（Backblaze → Supabase Storage）

### Supabase Storageのセットアップ

#### ステップ1: バケットを作成

1. Supabase Dashboard → 「Storage」
2. 「Create a new bucket」をクリック
3. バケット設定：
   - **Name**: `uploads`
   - **Public bucket**: チェックを外す（プライベート）
   - **File size limit**: 52428800（50MB）または任意
4. 「Create bucket」をクリック

#### ステップ2: RLS（Row Level Security）ポリシーを設定

1. 作成した `uploads` バケットを選択
2. 「Policies」タブを開く
3. 「New Policy」をクリック

**アップロードポリシー（認証済みユーザーのみ）**:

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');
```

**読み取りポリシー（認証済みユーザーのみ）**:

```sql
CREATE POLICY "Authenticated users can read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

**削除ポリシー（所有者のみ）**:

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### ステップ3: ビデオアップロード機能を書き換え

**ファイル**: `src/server/api/routers/video/router.ts`

Backblaze B2のコードをSupabase Storageに置き換え：

```typescript
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { createHash } from 'crypto'

export const videoRouter = createTRPCRouter({
  // ビデオファイルのアップロード用署名付きURL取得
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { filename, fileType } = input
      const userId = ctx.user.id

      // ユーザーIDをフォルダ名として使用（RLSポリシーと連携）
      const filePath = `${userId}/${Date.now()}_${filename}`

      // Supabase Storageに署名付きURLを作成
      const { data, error } = await ctx.supabase.storage
        .from('uploads')
        .createSignedUploadUrl(filePath)

      if (error) {
        console.error('Error creating signed upload URL:', error)
        throw new Error('Failed to create upload URL')
      }

      return {
        uploadUrl: data.signedUrl,
        filePath: data.path,
        token: data.token,
      }
    }),

  // アップロード完了後の処理（Bunny.netへの連携）
  finalizeUpload: protectedProcedure
    .input(
      z.object({
        filePath: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { filePath, title } = input

      // Supabase Storageから公開URLを取得
      const { data: urlData } = await ctx.supabase.storage
        .from('uploads')
        .createSignedUrl(filePath, 3600) // 1時間有効

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get file URL')
      }

      // Bunny.netにビデオを登録
      const bunnyResponse = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            AccessKey: process.env.BUNNY_API_KEY!,
          },
          body: JSON.stringify({
            title,
            url: urlData.signedUrl,
          }),
        }
      )

      const bunnyData = await bunnyResponse.json()
      return {
        videoId: bunnyData.guid,
        playbackUrl: `${process.env.BUNNY_STREAM_URL}/${bunnyData.guid}/play.m3u8`,
        thumbnailUrl: `${process.env.BUNNY_STREAM_URL}/${bunnyData.guid}/thumbnail.jpg`,
      }
    }),

  // Bunny.net関連のメソッドはそのまま維持
  createVideo: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input }) => {
      // 既存のコードをそのまま使用
      const response = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            AccessKey: process.env.BUNNY_API_KEY!,
          },
          body: JSON.stringify({ title: input.title }),
        }
      )

      const data = await response.json()
      return { videoId: data.guid }
    }),

  getVideoStatus: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      // 既存のコードをそのまま使用
      const response = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${input.videoId}`,
        {
          headers: {
            Accept: 'application/json',
            AccessKey: process.env.BUNNY_API_KEY!,
          },
        }
      )

      return response.json()
    }),

  getTusUploadUrl: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        filename: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(({ input }) => {
      // 既存のコードをそのまま使用
      const expirationTime = Math.floor(Date.now() / 1000) + 3600
      const signature = createHash('sha256')
        .update(
          process.env.BUNNY_LIBRARY_ID! +
            process.env.BUNNY_API_KEY! +
            expirationTime +
            input.videoId
        )
        .digest('hex')

      return {
        uploadUrl: 'https://video.bunnycdn.com/tusupload',
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expirationTime.toString(),
          VideoId: input.videoId,
          LibraryId: process.env.BUNNY_LIBRARY_ID!,
        },
        metadata: {
          filetype: input.fileType,
          title: input.filename,
        },
      }
    }),
})
```

#### ステップ4: フロントエンドのアップロードコードを更新

**既存のアップロードコンポーネント**を更新：

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '~/lib/supabase'
import { trpc } from '~/utils/trpc'

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const uploadMutation = trpc.video.getUploadUrl.useMutation()
  const finalizeMutation = trpc.video.finalizeUpload.useMutation()

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)

    try {
      // 1. 署名付きURLを取得
      const { uploadUrl, filePath, token } = await uploadMutation.mutateAsync({
        filename: file.name,
        fileType: file.type,
      })

      // 2. Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .uploadToSignedUrl(filePath, token, file)

      if (uploadError) {
        throw uploadError
      }

      // 3. アップロード完了処理（Bunny.netに連携）
      const result = await finalizeMutation.mutateAsync({
        filePath,
        title: file.name,
      })

      console.log('Video uploaded successfully:', result)
      alert('Video uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  )
}
```

---

## 環境変数の更新

### 新しい `.env` ファイル

```bash
# Supabase Database（Prisma用）
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Bunny.net（既存）
BUNNY_LIBRARY_ID="your-library-id"
BUNNY_API_KEY="your-api-key"
BUNNY_STREAM_URL="https://iframe.mediadelivery.net/embed"

# Google OAuth（既存設定をSupabaseで再利用）
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth（既存設定をSupabaseで再利用）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# 削除する環境変数（もう不要）
# NEXTAUTH_SECRET=""
# NEXTAUTH_URL=""
# JWT_SECRET=""
# BACKBLAZE_KEY_ID=""
# BACKBLAZE_APPLICATION_KEY=""
# BACKBLAZE_KEY_NAME=""
# BACKBLAZE_ENDPOINT=""
# BACKBLAZE_BUCKET_NAME=""
```

### Prismaスキーマの更新（オプション）

`prisma/schema.prisma` の `datasource` セクションを更新：

```prisma
datasource db {
    provider          = "postgresql"
    url               = env("DATABASE_URL")
    directUrl         = env("DIRECT_URL")
    // Supabase Pooler用の設定
}
```

---

## コードの書き換え

### 削除するパッケージ

```bash
pnpm remove @next-auth/prisma-adapter next-auth argon2 @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### インストールするパッケージ

```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 削除または更新するファイル

#### 削除するファイル
- `src/pages/api/auth/[...nextauth].ts`
- `src/server/auth.ts`（NextAuth設定）

#### 作成するファイル
- `src/lib/supabase.ts`（Supabaseクライアント）
- `src/lib/supabase-server.ts`（サーバー用クライアント）
- `src/app/api/auth/callback/route.ts`（OAuth コールバック）
- `src/app/api/auth/signout/route.ts`（サインアウト）
- `src/hooks/useAuth.ts`（認証フック）

#### 更新するファイル
- `src/server/api/trpc.ts`（認証ミドルウェア）
- `src/server/api/routers/video/router.ts`（ストレージ）
- `src/pages/auth/signin.tsx`（サインインページ）
- `src/pages/auth/signup.tsx`（サインアップページ）

---

## Vercelへのデプロイ

### ステップ1: 環境変数を設定

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 以下の環境変数を追加：

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
BUNNY_LIBRARY_ID=your-library-id
BUNNY_API_KEY=your-api-key
BUNNY_STREAM_URL=https://iframe.mediadelivery.net/embed
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### ステップ2: GitHubにプッシュ

```bash
git add .
git commit -m "feat: migrate to Supabase"
git push origin main
```

### ステップ3: 自動デプロイを確認

Vercelが自動的にビルドとデプロイを開始します。

### ステップ4: デプロイ後の設定

1. デプロイされたURLを確認（例: `https://formonce.vercel.app`）
2. Supabase Dashboard → Authentication → URL Configuration
3. **Site URL**を更新: `https://formonce.vercel.app`
4. **Redirect URLs**に以下を追加:
   ```
   https://formonce.vercel.app/**
   https://formonce.vercel.app/api/auth/callback
   ```

---

## トラブルシューティング

### 問題1: 「Database connection failed」

**原因**: DATABASE_URLが正しくない、またはSupabaseのConnection Poolerが無効

**解決方法**:
1. Supabase Dashboard → Settings → Database
2. Connection Poolerが有効か確認
3. 接続文字列に `?pgbouncer=true&connection_limit=1` が含まれているか確認
4. パスワードに特殊文字がある場合、URLエンコードする

### 問題2: 「User not authenticated」

**原因**: Supabase Authの設定が正しくない

**解決方法**:
1. ブラウザのDevToolsでCookieを確認（`sb-[project]-auth-token`）
2. Supabase Dashboard → Authentication → Settings で Email Confirmationの設定を確認
3. OAuth設定のリダイレクトURLを確認

### 問題3: 「File upload failed」

**原因**: RLSポリシーまたはバケット設定の問題

**解決方法**:
1. Supabase Dashboard → Storage → Policies を確認
2. バケットが正しく作成されているか確認
3. ファイルサイズ制限を確認
4. SupabaseのService Role Keyを使用する（開発時のみ）

### 問題4: 「OAuth redirect_uri mismatch」

**原因**: OAuthプロバイダーのリダイレクトURIが正しくない

**解決方法**:
1. Google Cloud Console / GitHub OAuth App設定を開く
2. Authorized redirect URIs に以下を追加:
   ```
   https://[PROJECT-REF].supabase.co/auth/v1/callback
   ```
3. Supabase Dashboard → Authentication → URL Configurationも確認

### 問題5: Prismaマイグレーションエラー

**原因**: 接続文字列の形式またはデータベース権限

**解決方法**:
```bash
# Prismaクライアントを再生成
pnpx prisma generate

# キャッシュをクリア
rm -rf node_modules/.prisma

# マイグレーションをリセット（開発環境のみ！）
pnpx prisma migrate reset

# マイグレーションを再実行
pnpx prisma migrate dev
```

---

## 学習リソース

### Supabase 公式ドキュメント

#### 全般
- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [Supabase クイックスタート](https://supabase.com/docs/guides/getting-started)

#### Database
- [Database Overview](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

#### Authentication
- [Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)

#### Storage
- [Storage Overview](https://supabase.com/docs/guides/storage)
- [Signed Upload URLs](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)
- [Row Level Security for Storage](https://supabase.com/docs/guides/storage/security/access-control)

### 日本語記事

#### Supabase 全般
- [初心者でもわかるSupabaseの全貌 | ギズまる](https://gizzmaru.com/entry/what_is_supabase_service)

#### Authentication
- [Supabase auth helperでNext.js認証を楽にする | DevelopersIO](https://dev.classmethod.jp/articles/supabase-auth-helper/)
- [Next.js（App Router）× Supabase認証編 | らくらくエンジニア](https://rakuraku-engineer.com/posts/nextjs-app-supabase-login/)

#### Storage
- [Supabase Storageでセキュアなファイルアップロード | GIG Inc.](https://giginc.co.jp/blog/giglab/supabase-storage)
- [Supabaseストレージに画像をアップロード | Qiita](https://qiita.com/dshukertjr/items/05437bb88bc7ae8583b8)
- [Supabase Storageアバター表示 | DevelopersIO](https://dev.classmethod.jp/articles/supabase-storage/)
- [入門！Supabase Storageの使い方 | Depart Inc.](https://depart-inc.com/blog/how-to-supabase-storage/)

#### Prisma × Supabase
- [Using Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)

### 動画リソース
- [Supabase in 100 Seconds](https://www.youtube.com/watch?v=zBZgdTb-dns)
- [Supabase Full Course for Beginners](https://www.youtube.com/watch?v=dU7GwCOgvNY)

---

## 移行チェックリスト

最終確認用のチェックリストです。

### 移行前
- [ ] 現在のプロジェクトをGitにコミット
- [ ] `.env`ファイルをバックアップ
- [ ] データベースデータをエクスポート（必要な場合）

### Supabaseセットアップ
- [ ] Supabaseプロジェクトを作成
- [ ] データベース接続情報を取得
- [ ] API Keys（anon、service_role）を取得
- [ ] バケット（uploads）を作成
- [ ] RLSポリシーを設定
- [ ] OAuth プロバイダーを設定（Google、GitHub）

### コード変更
- [ ] Supabaseパッケージをインストール
- [ ] NextAuthパッケージを削除
- [ ] Backblazeパッケージを削除
- [ ] Supabaseクライアントファイルを作成
- [ ] 認証ページを書き換え（signin、signup）
- [ ] tRPC認証ミドルウェアを更新
- [ ] ストレージルーターを書き換え
- [ ] 環境変数を更新

### ローカルテスト
- [ ] `pnpm install` 実行
- [ ] Prismaマイグレーション実行
- [ ] ローカル開発サーバー起動（`pnpm dev`）
- [ ] サインアップ機能をテスト
- [ ] サインイン機能をテスト（メール/パスワード）
- [ ] OAuth機能をテスト（Google、GitHub）
- [ ] ファイルアップロード機能をテスト
- [ ] データベース操作をテスト

### デプロイ
- [ ] Vercelに環境変数を設定
- [ ] GitHubにプッシュ
- [ ] Vercelで自動デプロイを確認
- [ ] Supabaseで本番URLを設定
- [ ] OAuth リダイレクトURLを更新

### 本番テスト
- [ ] 本番環境でサインアップ
- [ ] 本番環境でサインイン
- [ ] 本番環境でファイルアップロード
- [ ] 本番環境でビデオ再生

---

## まとめ

このガイドでは、FormOnceプロジェクトを以下のように移行しました：

### 移行内容

| 機能 | 移行前 | 移行後 |
|------|--------|--------|
| データベース | Neon PostgreSQL | Supabase PostgreSQL |
| 認証 | NextAuth | Supabase Auth |
| ストレージ | Backblaze B2 | Supabase Storage |
| ビデオCDN | Bunny.net | Bunny.net（継続） |
| ORM | Prisma | Prisma（継続） |

### メリット

1. **統合管理** - データベース、認証、ストレージを1つのダッシュボードで管理
2. **コスト削減** - 無料プランで全機能が使える
3. **シンプルな構成** - 管理するサービスが減る
4. **日本リージョン** - Supabaseは東京リージョンが利用可能
5. **リアルタイム機能** - 将来的にリアルタイム機能を追加可能

### 次のステップ

- カスタムドメインの設定
- Supabase Edge Functionsの活用
- リアルタイム機能の実装
- データベース最適化とインデックス追加

Happy Coding with Supabase! 🎉
