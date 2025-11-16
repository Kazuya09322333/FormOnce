# HubSpot連携実装計画

FormOnceとHubSpot CRMを連携し、フォーム回答を自動的にHubSpotへ送信する機能の実装計画です。

---

## 🎯 概要

フォームの回答データをHubSpotに自動送信し、マーケティングオートメーションとCRM管理を効率化します。

### ユースケース

1. **リード獲得**: フォーム回答者を自動的にHubSpotコンタクトとして登録
2. **営業パイプライン**: 回答内容に応じてディールを自動作成
3. **カスタマーサポート**: チケットを自動作成してサポート対応
4. **マーケティング自動化**: HubSpotワークフローをトリガー

---

## 📋 実装機能

### Phase 1: 基本連携（優先度: 高）

#### 1.1 HubSpot認証
- [ ] OAuth 2.0フロー実装
- [ ] アクセストークン・リフレッシュトークン管理
- [ ] ワークスペースごとのHubSpot接続設定

#### 1.2 コンタクト自動作成
- [ ] フォーム回答時にHubSpotコンタクトを作成
- [ ] 既存コンタクトの更新（メールアドレスでマッチング）
- [ ] 標準プロパティへのマッピング:
  - Email
  - First Name / Last Name
  - Phone Number
  - Company
  - Website

#### 1.3 フィールドマッピング設定
- [ ] FormOnceの質問 ⇄ HubSpotプロパティのマッピングUI
- [ ] カスタムプロパティへのマッピング
- [ ] デフォルトマッピングの自動設定
- [ ] マッピングプレビュー機能

#### 1.4 エラーハンドリング
- [ ] API失敗時のリトライ機能
- [ ] エラーログの記録
- [ ] 管理者への通知

### Phase 2: 高度な連携（優先度: 中）

#### 2.1 ディール自動作成
- [ ] 回答内容に応じたディール作成
- [ ] パイプライン・ステージの自動設定
- [ ] ディール金額の自動計算
- [ ] 担当者の自動アサイン

#### 2.2 チケット自動作成
- [ ] サポートフォームからチケット作成
- [ ] 優先度の自動設定
- [ ] カテゴリ・タグの自動付与

#### 2.3 双方向同期
- [ ] HubSpotのコンタクト情報をFormOnceへ取得
- [ ] フォームの事前入力（既存コンタクトの場合）
- [ ] リアルタイム同期

#### 2.4 ワークフロー連携
- [ ] HubSpotワークフローのトリガー
- [ ] カスタムイベントの送信
- [ ] スコアリング連携

### Phase 3: 分析・最適化（優先度: 低）

#### 3.1 同期ダッシュボード
- [ ] 同期成功・失敗の統計
- [ ] 同期履歴の表示
- [ ] エラーログの確認

#### 3.2 高度なマッピング
- [ ] 条件付きマッピング
- [ ] 計算フィールド
- [ ] 複数値の連結

---

## 🏗️ アーキテクチャ

### データフロー

```
FormOnce                    HubSpot CRM
---------                   -----------

フォーム回答
    ↓
回答データ保存
    ↓
HubSpot連携チェック
    ↓
フィールドマッピング適用
    ↓
HubSpot API呼び出し ----→  コンタクト作成/更新
    ↓                        ↓
成功/失敗ログ記録    ←----  レスポンス
    ↓
管理画面で確認可能
```

### API連携

**HubSpot API v3使用:**
- Contacts API: `/crm/v3/objects/contacts`
- Deals API: `/crm/v3/objects/deals`
- Tickets API: `/crm/v3/objects/tickets`
- Properties API: `/crm/v3/properties/contacts`

---

## 🗄️ データベース設計

### 新規テーブル

#### HubSpotIntegration
```prisma
model HubSpotIntegration {
  id                String   @id @default(uuid())
  workspaceId       String   @unique
  accessToken       String   // 暗号化
  refreshToken      String   // 暗号化
  expiresAt         DateTime
  portalId          String   // HubSpot Portal ID
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  workspace         Workspace @relation(fields: [workspaceId], references: [id])
  formMappings      HubSpotFormMapping[]
}
```

#### HubSpotFormMapping
```prisma
model HubSpotFormMapping {
  id              String   @id @default(uuid())
  formId          String
  integrationId   String
  isEnabled       Boolean  @default(true)
  mappings        Json     // { "questionId": "hubspotProperty" }
  createDeal      Boolean  @default(false)
  dealPipeline    String?
  dealStage       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  form            Form @relation(fields: [formId], references: [id])
  integration     HubSpotIntegration @relation(fields: [integrationId], references: [id])
}
```

#### HubSpotSyncLog
```prisma
model HubSpotSyncLog {
  id              String   @id @default(uuid())
  formResponseId  String
  integrationId   String
  status          SyncStatus // SUCCESS, FAILED, PENDING
  hubspotObjectId String?  // Contact/Deal/Ticket ID
  errorMessage    String?
  requestPayload  Json
  responsePayload Json?
  createdAt       DateTime @default(now())

  formResponse    FormResponse @relation(fields: [formResponseId], references: [id])
}

enum SyncStatus {
  SUCCESS
  FAILED
  PENDING
  RETRYING
}
```

---

## 🎨 UI/UX設計

### 1. HubSpot接続画面

**場所**: `/dashboard/workspace/[id]/integrations/hubspot`

```
┌─────────────────────────────────────────┐
│  HubSpot連携                            │
├─────────────────────────────────────────┤
│                                         │
│  [✓] 接続済み                           │
│  Portal ID: 12345678                    │
│  接続日: 2025-11-07                     │
│                                         │
│  [接続を解除]  [設定を更新]             │
│                                         │
└─────────────────────────────────────────┘
```

### 2. フィールドマッピング画面

**場所**: `/dashboard/forms/[id]/integrations/hubspot`

```
┌─────────────────────────────────────────┐
│  フォーム: お問い合わせフォーム         │
│  HubSpot連携設定                        │
├─────────────────────────────────────────┤
│                                         │
│  [✓] このフォームでHubSpot連携を有効化  │
│                                         │
│  フィールドマッピング                   │
│  ┌─────────────────┬─────────────────┐ │
│  │ FormOnce質問    │ HubSpotプロパティ│ │
│  ├─────────────────┼─────────────────┤ │
│  │ メールアドレス  │ [email]  ▼      │ │
│  │ お名前          │ [firstname] ▼   │ │
│  │ 会社名          │ [company]   ▼   │ │
│  │ 電話番号        │ [phone]     ▼   │ │
│  └─────────────────┴─────────────────┘ │
│                                         │
│  追加設定                               │
│  [ ] ディールも作成する                 │
│      パイプライン: [Sales] ▼            │
│      ステージ: [Qualified] ▼            │
│                                         │
│  [保存]  [キャンセル]                   │
│                                         │
└─────────────────────────────────────────┘
```

### 3. 同期ログ画面

**場所**: `/dashboard/forms/[id]/integrations/hubspot/logs`

```
┌─────────────────────────────────────────────┐
│  HubSpot同期ログ                            │
├─────────────────────────────────────────────┤
│                                             │
│  フィルター: [すべて ▼] [日付 ▼]           │
│                                             │
│  ┌────┬──────┬────────┬──────┬──────────┐ │
│  │状態│日時  │回答者  │操作  │詳細      │ │
│  ├────┼──────┼────────┼──────┼──────────┤ │
│  │ ✓  │11/07 │田中太郎│コンタ│[詳細]    │ │
│  │    │10:30 │        │クト  │          │ │
│  ├────┼──────┼────────┼──────┼──────────┤ │
│  │ ✓  │11/07 │佐藤花子│コンタ│[詳細]    │ │
│  │    │10:25 │        │クト  │          │ │
│  ├────┼──────┼────────┼──────┼──────────┤ │
│  │ ✗  │11/07 │鈴木一郎│エラー│[リトライ] │ │
│  │    │10:20 │        │      │          │ │
│  └────┴──────┴────────┴──────┴──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔧 実装手順

### Step 1: HubSpot OAuth設定

1. HubSpot Developer Account作成
2. アプリ登録
3. OAuth Redirect URI設定
4. Client ID / Client Secret取得

### Step 2: データベースマイグレーション

```bash
# Prismaスキーマに追加
npx prisma migrate dev --name add_hubspot_integration
```

### Step 3: API実装

**ファイル構成:**
```
src/server/api/routers/hubspot/
├── router.ts              # メインルーター
├── auth.ts                # OAuth認証
├── contacts.ts            # コンタクト操作
├── deals.ts               # ディール操作
├── mapping.ts             # フィールドマッピング
└── sync.ts                # 同期処理
```

### Step 4: UI実装

**ファイル構成:**
```
src/pages/dashboard/workspace/[id]/integrations/
└── hubspot.tsx            # HubSpot接続画面

src/pages/dashboard/forms/[id]/integrations/
└── hubspot.tsx            # フィールドマッピング画面

src/components/integrations/hubspot/
├── ConnectionStatus.tsx   # 接続状態表示
├── FieldMapping.tsx       # マッピングUI
├── SyncLog.tsx            # 同期ログ
└── OAuthCallback.tsx      # OAuth コールバック
```

---

## 🔐 セキュリティ

### トークン管理

- アクセストークン・リフレッシュトークンを暗号化して保存
- 環境変数で暗号化キーを管理
- トークン有効期限の自動チェック・更新

### データ保護

- HubSpot APIキーは環境変数に保存
- トークンはデータベースで暗号化
- HTTPS通信のみ

---

## 📊 KPI・メトリクス

### 測定指標

- HubSpot連携有効化率
- 同期成功率
- 平均同期時間
- エラー発生率
- リトライ成功率

---

## 🧪 テスト計画

### 単体テスト
- [ ] OAuth認証フロー
- [ ] コンタクト作成API
- [ ] フィールドマッピングロジック
- [ ] エラーハンドリング

### 統合テスト
- [ ] フォーム回答 → HubSpot同期
- [ ] トークン更新フロー
- [ ] リトライ機能

### E2Eテスト
- [ ] 実際のHubSpotアカウントで動作確認
- [ ] 異常系のテスト

---

## 📚 参考資料

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot OAuth Guide](https://developers.hubspot.com/docs/api/working-with-oauth)
- [Contacts API v3](https://developers.hubspot.com/docs/api/crm/contacts)
- [Deals API v3](https://developers.hubspot.com/docs/api/crm/deals)

---

## 🎯 優先順位

### 最優先（Phase 1 - 基本連携）
1. OAuth認証
2. コンタクト自動作成
3. 基本的なフィールドマッピング

### 次期実装（Phase 2）
1. ディール自動作成
2. 高度なマッピング機能
3. 同期ログダッシュボード

### 将来実装（Phase 3）
1. 双方向同期
2. ワークフロー連携
3. 分析機能

---

## 💰 ビジネス価値

### メリット

1. **業務効率化**: 手動でのデータ入力が不要
2. **リード管理**: 自動的にHubSpotでリード管理開始
3. **営業支援**: 即座に営業チームへ情報共有
4. **マーケティング**: ワークフロー自動化で育成開始
5. **ROI向上**: 迅速なフォローアップで成約率アップ

### 競合優位性

VideoAskはHubSpot連携がありますが、FormOnceは：
- ✅ **日本語完全対応**
- ✅ **Flow Builder**での視覚的フロー構築
- ✅ より柔軟なフィールドマッピング

---

**実装開始時期**: MVP完了後、Phase 4の優先タスクとして実装予定
