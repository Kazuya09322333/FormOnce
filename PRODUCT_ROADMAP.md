# FormOnce プロダクトロードマップ

FormOnceは、**VideoAsk**のような動画ベースの分岐型フォームシステムです。ユーザーは動画を含むインタラクティブなフォームを作成し、回答者の選択に応じて異なる動画を表示する流れるような体験を提供できます。

---

## 🎯 コアコンセプト

**「動画で質問、分岐で導く」**

- 各質問に動画を添付
- 回答によって次に表示される質問が分岐
- 流れるような会話体験を実現
- URLを発行して簡単に共有

---

## ✅ MVP完了 + プレビュー機能

### 1. 動画アップロード・保存機能 ✅
- **Supabase Storage**を使用した動画保存
- **Videoテーブル**でメタデータ管理
  - `id`: 動画ID
  - `title`: 動画タイトル
  - `filePath`: Supabaseストレージパス
  - `url`: 公開URL
  - `userId`: アップロードしたユーザー
  - `status`: PROCESSING / READY / FAILED
- 対応形式: MP4, MOV, AVI, WebM
- 最大ファイルサイズ: 500MB

**実装ファイル:**
- `src/server/api/routers/video/router.ts` - アップロードAPI
- `src/components/form-builder/flow-builder/VideoUploadDialog.tsx` - UIコンポーネント
- `prisma/schema.prisma` - Videoモデル定義

### 2. フォームビルダー（Flow Builder） ✅
- **ReactFlow**ベースのビジュアルエディター
- ノードベースの質問作成
- ドラッグ&ドロップでフロー構築
- リアルタイムプレビュー

**実装ファイル:**
- `src/components/form-builder/flow-builder/` - Flow Builder関連コンポーネント
- `src/components/form-builder/flow-builder/QuestionNode.tsx` - 質問ノード
- `src/components/form-builder/flow-builder/edit-question.tsx` - 質問編集UI

### 3. 質問タイプ ✅
- **テキスト入力**
  - 短文（short）
  - 長文（long）
  - メール（email）
  - 数値（number）
  - URL（url）
  - 電話番号（phone）
  - パスワード（password）
- **選択式**
  - 単一選択（single）
  - 複数選択（multiple）

**実装ファイル:**
- `src/types/question.types.ts` - 質問型定義
- `src/components/form-builder/input-renderer.tsx` - 入力UI

### 4. 分岐ロジック（Logic） ✅
各質問に条件付き分岐を設定可能:
- `ALWAYS` - 常に次の質問へ
- `IS` - 値が一致する場合
- `IS_NOT` - 値が一致しない場合
- `CONTAINS` - 値を含む場合
- `DOES_NOT_CONTAIN` - 値を含まない場合
- `IS_GREATER_THAN` - 値が大きい場合
- `IS_LESS_THAN` - 値が小さい場合
- `IS_ONE_OF` - いずれかの値と一致する場合（**最も使用される機能**）

**リアルタイム分岐実行:**
- 選択肢クリック → 300ms後に自動的に次の質問へ
- ロジック条件を評価して適切な質問へ分岐
- VideoAskと同様の流れるような体験

**実装ファイル:**
- `src/types/question.types.ts` - Logic型定義（`TLogic`, `ELogicCondition`）
- `src/utils/forms/evaluateLogic.ts` - ロジック評価エンジン
- `src/components/form-builder/videoask-renderer.tsx` - 分岐実行
- Flow Builderの各質問ノードに設定可能

### 5. フォーム公開とURL発行 ✅
- フォームを**DRAFT（下書き）**または**PUBLISHED（公開）**状態に設定
- 公開時に一意のリンクを自動生成
- URLをコピーして共有可能
- **iframe埋め込み機能** ✅
  - 埋め込みコードの自動生成
  - タブ切り替えUI（リンク/埋め込み）
  - X-Frame-Optionsヘッダー設定済み
  - どのWebサイトにも埋め込み可能

**実装ファイル:**
- `src/pages/dashboard/forms/[id]/index.tsx:196-219` - 公開/非公開切り替え
- `src/components/form-builder/share-dialog.tsx` - シェアダイアログ（iframe埋め込み対応）
- `next.config.mjs` - iframe埋め込み許可設定
- `prisma/schema.prisma` - Form.status, Form.link

### 6. フォーム回答機能 ✅
- 回答者が公開URLからフォームにアクセス
- 動画を視聴しながら質問に回答
- 回答データをデータベースに保存
- 分岐ロジックに基づいて次の質問を表示

**実装ファイル:**
- `src/components/form-builder/input-renderer.tsx` - 回答入力UI（動画表示含む）
- `prisma/schema.prisma` - FormResponse, FormViews

### 7. 認証システム ✅
- **Supabase Auth**による認証
- メール/パスワード認証
- GitHubソーシャルログイン（オプション）

**実装ファイル:**
- `src/server/auth-supabase.ts` - Supabase認証
- `src/pages/api/auth/callback.ts` - 認証コールバック

### 8. ワークスペース管理 ✅
- 個人ワークスペース（isPersonal: true）
- チームワークスペース
- 役割管理: OWNER / ADMIN / MEMBER

**実装ファイル:**
- `prisma/schema.prisma` - Workspace, WorkspaceMember
- `src/server/api/routers/workspace.ts` - ワークスペースAPI

### 9. データベース構造 ✅
- **User**: ユーザー情報
- **Form**: フォーム本体（questions: Json[]）
- **FormResponse**: 回答データ
- **FormViews**: フォームビュー数（IP、User-Agent記録）
- **Video**: 動画メタデータ
- **Workspace**: ワークスペース
- **Webhook**: Webhook設定
- **ApiKey**: API認証

### 10. フォームプレビュー機能 ✅
- **プレビューボタン** - フォームビルダーから新規タブで開く
- **デスクトップ/モバイル表示切り替え** - デバイス別の表示確認
- **プレビューモード** - 回答データは保存されない
- **分岐ロジックのテスト** - 実際の動作確認が可能
- **プレビューバー** - 「プレビューモード」表示で誤解を防止

**実装ファイル:**
- `src/pages/dashboard/forms/[id]/preview.tsx` - プレビューページ
- `src/pages/dashboard/forms/[id]/index.tsx` - プレビューボタン追加

---

## 🚀 MVP完了後の追加機能

### Phase 1: UX改善（優先度: 高）

#### 1.1 進捗トラッキング
- [ ] 質問ごとの完了状態チェックリスト
  - タイトル設定済み ✅
  - 説明設定済み ✅
  - 動画追加済み ✅
  - ロジック設定済み ✅
- [ ] フォーム全体の進捗率表示（例: 75% 完了）
- [ ] QuestionNodeに視覚的フィードバック（色分け、バッジ）
- [ ] サイドバーのタスクリスト表示

#### 1.2 UI日本語化の完全対応
- [ ] QuestionNodeツールバーの日本語化
  - "Video" → "動画"
  - "Answer" → "回答"
  - "Logic" → "ロジック"
  - "Duplicate" → "複製"
  - "Delete" → "削除"
- [ ] エラーメッセージの日本語化
- [ ] バリデーションメッセージの日本語化

#### 1.3 フォームプレビュー機能
- [ ] 公開前にフォームをプレビュー
- [ ] 分岐ロジックのテスト実行
- [ ] モバイル/デスクトップ表示切り替え

#### 1.4 アナリティクス
- [ ] フォーム閲覧数
- [ ] 回答完了率
- [ ] 各質問の離脱率
- [ ] 動画再生率
- [ ] 平均回答時間

### Phase 2: 動画機能の強化（優先度: 高）

#### 2.1 直接録画機能 🎥
**ユーザーが画面録画とカメラ撮影を直接フォームに追加できる**

- [ ] ブラウザ内カメラ録画
  - MediaRecorder API使用
  - 録画開始/停止/プレビュー
  - リテイク機能
- [ ] 画面録画（Screen Recording）
  - `navigator.mediaDevices.getDisplayMedia()`使用
  - 画面全体/ウィンドウ/タブの選択
  - カメラと画面の同時録画（PIP）
- [ ] 録画後の簡易編集
  - トリミング（開始/終了位置調整）
  - 不要部分のカット
- [ ] リアルタイムアップロード
  - 録画完了後即座にSupabaseへアップロード
  - プログレスバー表示

**参考技術スタック:**
- `react-media-recorder` or `recordrtc`
- `MediaRecorder API`
- `getUserMedia()` / `getDisplayMedia()`

**実装予定ファイル:**
- `src/components/form-builder/flow-builder/VideoRecordDialog.tsx` - 録画UI
- `src/hooks/useMediaRecorder.ts` - 録画ロジック

#### 2.2 動画配信の最適化
- [ ] **Bunny CDN統合** - 高速配信
- [ ] HLS/DASH形式への自動トランスコーディング
- [ ] 動画サムネイル自動生成
- [ ] 適応ビットレート配信（ABR）
- [ ] 動画の自動圧縮

#### 2.3 動画エンゲージメント
- [ ] 動画視聴の進捗トラッキング
- [ ] 動画を最後まで見ないと次に進めない設定
- [ ] 動画内に字幕追加
- [ ] チャプター機能（複数の動画セグメント）

### Phase 3: 決済機能（優先度: 中）

#### 3.1 Stripe統合 💳
**フォーム内で決済を完了できる機能**

- [ ] Stripe Checkout統合
- [ ] 質問タイプに「Payment（支払い）」を追加
- [ ] 金額設定（固定額 or 回答者入力）
- [ ] 決済完了後に次の質問へ分岐
- [ ] 支払い履歴の管理
- [ ] サブスクリプション対応（月額/年額）
- [ ] クーポン/割引コード

**実装予定:**
- `src/types/question.types.ts` - `EQuestionType.Payment`追加
- `src/components/form-builder/payment-input.tsx` - 決済UI
- `src/server/api/routers/payment/router.ts` - Stripe API連携

#### 3.2 収益ダッシュボード
- [ ] 売上サマリー（日/週/月）
- [ ] トランザクション一覧
- [ ] 返金処理
- [ ] CSV/PDFエクスポート

### Phase 4: 高度な機能（優先度: 中）

#### 4.1 条件付きロジックの強化
- [ ] AND/OR条件の組み合わせ
- [ ] 複数質問の回答を参照
- [ ] 計算フィールド（例: 合計金額）
- [ ] 日付比較（例: 今日より前/後）

#### 4.2 統合機能
- [ ] **HubSpot連携** 🔥
  - フォーム回答をHubSpotコンタクトとして自動登録
  - カスタムプロパティへのマッピング
  - ディール・チケットの自動作成
  - HubSpot CRMワークフロー連携
  - リード情報の双方向同期
- [ ] Webhook強化
  - リトライ機能
  - Webhook履歴のフィルタリング
  - カスタムヘッダー
- [ ] Salesforce連携
- [ ] Zapier統合
- [ ] Slack通知
- [ ] Google Sheets連携
- [ ] メール自動送信（SendGrid/Resend）

#### 4.3 チーム機能
- [ ] フォームの共同編集
- [ ] コメント機能
- [ ] バージョン履歴
- [ ] テンプレート共有

#### 4.4 カスタマイズ
- [ ] カスタムドメイン
- [ ] ブランディング（ロゴ、カラー）
- [ ] カスタムCSS
- [ ] ホワイトラベル

### Phase 5: セキュリティ・コンプライアンス（優先度: 低）

- [ ] GDPR対応
- [ ] データエクスポート機能
- [ ] データ削除リクエスト
- [ ] 2FA（二要素認証）
- [ ] IPアドレス制限
- [ ] CAPTCHA統合

---

## 📊 現在の実装状況

| カテゴリ | 機能 | 状態 |
|---------|-----|-----|
| 認証 | Supabase Auth | ✅ MVP完了 |
| フォームビルダー | Flow Builder | ✅ MVP完了 |
| 質問タイプ | Text, Select | ✅ MVP完了 |
| 分岐ロジック | 8種類の条件 | ✅ MVP完了 |
| 動画 | アップロード・保存 | ✅ MVP完了 |
| 動画 | 自動再生 | ✅ MVP完了 |
| UI/UX | VideoAsk風フルスクリーン | ✅ MVP完了 |
| 動画 | 直接録画 | ⏳ Phase 2 |
| 動画 | CDN配信 | ⏳ Phase 2 |
| URL発行 | 公開リンク | ✅ MVP完了 |
| iframe埋め込み | Webサイト埋め込み | ✅ MVP完了 |
| 回答機能 | フォーム回答 | ✅ MVP完了 |
| 決済 | Stripe統合 | ⏳ Phase 3 |
| 進捗管理 | チェックリスト | ⏳ Phase 1 |
| アナリティクス | 基本統計 | ⏳ Phase 1 |

---

## 🎨 参考: VideoAskとの比較

| 機能 | VideoAsk | FormOnce |
|-----|----------|----------|
| 動画アップロード | ✅ | ✅ |
| 直接録画 | ✅ | ⏳ Phase 2 |
| 分岐ロジック | ✅ | ✅ |
| 決済統合 | ✅ | ⏳ Phase 3 |
| アナリティクス | ✅ | ⏳ Phase 1 |
| API/Webhook | ✅ | ✅ |
| カスタムブランディング | ✅ 有料 | ⏳ Phase 4 |
| 日本語対応 | ❌ | ✅ |

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 13** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **ReactFlow** - フローチャートUI
- **React Hook Form** - フォーム管理
- **Zod** - バリデーション

### バックエンド
- **tRPC** - 型安全API
- **Prisma** - ORM
- **PostgreSQL** - データベース
- **Supabase Auth** - 認証
- **Supabase Storage** - 動画保存

### 将来的な追加
- **Stripe** - 決済
- **Bunny CDN** - 動画配信
- **MediaRecorder API** - ブラウザ録画
- **SendGrid/Resend** - メール送信

---

## 🎯 MVP必須機能（確認済み）

以下の機能は**MVP段階で必ず実現する**必要があります：

### ✅ 既に実装済み
1. **URL発行** - フォーム作成後に公開URLを生成 ✅
2. **iframe埋め込み** - Webサイトにフォームを埋め込み可能 ✅
3. **動画付きフォーム** - 各質問に動画を添付可能 ✅
4. **分岐ロジック** - 回答に応じて次の質問を分岐 ✅
5. **フローダッシュボード** - ビジュアルなフォーム作成UI ✅

### ✅ MVP完了！
1. **分岐時の動画自動再生** ✅
   - 質問遷移時に動画が自動再生
   - 動画終了後に回答フォームが表示
   - スキップボタンで動画をスキップ可能
2. **VideoAsk風のUI/UX** ✅
   - フルスクリーン動画表示
   - スムーズなトランジション効果
   - 回答ボタンのオーバーレイ表示
   - 進捗インジケーター
   - 美しいグラデーション背景
   - 単一選択時の自動遷移
   - アニメーション付き送信完了画面

**実装ファイル:**
- `src/components/form-builder/videoask-renderer.tsx` - VideoAsk風フルスクリーンレンダラー
- `src/components/form-builder/videoask-input.tsx` - オーバーレイ入力UI
- `src/components/form-builder/liveForm.tsx` - VideoAskレンダラー統合
- `src/layouts/formLayout.tsx` - フルスクリーンレイアウト対応

**参考**: VideoAsk - https://www.videoask.com/

---

## 📝 次のステップ

### 🎉 MVP完了！次の展開

**MVP（Minimum Viable Product）が完成しました！**

FormOnceの核心機能がすべて実装されました：
- ✅ 動画付き分岐型フォーム
- ✅ VideoAsk風フルスクリーンUI
- ✅ 自動再生・スムーズな遷移
- ✅ iframe埋め込み
- ✅ URL発行・共有

### Post-MVP タスク（優先度順）

#### 最優先（ユーザー獲得フェーズ）
1. [✅] フォームプレビュー機能 - 公開前の確認
   - プレビューボタン追加
   - デスクトップ/モバイル表示切り替え
   - 回答データは保存されない
   - 分岐ロジックのテスト可能
2. [ ] 基本アナリティクス - 閲覧数・完了率
3. [ ] メール通知 - 回答時の通知

### 短期目標（1ヶ月）
1. [ ] 直接録画機能の実装
2. [ ] 基本アナリティクス
3. [ ] Webhook強化

### 中期目標（3ヶ月）
1. [ ] Stripe決済統合
2. [ ] Bunny CDN導入
3. [ ] チーム機能

---

## 📚 参考リンク

- **VideoAsk**: https://www.videoask.com/
- **Supabase Docs**: https://supabase.com/docs
- **ReactFlow Docs**: https://reactflow.dev/
- **Stripe Docs**: https://stripe.com/docs
- **MediaRecorder API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

---

**最終更新**: 2025-11-07
