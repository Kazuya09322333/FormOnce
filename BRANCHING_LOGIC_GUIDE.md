# FormOnce 分岐ロジックガイド

FormOnceの**最も使用される機能**である分岐ロジックの使い方を解説します。

---

## 🎯 分岐ロジックとは？

回答者の選択に応じて、次に表示される質問を動的に変更する機能です。

VideoAskでも最も使われている機能で、以下のような使い方ができます：

### 例: 商品選択フォーム
```
質問1: 「どの商品に興味がありますか？」
  A. スニーカー → 質問2（スニーカーの詳細）へ
  B. サンダル → 質問3（サンダルの詳細）へ
  C. ブーツ → 質問4（ブーツの詳細）へ
```

### 例: カスタマーサポート
```
質問1: 「お困りの内容は？」
  A. 配送について → 質問5（配送問い合わせ）へ
  B. 返品について → 質問6（返品手続き）へ
  C. その他 → 質問7（フリー入力）へ
```

---

## ✅ 実装済み機能

### 1. **選択肢クリックで自動分岐**
- 選択肢をクリック → 300ms後に自動的に次の質問へ
- ロジック条件を評価して適切な質問へジャンプ
- 「次へ」ボタンを押す必要なし

### 2. **8種類の条件**

#### 基本条件
- **ALWAYS** - 常に指定した質問へ
- **IS** - 値が一致する場合
- **IS_NOT** - 値が一致しない場合

#### テキスト条件
- **CONTAINS** - 値を含む場合
- **DOES_NOT_CONTAIN** - 値を含まない場合

#### 数値条件
- **IS_GREATER_THAN** - 値が大きい場合
- **IS_LESS_THAN** - 値が小さい場合

#### 複数値条件（最も使用される）
- **IS_ONE_OF** - いずれかの値と一致する場合

---

## 🛠️ 使い方

### ステップ1: Flow Builderで質問を作成

1. ダッシュボードからフォームを開く
2. Flow Builderで質問ノードを追加
3. 質問タイプを「選択式」に設定
4. 選択肢を追加（例: A. スニーカー、B. サンダル）

### ステップ2: ロジックを設定

1. 質問ノードをホバー
2. 上部ツールバーの「**Logic**」ボタンをクリック
3. 条件を選択（例: IS_ONE_OF）
4. 対象の選択肢を選択（例: スニーカー）
5. 「**Continue**」をクリック

### ステップ3: 分岐先を接続

1. 質問ノードの右側ハンドルをドラッグ
2. 分岐先の質問ノードに接続
3. これで選択肢に応じた分岐が完成！

---

## 💡 実装の詳細

### ロジック評価エンジン

**ファイル**: `src/utils/forms/evaluateLogic.ts`

```typescript
export function evaluateLogic(
  currentQuestion: TQuestion,
  answer: string | string[],
  allQuestions: TQuestion[]
): string | null
```

- 現在の質問のロジックルールを順番に評価
- 最初にマッチした条件の`skipTo`を返す
- マッチしない場合は`null`（次の質問へ）

### 実行フロー

1. ユーザーが選択肢をクリック
2. `handleCheckboxChange()`で値を更新
3. 300ms後に`onNext()`を呼び出し
4. `handleNext()`内で`getNextQuestionIndex()`を実行
5. ロジック評価して次の質問インデックスを取得
6. `setQuestionIdx(nextIndex)`で質問を切り替え
7. 動画が自動再生される

---

## 📋 条件タイプの使い分け

### IS_ONE_OF（最も使用される）

**使用例**: 複数の選択肢に対して同じ分岐先を設定

```
質問: 「どのカテゴリーに興味がありますか？」
選択肢:
  A. メンズシューズ
  B. レディースシューズ
  C. キッズシューズ

ロジック:
  IF [A, B] IS_ONE_OF → 質問2（大人向け質問）
  IF [C] IS_ONE_OF → 質問3（子供向け質問）
```

### ALWAYS

**使用例**: 特定の質問の後は必ず同じ質問へ

```
質問: 「メールアドレスを入力してください」

ロジック:
  ALWAYS → 質問10（送信完了画面）
```

### IS

**使用例**: 特定の回答に対して分岐

```
質問: 「年齢を入力してください」

ロジック:
  IS "18歳以上" → 質問5（成人向け質問）
  IS "18歳未満" → 質問6（未成年向け質問）
```

### CONTAINS

**使用例**: テキスト入力で特定のキーワードを含む場合

```
質問: 「お困りの内容を入力してください」

ロジック:
  CONTAINS "配送" → 質問7（配送関連質問）
  CONTAINS "返品" → 質問8（返品関連質問）
```

---

## 🎨 VideoAsk風の体験

### 自動遷移のタイミング

単一選択の場合、選択後**300ms**で自動的に次の質問へ遷移します。

```typescript
// src/components/form-builder/videoask-input.tsx
if (mode === ESelectSubType.Single) {
  const newValue = checked ? [item] : []
  field.onChange(newValue)
  // Auto-advance on single selection after a short delay
  if (checked) {
    setTimeout(() => {
      onNext() // ← ここで分岐ロジックが実行される
    }, 300)
  }
}
```

この300msの遅延により、ユーザーは自分の選択を確認できます。

### 複数選択の場合

複数選択の場合は、ユーザーが「次へ」ボタンを押すまで待機します。

---

## 🧪 テスト方法

### プレビュー機能でテスト

1. フォームビルダーで「**👁️ プレビュー**」をクリック
2. 選択肢をクリックして分岐動作を確認
3. デスクトップ/モバイル表示を切り替えてテスト
4. 回答データは保存されないので安心

### 実際の動作確認

1. フォームを**公開**
2. 公開URLにアクセス
3. 実際のユーザー体験で確認

---

## 📊 ロジック条件の評価順序

複数のロジックルールがある場合、**上から順番に評価**されます。

```typescript
// 例: 質問に3つのロジックルール
question.logic = [
  { condition: 'IS_ONE_OF', value: ['A', 'B'], skipTo: 'q2' },
  { condition: 'IS', value: 'C', skipTo: 'q3' },
  { condition: 'ALWAYS', skipTo: 'q4' },
]
```

評価順序：
1. 回答が'A'または'B' → 質問2へ
2. 回答が'C' → 質問3へ
3. それ以外 → 質問4へ

**重要**: 最初にマッチした条件で評価が終了します。

---

## 🚀 応用例

### 1. マルチレベル診断フォーム

```
質問1: 「肌の悩みは？」
  A. 乾燥 → 質問2（乾燥肌向け）
  B. オイリー → 質問3（オイリー肌向け）

質問2: 「乾燥の程度は？」
  A. 軽度 → 質問4（軽度ケア）
  B. 重度 → 質問5（重度ケア）

質問3: 「オイリーの程度は？」
  ...
```

### 2. 条件付き質問スキップ

```
質問1: 「学生ですか？」
  A. はい → 質問2（学生割引案内）
  B. いいえ → 質問5（通常価格案内）※質問2-4をスキップ
```

### 3. エラーハンドリング

```
質問1: 「メールアドレスを入力」

ロジック:
  CONTAINS "@" → 質問2（次へ）
  ALWAYS → 質問1（再入力を促す）
```

---

## 🔧 技術詳細

### データ構造

```typescript
// 質問の型定義
type TQuestion = {
  id: string
  title: string
  type: 'text' | 'select'
  options?: string[] // 選択式の場合
  logic?: TLogic[] // ロジックルール
  // ...
}

// ロジックの型定義
type TLogic = {
  questionId: string // この質問のID
  condition: ELogicCondition // 条件タイプ
  value: string | string[] // 条件の値
  skipTo: string // 分岐先の質問ID
}
```

### ロジック評価のコードフロー

```typescript
// 1. ユーザーの回答を取得
const currentAnswer = form.getValues()[currentQuestion.id]

// 2. 次の質問インデックスを計算
const nextIndex = getNextQuestionIndex(
  currentIndex,
  currentQuestion,
  currentAnswer,
  allQuestions
)

// 3. 質問を切り替え
if (nextIndex !== null) {
  setQuestionIdx(nextIndex)
}
```

---

## ❓ よくある質問

### Q: ロジックルールは何個まで設定できる？
A: 制限はありません。必要なだけ設定できます。

### Q: ループは作れる？
A: はい。質問Aから質問Bへ、質問Bから質問Aへのロジックを設定すればループできます。

### Q: 複数の条件を組み合わせられる？
A: 現在は単一条件のみです。AND/OR条件は将来のアップデートで実装予定です。

### Q: テキスト入力でも分岐できる？
A: はい。CONTAINS, IS等の条件を使えばテキスト入力でも分岐できます。

### Q: 分岐先の質問が削除されたら？
A: その場合、ロジックは無視され、次の質問（順番通り）に進みます。

---

## 📚 関連ドキュメント

- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) - プロダクト全体のロードマップ
- [MVP_COMPLETE.md](./MVP_COMPLETE.md) - MVP完了機能一覧
- [VIDEO_SETUP.md](./VIDEO_SETUP.md) - 動画機能のセットアップ

---

**FormOnceで素晴らしい分岐型フォームを作成しましょう！🚀**
