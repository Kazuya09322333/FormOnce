# FormOnce技術スタック解説ガイド
## 初心者とプロフェッショナルの対話で学ぶ

---

## 登場人物
- **初心者（初）**: プログラミングを始めたばかりで、基本的な概念を学んでいる
- **プロ（プロ）**: 実務経験豊富なシニアエンジニア

---

## 第1章: Next.js - Reactフレームワークの王様

**初**: このプロジェクトって、Next.jsを使ってるんですね。これって何ですか？

**プロ**: いい質問だね！Next.jsは、Reactをベースにした強力なフルスタックフレームワークだよ。Vercel社が開発していて、React単体では面倒な部分を簡単にしてくれるんだ。

**初**: React「単体」では面倒な部分って？

**プロ**: 例えば、ルーティング（ページ遷移）、サーバーサイドレンダリング（SSR）、画像最適化、APIルートの作成なんかだね。Reactだけだと、これらを全部自分で設定しないといけないけど、Next.jsなら最初から組み込まれてる。

**初**: このプロジェクトはNext.js 13を使ってますよね？

**プロ**: その通り！Next.js 13は2022年にリリースされた大きなアップデートで、特に重要な新機能がいくつかあるんだ：

### Next.js 13の主要機能

1. **App Directory（アプリディレクトリ）**
   - **初**: これは何ですか？
   - **プロ**: 新しいファイルベースのルーティングシステムだよ。以前の`pages`ディレクトリに代わる、より強力な`app`ディレクトリが導入されたんだ。レイアウトの共有やサーバーコンポーネントが使いやすくなった。

2. **Turbopack**
   - **初**: Turbopackって聞いたことあります！
   - **プロ**: これはすごいんだよ。Webpackの後継で、Rustで書かれた超高速なバンドラーだ。起動が1.8秒で、Webpackの16.5秒と比べると約9倍速い。開発中の更新はWebpackより700倍、Viteより10倍速いんだ。

3. **Server Components（サーバーコンポーネント）**
   - **初**: サーバーコンポーネントって何ですか？
   - **プロ**: React 18で導入された機能で、サーバー側でレンダリングされるコンポーネントだよ。データベースへの直接アクセスができて、JavaScriptをクライアント（ブラウザ）に送る必要がないから、ページが軽くなるんだ。

4. **新しいデータフェッチング**
   - **プロ**: Next.js 13では、ネイティブの`fetch()` APIを拡張していて、自動的にキャッシュとデータの再検証ができるようになった。`async/await`でデータ取得が書けるのも便利だよ。

**初**: なるほど！でも、このプロジェクトのpackage.jsonを見ると、`next: "^13.5.7"`ってなってますね。

**プロ**: 鋭いね！13.5.7はNext.js 13の安定版マイナーリリースだ。新機能を取り入れつつ、本番環境で安心して使える成熟したバージョンなんだよ。

---

## 第2章: React 18 - UIライブラリの進化

**初**: Next.jsはReactの上に構築されてるって言いましたよね？このプロジェクトは React 18.2.0 を使ってるみたいです。

**プロ**: そうだね！React 18は2022年3月にリリースされた大きなアップデートで、特に「並行レンダリング（Concurrent Rendering）」という革新的な機能が導入されたんだ。

**初**: 並行レンダリングって何ですか？

**プロ**: 簡単に言うと、Reactが複数のタスクを同時に処理できるようになったってことだよ。例えば、ユーザーが入力している最中でも、バックグラウンドで重い計算をしたり、データを取得したりできるんだ。

### React 18の新しいHooks

**初**: Hooksって、あの`useState`とか`useEffect`のことですよね？

**プロ**: その通り！React 18では、さらに強力な新しいHooksが追加されたんだ：

1. **useId**
   - **プロ**: クライアントとサーバーの両方で一意なIDを生成するHookだよ。
   - **初**: なぜこれが必要なんですか？
   - **プロ**: サーバーサイドレンダリング（SSR）の時、サーバーとクライアントで同じIDを使わないと、Reactがエラーを出すことがあるんだ。`useId`を使えば、その心配がなくなる。

2. **useTransition**
   - **初**: これは何をするんですか？
   - **プロ**: 状態の更新を「緊急でない」とマークできるんだ。例えば、検索ボックスに入力している時、入力のレスポンスは速くしたいけど、検索結果の表示は少し遅れてもいいよね？`useTransition`を使えば、入力のスムーズさを保ちながら、バックグラウンドで検索結果を更新できるんだ。

   ```typescript
   const [isPending, startTransition] = useTransition();

   function handleChange(e) {
     setInputValue(e.target.value); // 即座に更新
     startTransition(() => {
       setSearchResults(search(e.target.value)); // 低優先度で更新
     });
   }
   ```

3. **useDeferredValue**
   - **プロ**: これは`useTransition`に似てるけど、値の更新を遅延させることができるんだ。
   - **初**: 具体的にはどう使うんですか？
   - **プロ**: 例えば、リストのフィルタリングだね。ユーザーが入力している間は古い結果を表示し続けて、入力が落ち着いたら新しい結果に更新するんだ。

4. **useSyncExternalStore**
   - **初**: これは難しそうですね...
   - **プロ**: これは主にライブラリ作者向けだよ。Reduxみたいな外部の状態管理ライブラリや、ブラウザAPIと安全に統合するためのHookなんだ。

5. **useInsertionEffect**
   - **プロ**: CSS-in-JSライブラリ向けの低レベルHookだよ。DOMが更新される直前にスタイルを注入できるんだ。

**初**: たくさんありますね！でも、普段使うのは最初の3つくらいですか？

**プロ**: そうだね！`useTransition`と`useDeferredValue`は、パフォーマンスを改善したい時にとても便利だよ。

---

## 第3章: TypeScript - 型安全の守護者

**初**: このプロジェクトのファイルを見ると、`.ts`とか`.tsx`って拡張子が多いですね。

**プロ**: それがTypeScriptだよ！JavaScriptに「型」を追加した言語なんだ。

**初**: 型って何ですか？

**プロ**: 変数や関数が扱うデータの種類を明示することだよ。例えば：

```typescript
// JavaScript（型なし）
function add(a, b) {
  return a + b;
}

add(5, 3);      // 8
add("5", "3");  // "53" （バグ！）

// TypeScript（型あり）
function add(a: number, b: number): number {
  return a + b;
}

add(5, 3);      // 8
add("5", "3");  // エラー！ コンパイル時に検出
```

**初**: あ、バグを事前に防げるんですね！

**プロ**: その通り！2024年の調査によると、TypeScriptを使うことで：

### TypeScriptの主要なメリット

1. **コンパイル時のエラー検出**
   - **プロ**: 実行前にバグを見つけられるから、本番環境でのエラーが激減するよ。
   - **初**: 開発中に気づけるってことですね！

2. **コードの保守性とスケーラビリティ**
   - **プロ**: 大規模プロジェクトでは特に重要だね。型定義がドキュメントの役割も果たすから、他の開発者がコードを理解しやすくなる。
   - **初**: チームで開発する時に便利そうですね。

3. **優れた開発者体験**
   - **プロ**: VS Codeみたいなエディタだと、自動補完やリアルタイムエラー検出が超強力になるんだ。
   - **初**: あ、だから入力中に候補が出てくるんですね！

4. **業界での採用**
   - **プロ**: Google、Facebook、Netflixみたいな大企業も使ってるよ。Angular、React、Vue.jsといった人気フレームワークもTypeScriptをサポートしてる。

5. **大規模プロジェクトに最適**
   - **プロ**: 数万行、数十万行のコードでも、型システムのおかげで変更の影響範囲がすぐわかるんだ。

**初**: このプロジェクトの`tsconfig.json`を見ると、`"strict": true`ってなってますね。

**プロ**: いい所に気づいたね！これは「厳格モード」で、型チェックを最も厳しくする設定だよ。バグをより多く防げるけど、コードを書く時はちょっと大変になる。でも、長期的には絶対にこの方が良いんだ。

---

## 第4章: tRPC - 型安全なAPI通信

**初**: `package.json`に`@trpc/client`とか`@trpc/server`ってありますね。これは何ですか？

**プロ**: tRPCは「TypeScript Remote Procedure Call」の略で、TypeScriptの型安全性をAPIにまで拡張する素晴らしいライブラリなんだ。

**初**: APIの型安全性って、どういうことですか？

**プロ**: 通常、REST APIを使う時はこんな感じだよね：

```typescript
// 通常のREST API
const response = await fetch('/api/users');
const users = await response.json(); // any型（型情報なし）
// users.nameにアクセスできるかわからない！
```

でも、tRPCを使うと：

```typescript
// tRPC
const users = await trpc.users.getAll.query();
// users は User[] 型！自動補完も効く！
// users[0].name // これが安全に書ける
```

**初**: すごい！でも、どうやってそれを実現してるんですか？

**プロ**: tRPCの仕組みはこうだよ：

### tRPCの主要な特徴

1. **エンドツーエンドの型安全性**
   - **プロ**: サーバー側で定義した型が、自動的にクライアント側でも使えるんだ。
   - **初**: コード生成とかするんですか？
   - **プロ**: いいや！TypeScriptの型推論を使うから、ビルドステップやコード生成は一切不要なんだ。

2. **ゼロ依存、軽量**
   - **プロ**: tRPCのクライアントサイドフットプリントは非常に小さくて、依存関係もほぼゼロだよ。

3. **フレームワーク非依存**
   - **プロ**: React、Next.js、Express、Fastify、AWS Lambda、Svelte... 色んなフレームワークで使えるんだ。

4. **組み込みのバリデーション**
   - **初**: バリデーションって何ですか？
   - **プロ**: データの検証だよ。tRPCはZodっていうライブラリと統合されてて、APIの入力を実行時にチェックできるんだ。

### tRPCの使用例

```typescript
// サーバー側（src/server/api/routers/forms/router.ts）
export const formsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.id }
      });
      return form;
    }),
});

// クライアント側
const { data: form } = trpc.forms.getById.useQuery({ id: "123" });
// form の型が自動的に推論される！
```

**初**: これは便利ですね！REST APIよりも安全だし、GraphQLよりもシンプルそうです。

**プロ**: まさにその通り！tRPCはTypeScriptのモノレポ（フロントエンドとバックエンドが同じリポジトリにある構成）に最適なんだよ。

---

## 第5章: Prisma - 次世代ORM

**初**: データベースとのやり取りはどうしてるんですか？

**プロ**: それがPrismaの出番だよ！ORMって知ってる？

**初**: ORM... Object-Relational Mapping？オブジェクトとデータベースの橋渡しをするやつですか？

**プロ**: そうそう！Prismaは「次世代のORM」って呼ばれてて、従来のORMとは一線を画すんだ。

### Prismaの革新的な特徴

1. **Prisma Schema（スキーマ定義）**
   - **プロ**: `prisma/schema.prisma`ファイルを見てごらん。データベースの構造を宣言的に書けるんだ。

   ```prisma
   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     name      String
     createdAt DateTime @default(now())
     Form      Form[]
   }

   model Form {
     id          String   @id @default(uuid())
     title       String
     description String?
     userId      String
     user        User     @relation(fields: [userId], references: [id])
   }
   ```

   - **初**: これはわかりやすいですね！

2. **Prisma Client（自動生成されるクライアント）**
   - **プロ**: `prisma generate`コマンドを実行すると、スキーマから型安全なクライアントが自動生成されるんだ。

   ```typescript
   // 完全に型安全！
   const user = await prisma.user.findUnique({
     where: { email: 'user@example.com' },
     include: { Form: true } // リレーションも簡単に取得
   });
   ```

   - **初**: SQLを書かなくていいんですか？
   - **プロ**: 基本的には書かなくていいよ！Prismaが最適化されたSQLを生成してくれる。でも、複雑なクエリの時は生SQLも書けるんだ。

3. **Prisma Migrate（マイグレーション）**
   - **初**: マイグレーションって何ですか？
   - **プロ**: データベースのスキーマ変更を管理する仕組みだよ。例えば、新しいテーブルを追加したり、カラムを変更したりする時に使うんだ。
   - **初**: なるほど！
   - **プロ**: `prisma migrate dev`コマンドで、スキーマの変更を自動的にデータベースに適用できるんだよ。

4. **Prisma Studio（GUIツール）**
   - **プロ**: `npx prisma studio`を実行すると、ブラウザでデータベースの中身を見たり編集したりできるGUIが起動するんだ。
   - **初**: 便利ですね！

### PostgreSQLとの組み合わせ

**初**: このプロジェクトはPostgreSQLを使ってますよね？

**プロ**: そうだね！PostgreSQLは世界で最も先進的なオープンソースのリレーショナルデータベースだよ。

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**初**: `directUrl`って何ですか？

**プロ**: これはコネクションプーリングをバイパスするためのURLだよ。マイグレーションの時に使うんだ。Supabaseみたいなサービスを使う時に必要になることがあるんだ。

---

## 第6章: Supabase - Firebase の強力な代替

**初**: Supabaseって何ですか？package.jsonに色々入ってますね。

**プロ**: Supabaseは「オープンソースのFirebase代替」って呼ばれてるBaaS（Backend as a Service）だよ！

**初**: BaaSって何ですか？

**プロ**: Backend as a Serviceの略で、バックエンドの機能（認証、データベース、ストレージなど）をクラウドサービスとして提供してくれるんだ。自分でサーバーを管理しなくていいから、開発に集中できるよ。

### Supabaseの主要機能

1. **PostgreSQLデータベース**
   - **プロ**: SupabaseはPostgreSQLをベースにしているんだ。だから、Prismaと組み合わせやすいんだよ。
   - **初**: なるほど！

2. **認証（Authentication）**
   - **プロ**: このプロジェクトでは、Supabaseの認証機能を使ってるよ。

   ```typescript
   // src/server/auth-supabase.ts を見てみて
   import { createClient } from '@supabase/supabase-js';
   ```

   - **初**: どんな認証方法が使えるんですか？
   - **プロ**: パスワード、マジックリンク（メールだけでログイン）、ソーシャルログイン（Google、GitHubなど）、OTP（ワンタイムパスワード）、SSO（シングルサインオン）が使えるよ。

3. **JWT（JSON Web Token）**
   - **初**: JWTって何ですか？
   - **プロ**: 認証トークンの一種だよ。ユーザーがログインすると、Supabaseが署名付きのトークンを発行する。このトークンをAPIリクエストに付けることで、ユーザーを識別できるんだ。
   - **初**: セキュアなんですか？
   - **プロ**: とてもセキュアだよ！トークンは暗号化されていて、改ざんを検出できるんだ。

4. **Row Level Security（RLS）**
   - **プロ**: これがSupabaseの強力な機能の一つなんだ！
   - **初**: どういう機能ですか？
   - **プロ**: データベースのレベルで、「誰がどのデータにアクセスできるか」を制御できるんだ。例えば：

   ```sql
   -- ユーザーは自分のフォームだけ見れる
   CREATE POLICY "Users can view their own forms"
   ON forms FOR SELECT
   USING (auth.uid() = user_id);
   ```

### このプロジェクトでの使用例

**初**: `@supabase/auth-helpers-nextjs`って何ですか？

**プロ**: Next.jsとSupabase認証を簡単に統合するためのヘルパーライブラリだよ。クッキーベースの認証を簡単に実装できるんだ。

```typescript
// src/pages/api/auth/callback.ts
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
```

**初**: `@supabase/ssr`は？

**プロ**: Server-Side Rendering（サーバーサイドレンダリング）でSupabaseを使う時の最新のパッケージだよ。Next.js 13のApp Routerに最適化されてるんだ。

---

## 第7章: Tailwind CSS - ユーティリティファーストの革命

**初**: CSSはどうやって書いてるんですか？

**プロ**: このプロジェクトではTailwind CSSを使ってるよ！

**初**: Tailwind CSS？BootstrapとかMaterial UIとは違うんですか？

**プロ**: 全く違うアプローチなんだ！Tailwindは「ユーティリティファースト」って呼ばれる方法を採用してる。

### 従来のCSSとの比較

```html
<!-- 従来の方法 -->
<style>
  .card {
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
</style>
<div class="card">...</div>

<!-- Tailwind CSS -->
<div class="p-4 bg-white rounded-lg shadow-md">...</div>
```

**初**: あ、CSSクラスが直接HTMLに書かれてるんですね！

**プロ**: そう！一見ごちゃごちゃしてるように見えるけど、実はメリットが多いんだよ。

### Tailwind CSSのメリット

1. **開発速度の向上**
   - **プロ**: クラス名を考える必要がないし、CSSファイルとHTMLファイルを行ったり来たりしなくていいんだ。
   - **初**: 確かに、クラス名を考えるのって時間かかりますね...

2. **CSSのサイズが増えない**
   - **プロ**: ユーティリティクラスは再利用されるから、プロジェクトが大きくなってもCSSのサイズがほとんど増えないんだ。
   - **初**: どのくらい小さいんですか？
   - **プロ**: 本番ビルドでは、使われていないクラスが自動的に削除される（PurgeCSS）から、大抵10KB以下になるよ！

3. **デザインシステムの一貫性**
   - **プロ**: Tailwindには事前定義された色、サイズ、スペーシングがあるから、デザインが自然と統一されるんだ。

   ```javascript
   // tailwind.config.ts
   theme: {
     extend: {
       colors: {
         primary: 'hsl(var(--primary))',
         secondary: 'hsl(var(--secondary))',
       },
     },
   }
   ```

4. **レスポンシブデザインが簡単**
   - **プロ**: ブレークポイントがプレフィックスで使えるんだ。

   ```html
   <div class="text-sm md:text-base lg:text-lg">
     モバイルでは小さく、タブレットで中、デスクトップで大きく
   </div>
   ```

5. **ダークモード対応**
   - **初**: このプロジェクト、ダークモードに対応してますよね？
   - **プロ**: そう！Tailwindならダークモードも簡単だよ。

   ```html
   <div class="bg-white dark:bg-gray-800 text-black dark:text-white">
     自動的にダークモードに対応！
   </div>
   ```

### このプロジェクトでの使用

**初**: `tailwindcss-animate`って何ですか？

**プロ**: アニメーションのユーティリティを追加するプラグインだよ。フェードイン、スライドイン、スピンなんかが簡単に使えるようになるんだ。

```html
<div class="animate-fade-in">フェードイン</div>
<div class="animate-spin">スピン</div>
```

---

## 第8章: Radix UI - アクセシブルなUIプリミティブ

**初**: package.jsonに`@radix-ui/`で始まるパッケージがたくさんありますね。

**プロ**: Radix UIは「ヘッドレスUI」コンポーネントライブラリだよ！

**初**: ヘッドレスって、見た目がないってことですか？

**プロ**: その通り！Radix UIは機能とアクセシビリティだけを提供して、スタイリングは完全に開発者に任せるんだ。

### Radix UIの哲学

**プロ**: 従来のUIライブラリ（BootstrapやMaterial UI）は、見た目も機能も全部決まってるよね？

**初**: はい、すぐ使えて便利ですけど、デザインを変えるのが大変でした。

**プロ**: まさにそれが問題なんだ！Radix UIは「ロジック」だけを提供して、「見た目」はTailwind CSSなどで自由に作れるんだよ。

### Radix UIが提供するもの

1. **アクセシビリティ（a11y）**
   - **プロ**: キーボード操作、スクリーンリーダー対応、ARIA属性など、アクセシビリティが完璧に実装されてるんだ。
   - **初**: 自分で実装するの大変そうですもんね...
   - **プロ**: 本当に大変だよ！例えば、ドロップダウンメニュー一つ作るにも、フォーカス管理、Escキーで閉じる、外側クリックで閉じる、スクリーンリーダー対応... 考えることがたくさんあるんだ。

2. **複雑なインタラクション**
   - **プロ**: ポータルレンダリング、スクロールロック、フォーカストラップなんかも全部組み込まれてる。
   - **初**: ポータルレンダリングって何ですか？
   - **プロ**: DOMツリーの外側にコンポーネントをレンダリングすることだよ。モーダルやツールチップが親要素のスタイルに影響されないようにするんだ。

### このプロジェクトで使われているRadixコンポーネント

```typescript
// package.jsonから抜粋
"@radix-ui/react-dialog": "^1.1.2",        // モーダル
"@radix-ui/react-dropdown-menu": "^2.1.2", // ドロップダウン
"@radix-ui/react-tooltip": "^1.1.4",       // ツールチップ
"@radix-ui/react-select": "^1.2.2",        // セレクトボックス
"@radix-ui/react-checkbox": "^1.1.2",      // チェックボックス
"@radix-ui/react-tabs": "^1.1.1",          // タブ
```

**初**: こんなにたくさん！

**プロ**: Radix UIは32個以上のコンポーネントを提供してるんだよ。しかも、全部独立してるから、必要なものだけインストールできる。

### 使用例

```typescript
// ダイアログ（モーダル）の例
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="bg-blue-500 text-white px-4 py-2 rounded">
        開く
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
          <Dialog.Title>タイトル</Dialog.Title>
          <Dialog.Description>説明</Dialog.Description>
          <Dialog.Close>閉じる</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**初**: スタイルは全部Tailwindで書けるんですね！

**プロ**: そう！機能とスタイルが完全に分離されてるから、メンテナンスしやすいんだ。

### 採用企業

**プロ**: Radix UIは、Vercel、Supabase、Node.jsの公式サイトでも使われてるよ。

**初**: 信頼性が高いんですね！

---

## 第9章: React Flow - ノードベースUI

**初**: `reactflow`って何に使うんですか？

**プロ**: React Flowは、フローチャート、ダイアグラム、ノードベースのエディタを作るためのライブラリだよ！

**初**: ノードベースって？

**プロ**: 箱（ノード）と矢印（エッジ）で構成されたビジュアルなインターフェースのことだよ。このプロジェクトでは、フォームのフローを視覚的に作成するのに使われてるんだ。

### React Flowの機能

1. **ドラッグ＆ドロップ**
   - **プロ**: ノードをドラッグして動かしたり、接続したりできるんだ。
   - **初**: Figmaみたいな感じですか？
   - **プロ**: いい例えだね！

2. **ズームとパン**
   - **プロ**: マウスホイールでズーム、ドラッグでパンができるよ。これは全部組み込まれてる。

3. **カスタムノード**
   - **プロ**: ノードは普通のReactコンポーネントだから、中に何でも入れられるんだ。

   ```typescript
   // カスタムノードの例
   function QuestionNode({ data }) {
     return (
       <div className="p-4 border rounded shadow">
         <h3>{data.label}</h3>
         <input type="text" />
         <button>送信</button>
       </div>
     );
   }
   ```

4. **接続の検証**
   - **プロ**: どのノードとどのノードを接続できるか、プログラムで制御できるんだ。

### このプロジェクトでの使用

```typescript
// src/components/form-builder/flow-builder/index.tsx
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from 'reactflow';
```

**初**: `Background`、`Controls`、`MiniMap`って何ですか？

**プロ**:
- **Background**: グリッドや点のパターンを表示する
- **Controls**: ズームイン/アウトのボタン
- **MiniMap**: 全体のミニマップを表示する

これらは全部オプションで、簡単に追加できるんだ。

### 採用企業

**プロ**: StripeやTypeformも使ってるよ。データ処理ツール、チャットボットビルダー、機械学習のインターフェースなんかによく使われてるんだ。

---

## 第10章: Zustand - シンプルな状態管理

**初**: 状態管理って、ReduxとかRecoilとか色々ありますよね？

**プロ**: そう！でもこのプロジェクトではZustandを使ってるんだ。

**初**: なぜZustandなんですか？

**プロ**: Zustandは「シンプル、高速、スケーラブル」な状態管理ライブラリで、Reduxみたいなボイラープレートコードが要らないんだよ。

### Zustand vs Redux

```typescript
// Redux（複雑）
// 1. Action types
const INCREMENT = 'INCREMENT';

// 2. Action creators
const increment = () => ({ type: INCREMENT });

// 3. Reducer
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    default:
      return state;
  }
};

// 4. Store
const store = createStore(counterReducer);

// 5. Provider
<Provider store={store}>
  <App />
</Provider>

// Zustand（シンプル）
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 使用
function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

**初**: 全然違いますね！Zustandの方がずっとシンプルです。

### Zustandの特徴

1. **Providerが不要**
   - **プロ**: Reduxと違って、アプリ全体をProviderでラップする必要がないんだ。
   - **初**: それは便利ですね！

2. **フックベース**
   - **プロ**: ストアは普通のReact Hookとして使えるよ。

3. **細かい再レンダリング制御**
   - **プロ**: コンポーネントは必要な状態だけを購読できるから、無駄な再レンダリングが起きないんだ。

   ```typescript
   // count が変わった時だけ再レンダリング
   const count = useStore((state) => state.count);

   // name が変わった時だけ再レンダリング
   const name = useStore((state) => state.name);
   ```

4. **非常に小さい**
   - **プロ**: Zustandは1KB以下ととても軽量だよ！

### このプロジェクトでの使用例

**初**: このプロジェクトでは何に使ってるんですか？

**プロ**: おそらくフォームビルダーの一時的な状態（選択されたノード、ドラッグ中のアイテムなど）を管理するのに使ってると思うよ。グローバルな状態は少なめで、サーバー状態（データベースから取得したデータ）はtRPCで管理してるからね。

---

## 第11章: その他の重要なライブラリ

### Zod - スキーマバリデーション

**初**: `zod`って何ですか？

**プロ**: TypeScript用のスキーマバリデーションライブラリだよ！

```typescript
import { z } from 'zod';

// スキーマ定義
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().positive().int(),
});

// バリデーション
const result = userSchema.parse({
  name: 'John',
  email: 'john@example.com',
  age: 30,
}); // OK！

const result2 = userSchema.parse({
  name: '',
  email: 'invalid',
  age: -5,
}); // エラー！
```

**初**: TypeScriptの型とは違うんですか？

**プロ**: TypeScriptの型はコンパイル時にしかチェックされないよね？Zodは実行時にデータをチェックできるんだ。APIから来たデータや、ユーザーの入力をチェックするのに必須だよ。

### React Hook Form + Formik

**初**: フォームのライブラリが2つありますね。

**プロ**: `react-hook-form`と`formik`だね。どちらもフォームの状態管理とバリデーションを簡単にするライブラリだよ。

**初**: 2つある理由は？

**プロ**: 段階的に移行してる途中かもしれないね。React Hook Formの方が新しくて高性能だから、最近はこっちが主流だよ。

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema), // Zodと統合！
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### Framer Motion

**初**: `framer-motion`は？

**プロ**: Reactのアニメーションライブラリで、とても簡単に滑らかなアニメーションが作れるんだ。

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  フェードイン＆スライドイン！
</motion.div>
```

### HLS.js

**初**: `hls.js`って何ですか？

**プロ**: HTTP Live Streaming（HLS）を再生するためのライブラリだよ。動画のストリーミングに使うんだ。

**プロ**: このプロジェクトはフォームに動画を埋め込めるから、その再生に使ってるんだよ。

### FFmpeg

**初**: `@ffmpeg/ffmpeg`？これはあのFFmpegですか？

**プロ**: そう！でもブラウザで動くWebAssembly版だよ。動画の変換や編集をクライアント側でできるんだ。

**初**: すごい...ブラウザで動画編集ができるんですね。

### その他のツール

**プロ**: 他にも重要なツールがあるよ：

- **date-fns**: 日付操作ライブラリ
- **axios**: HTTPクライアント
- **uuid**: ユニークIDの生成
- **recharts**: グラフ描画ライブラリ
- **sonner**: トースト通知ライブラリ
- **lucide-react**: アイコンライブラリ

---

## 第12章: 開発ツール

### Biome

**初**: `@biomejs/biome`って何ですか？

**プロ**: BiomeはESLintとPrettierの代替で、とても高速なリンター＆フォーマッターだよ！Rustで書かれてるから、従来のツールより10-100倍速いんだ。

**初**: ESLintやPrettierと何が違うんですか？

**プロ**:
- **速度**: 圧倒的に速い
- **統合**: リンターとフォーマッターが一つに
- **設定**: 最小限の設定で使える

### Husky

**初**: `husky`は？

**プロ**: Gitのフック（commit前、push前など）を簡単に設定できるツールだよ。

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

**プロ**: コミット前に自動的にリントを実行したり、テストを実行したりできるんだ。

### PostCSS & Autoprefixer

**初**: `postcss`と`autoprefixer`は？

**プロ**: PostCSSはCSSを変換するツールで、Autoprefixerはブラウザベンダープレフィックスを自動追加するプラグインだよ。

```css
/* 書いたコード */
.example {
  display: flex;
}

/* Autoprefixerが変換 */
.example {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

**初**: 古いブラウザ対応が自動でできるんですね！

---

## 第13章: AWS S3 - ファイルストレージ

**初**: `@aws-sdk/client-s3`って何ですか？

**プロ**: AWS S3（Simple Storage Service）にアクセスするためのライブラリだよ！

**初**: S3って何ですか？

**プロ**: Amazonのクラウドストレージサービスだよ。画像、動画、PDFなどのファイルを保存できるんだ。

### S3の使用例

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'ap-northeast-1' });

// 署名付きURLの生成（セキュアなアップロード）
const command = new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'videos/my-video.mp4',
  ContentType: 'video/mp4',
});

const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
// クライアントはこのURLに直接アップロードできる
```

**初**: `@aws-sdk/s3-request-presigner`は？

**プロ**: 署名付きURL（Presigned URL）を生成するためのライブラリだよ。これを使うと、クライアントがサーバーを経由せずに直接S3にファイルをアップロードできるんだ。

**初**: なぜそうするんですか？

**プロ**: サーバーの負荷を減らせるし、大きなファイルのアップロードが速くなるんだよ。

### TUS Protocol

**初**: `tus-js-client`って何ですか？

**プロ**: TUSは「再開可能なファイルアップロード」のためのプロトコルだよ！

**初**: 再開可能って？

**プロ**: 例えば、大きな動画をアップロード中にネットワークが切れても、最初からやり直さなくていいんだ。中断したところから再開できるんだよ。

---

## 第14章: アーキテクチャの全体像

**初**: 全部の技術を聞いて、頭がいっぱいです...どうやって全部つながってるんですか？

**プロ**: いい質問だね！全体のアーキテクチャを説明するよ。

### レイヤー構造

```
┌─────────────────────────────────────────┐
│          フロントエンド (クライアント)           │
├─────────────────────────────────────────┤
│ React 18 + Next.js 13                   │
│   - TypeScript                          │
│   - Tailwind CSS (スタイリング)          │
│   - Radix UI (UIコンポーネント)           │
│   - React Flow (ノードベースUI)           │
│   - Zustand (状態管理)                   │
│   - React Hook Form + Zod (フォーム)     │
│   - Framer Motion (アニメーション)        │
└─────────────────────────────────────────┘
              ↕ tRPC (型安全なAPI)
┌─────────────────────────────────────────┐
│          バックエンド (サーバー)              │
├─────────────────────────────────────────┤
│ Next.js API Routes                      │
│   - tRPC (APIルーター)                   │
│   - Supabase Auth (認証)                 │
│   - Prisma (ORM)                        │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│          データ層                         │
├─────────────────────────────────────────┤
│ PostgreSQL (Supabase)                   │
│ AWS S3 (ファイルストレージ)                │
└─────────────────────────────────────────┘
```

### データの流れ

**プロ**: 具体例で説明するね。ユーザーがフォームを作成する時の流れだよ：

1. **ユーザーがフォームビルダーで質問を追加**
   ```typescript
   // クライアント側（React）
   const addQuestion = () => {
     // Zustandでローカル状態を更新
     useFormStore.setState({ questions: [...questions, newQuestion] });
   };
   ```

2. **保存ボタンを押すと、tRPCでサーバーに送信**
   ```typescript
   // クライアント側（tRPC）
   const { mutate: saveForm } = trpc.forms.create.useMutation();

   saveForm({
     title: 'アンケート',
     questions: questions,
   });
   ```

3. **サーバー側でバリデーションとデータベース保存**
   ```typescript
   // サーバー側（tRPC + Prisma）
   export const formsRouter = router({
     create: protectedProcedure
       .input(z.object({
         title: z.string(),
         questions: z.array(questionSchema),
       }))
       .mutation(async ({ input, ctx }) => {
         // Prismaでデータベースに保存
         const form = await ctx.prisma.form.create({
           data: {
             title: input.title,
             questions: input.questions,
             userId: ctx.session.user.id,
           },
         });
         return form;
       }),
   });
   ```

4. **動画がある場合、S3にアップロード**
   ```typescript
   // 署名付きURLを生成してクライアントに返す
   const uploadUrl = await generatePresignedUrl(videoId);
   // クライアントが直接S3にアップロード
   await uploadToS3(uploadUrl, videoFile);
   ```

### 認証の流れ

**初**: 認証はどうなってるんですか？

**プロ**: Supabaseの認証とNext.jsのミドルウェアを組み合わせてるよ：

1. **ユーザーがログイン**
   ```typescript
   // Supabase Authでログイン
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password',
   });
   ```

2. **JWTトークンがクッキーに保存される**
   ```typescript
   // Supabase Auth Helpersが自動的にやってくれる
   ```

3. **tRPCのミドルウェアで認証チェック**
   ```typescript
   // src/server/api/trpc.ts
   const isAuthed = t.middleware(async ({ ctx, next }) => {
     if (!ctx.session) {
       throw new TRPCError({ code: 'UNAUTHORIZED' });
     }
     return next({
       ctx: {
         session: ctx.session,
       },
     });
   });

   export const protectedProcedure = t.procedure.use(isAuthed);
   ```

4. **認証済みユーザーのみAPIにアクセス可能**

---

## 第15章: 開発ワークフロー

**初**: 実際の開発はどんな感じなんですか？

**プロ**: package.jsonのscriptsを見てみよう：

```json
{
  "scripts": {
    "dev": "next dev",           // 開発サーバー起動
    "build": "next build",       // 本番ビルド
    "start": "next start",       // 本番サーバー起動
    "lint": "biome check --apply ./src",  // リント＆フォーマット
    "postinstall": "prisma generate",     // インストール後にPrisma生成
    "prepare": "husky"           // Gitフック設定
  }
}
```

### 典型的な開発の流れ

1. **プロジェクトのクローンとセットアップ**
   ```bash
   git clone <repository>
   pnpm install  # 依存関係のインストール
   # .env ファイルを設定
   pnpm prisma migrate dev  # データベースマイグレーション
   ```

2. **開発サーバーの起動**
   ```bash
   pnpm dev
   # http://localhost:3000 で起動
   ```

3. **コード変更**
   - TypeScriptが型エラーをリアルタイムで表示
   - Biomeが保存時に自動フォーマット
   - Hot Reloadで即座にブラウザに反映

4. **データベーススキーマの変更**
   ```bash
   # schema.prismaを編集
   pnpm prisma migrate dev --name add_new_field
   # 自動的にマイグレーションファイル生成＆適用
   ```

5. **コミット前**
   ```bash
   git add .
   git commit -m "新機能を追加"
   # Huskyが自動的にリントを実行
   # エラーがあればコミットできない
   ```

6. **本番デプロイ**
   ```bash
   pnpm build
   # Vercelなどにデプロイ
   ```

---

## 第16章: パフォーマンスと最適化

**初**: このスタック、パフォーマンスはどうなんですか？

**プロ**: とても優れてるよ！各技術がパフォーマンスを考慮して選ばれてるんだ。

### Next.js 13の最適化

1. **サーバーコンポーネント**
   - JavaScriptをクライアントに送らない
   - 初期ロードが速い

2. **Image Optimization**
   ```typescript
   import Image from 'next/image';

   <Image
     src="/hero.jpg"
     width={800}
     height={600}
     alt="Hero"
   />
   // 自動的に最適化されたフォーマット（WebP等）で配信
   ```

3. **コード分割**
   - ページごとに自動的にJavaScriptが分割される
   - 必要な部分だけロードされる

### Tailwind CSSの最適化

**プロ**: 本番ビルド時、使われていないCSSクラスが全て削除されるんだ。

```bash
# 開発時: 数MBのCSS
# 本番時: ~10KBのCSS
```

### tRPCのパフォーマンス

**プロ**: tRPCは軽量で、GraphQLみたいなオーバーヘッドがないんだ。

```typescript
// 複数のクエリを並列実行
const [user, posts, comments] = await Promise.all([
  trpc.user.getById.query({ id: '123' }),
  trpc.posts.getByUserId.query({ userId: '123' }),
  trpc.comments.getByUserId.query({ userId: '123' }),
]);
```

### Prismaのパフォーマンス

**プロ**: Prismaは効率的なSQLを生成するよ。

```typescript
// N+1問題を回避
const users = await prisma.user.findMany({
  include: {
    posts: true,  // JOINを使って一度のクエリで取得
  },
});
```

---

## 第17章: セキュリティ

**初**: セキュリティはどうやって守られてるんですか？

**プロ**: 複数のレイヤーでセキュリティ対策してるよ。

### 1. 認証とアクセス制御

```typescript
// tRPCの保護されたプロシージャ
export const protectedProcedure = t.procedure.use(isAuthed);

// 使用例
export const formsRouter = router({
  delete: protectedProcedure  // ログイン必須
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // さらに、自分のフォームかチェック
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.id },
      });

      if (form.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await ctx.prisma.form.delete({
        where: { id: input.id },
      });
    }),
});
```

### 2. 入力のバリデーション

**プロ**: Zodですべての入力を検証してるよ。

```typescript
const formSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(questionSchema).min(1).max(100),
});
```

### 3. SQL Injection対策

**プロ**: Prismaを使ってるから、SQLインジェクションの心配がないんだ。Prismaが自動的にパラメータ化クエリを使うからね。

### 4. XSS対策

**プロ**: Reactは自動的にエスケープするから、基本的にXSS（クロスサイトスクリプティング）に強いんだ。

```typescript
// 安全！Reactが自動エスケープ
<div>{userInput}</div>

// 危険！dangerouslySetInnerHTMLは使わない
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 5. CSRF対策

**プロ**: Next.jsとSupabaseのセッション管理がCSRF（クロスサイトリクエストフォージェリ）を防いでくれるよ。

### 6. 環境変数の管理

```typescript
// src/env.mjs
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_KEY: z.string().min(1),
    // 環境変数の型チェック！
  },
});
```

**初**: TypeScriptで環境変数もチェックできるんですね！

---

## 第18章: スケーラビリティ

**初**: このアプリ、ユーザーが増えても大丈夫ですか？

**プロ**: このスタックはスケーラビリティを考慮して設計されてるよ。

### 水平スケーリング

**プロ**: Next.jsはステートレスだから、複数のサーバーインスタンスを簡単に立ち上げられるんだ。

```
┌─────────┐
│ Client  │
└────┬────┘
     │
┌────▼────────┐
│ Load Balancer│
└────┬────────┘
     │
     ├────────┬────────┬────────┐
     │        │        │        │
┌────▼───┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐
│Next.js │ │Next.js│ │Next.js│ │Next.js│
└────┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
     │        │        │        │
     └────────┴────────┴────────┘
              │
         ┌────▼────┐
         │PostgreSQL│
         └─────────┘
```

### データベースのスケーリング

1. **コネクションプーリング**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")  // プーリング経由
     directUrl = env("DIRECT_URL")   // ダイレクト接続
   }
   ```

2. **読み取りレプリカ**
   - 読み取り専用のデータベースコピーを複数持つ
   - 書き込みはマスター、読み取りはレプリカに分散

3. **キャッシング**
   ```typescript
   // tRPCのキャッシング
   const { data } = trpc.forms.getAll.useQuery(
     {},
     {
       staleTime: 60000, // 1分間キャッシュ
     }
   );
   ```

### ファイルストレージのスケーリング

**プロ**: S3は自動的にスケールするから、何百万ファイルでも問題ないよ。

---

## 第19章: テストとデバッグ

**初**: テストはどうやって書くんですか？

**プロ**: このプロジェクトにはまだテストが入ってないけど、追加するならこんな感じだよ：

### ユニットテスト

```typescript
// Vitest + React Testing Library
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

test('ボタンをクリックするとカウントが増える', async () => {
  render(<Counter />);

  const button = screen.getByRole('button');
  expect(screen.getByText('0')).toBeInTheDocument();

  await userEvent.click(button);
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### E2Eテスト

```typescript
// Playwright
import { test, expect } from '@playwright/test';

test('ユーザーがフォームを作成できる', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=新しいフォームを作成');
  await page.fill('input[name="title"]', 'アンケート');
  await page.click('text=保存');

  await expect(page.locator('text=保存しました')).toBeVisible();
});
```

### デバッグツール

1. **React DevTools**
   - コンポーネントツリーの可視化
   - propsとstateの確認

2. **tRPC DevTools**
   - APIコールの追跡
   - レスポンスの確認

3. **Prisma Studio**
   ```bash
   npx prisma studio
   # データベースのGUIが起動
   ```

---

## 第20章: デプロイと運用

**初**: 本番環境へのデプロイはどうするんですか？

**プロ**: Vercelが一番簡単だよ！Next.jsを作った会社だからね。

### Vercelへのデプロイ

1. **GitHubと連携**
   - リポジトリをVercelに接続
   - mainブランチへのプッシュで自動デプロイ

2. **環境変数の設定**
   ```
   DATABASE_URL=...
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   AWS_ACCESS_KEY_ID=...
   ```

3. **ビルド設定**
   ```json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": ".next",
     "installCommand": "pnpm install"
   }
   ```

### その他のデプロイ先

**プロ**: 他にも選択肢があるよ：

- **AWS**: EC2, ECS, Lambda
- **Google Cloud**: Cloud Run, App Engine
- **Docker**: どこでもデプロイ可能

### モニタリング

```typescript
// @vercel/analytics と @vercel/speed-insights
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

---

## まとめ: なぜこのスタックなのか

**初**: たくさん学びました！でも、なぜこの組み合わせなんですか？

**プロ**: いい質問だね！このスタックの強みをまとめよう：

### 🎯 型安全性

- **TypeScript**: コンパイル時の型チェック
- **tRPC**: API全体の型安全性
- **Prisma**: データベースクエリの型安全性
- **Zod**: ランタイムバリデーション

すべてのレイヤーで型安全性が保証されてる！

### ⚡ パフォーマンス

- **Next.js 13**: サーバーコンポーネント、Turbopack
- **React 18**: 並行レンダリング
- **Tailwind CSS**: 最小限のCSS
- **Zustand**: 効率的な状態管理

### 🚀 開発体験

- **tRPC**: API定義が簡単
- **Prisma**: データベース操作が簡単
- **Radix UI**: アクセシブルなUIが簡単
- **Biome**: 高速なリント＆フォーマット

### 🔒 セキュリティ

- **Supabase Auth**: エンタープライズグレードの認証
- **JWT**: セキュアなトークン
- **Zod**: 入力バリデーション
- **Prisma**: SQLインジェクション対策

### 📈 スケーラビリティ

- **Next.js**: ステートレス、水平スケール可能
- **PostgreSQL**: エンタープライズグレードのDB
- **S3**: 無限にスケールするストレージ

### 🎨 ユーザー体験

- **React Flow**: 直感的なビジュアルエディタ
- **Radix UI**: アクセシブルなUI
- **Framer Motion**: 滑らかなアニメーション
- **Tailwind CSS**: 一貫したデザイン

**初**: すごい！全部が理由があって選ばれてるんですね。

**プロ**: その通り！このスタックは「The T3 Stack」というコンセプトに影響を受けてるんだ。Type-safe（型安全）、Fast（高速）、そしてDX（開発者体験）を重視したモダンなウェブアプリケーション開発のベストプラクティスの集大成なんだよ。

**初**: でも、こんなに技術があると覚えるのが大変そうです...

**プロ**: 大丈夫！一度に全部理解する必要はないよ。まずは：

1. **React + TypeScript**の基礎を学ぶ
2. **Next.js**でページを作ってみる
3. **Tailwind CSS**でスタイリングしてみる
4. **Prisma**でデータベースを操作してみる
5. **tRPC**でAPIを作ってみる

この順番で、一つずつマスターしていけばいいんだ。

**初**: ありがとうございます！一歩ずつ学んでいきます！

**プロ**: がんばって！質問があればいつでも聞いてね。

---

## 付録A: 学習リソース

### 公式ドキュメント

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- tRPC: https://trpc.io/docs
- Prisma: https://www.prisma.io/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Radix UI: https://www.radix-ui.com/docs
- Zustand: https://zustand.docs.pmnd.rs

### 推奨コース

- **Next.js**: Next.js公式チュートリアル
- **TypeScript**: TypeScript公式ハンドブック
- **Prisma**: Prisma入門ガイド（15分）
- **tRPC**: tRPCクイックスタート

### コミュニティ

- Discord: Next.js、tRPC、Prismaそれぞれにコミュニティがある
- GitHub Discussions: 各プロジェクトのリポジトリ
- Stack Overflow: 技術的な質問

---

## 付録B: プロジェクト構造

```
FormOnce/
├── prisma/
│   └── schema.prisma          # Prismaスキーマ
├── public/                    # 静的ファイル
├── src/
│   ├── components/           # Reactコンポーネント
│   │   ├── form-builder/
│   │   │   ├── flow-builder/ # React Flow関連
│   │   │   └── ...
│   │   └── ui/               # Radix UIラッパー
│   ├── layouts/              # レイアウトコンポーネント
│   ├── lib/                  # ユーティリティ
│   ├── pages/                # Next.jsページ
│   │   ├── api/              # APIルート
│   │   └── dashboard/        # ダッシュボードページ
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/      # tRPCルーター
│   │   │   └── trpc.ts       # tRPC設定
│   │   └── auth-supabase.ts  # Supabase認証
│   ├── types/                # TypeScript型定義
│   ├── utils/                # ヘルパー関数
│   └── env.mjs               # 環境変数検証
├── .env                      # 環境変数（ローカル）
├── next.config.mjs           # Next.js設定
├── tailwind.config.ts        # Tailwind設定
├── tsconfig.json             # TypeScript設定
└── package.json              # 依存関係
```

---

**FormOnce技術スタック解説ガイド 完**

このガイドが、プロジェクトの技術スタックを理解する助けになれば幸いです！