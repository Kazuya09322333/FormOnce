# VideoAskフォーム作成完全ガイド

このドキュメントでは、FormOnceプロジェクトにおけるVideoAskスタイルのフォーム作成プロセスを詳細に説明します。

---

## 📋 目次

1. [プロセス概要表](#プロセス概要表)
2. [詳細な工程説明](#詳細な工程説明)
3. [技術アーキテクチャ](#技術アーキテクチャ)
4. [主要コンポーネント](#主要コンポーネント)
5. [ユーザー体験フロー](#ユーザー体験フロー)

---

## プロセス概要表

### フォーム作成者側のフロー

| 工程 | 操作 | 使用コンポーネント | 処理内容 | 所要時間 |
|------|------|-------------------|---------|---------|
| 1 | 新規フォーム作成 | `/dashboard/forms` | フォームレコード作成 | 即時 |
| 2 | 質問追加 | Flow Builder | 質問ノード追加・配置 | 1-2分 |
| 3 | 質問内容編集 | EditQuestionDialog | タイトル・説明・オプション設定 | 1-3分 |
| 4 | 動画アップロード | VideoUploadDialog | ファイル選択・アップロード | 2-5分 |
| 4-1 | ファイル選択 | File Input | MP4/MOV等を選択 | 10秒 |
| 4-2 | 自動変換 | FFmpeg.wasm | アスペクト比9:16変換 | 30秒-2分 |
| 4-3 | Supabaseアップロード | Signed URL | 動画ファイル転送 | 30秒-2分 |
| 4-4 | メタデータ保存 | Video Router | DBに動画情報保存 | 即時 |
| 5 | 分岐ロジック設定 | Logic Editor | 条件付き次質問設定 | 2-5分 |
| 6 | プレビュー確認 | VideoAsk Renderer | 実際の動作確認 | 1-2分 |
| 7 | フォーム公開 | Share Dialog | URLを共有 | 即時 |

### 回答者側のフロー

| 工程 | 操作 | 表示内容 | 処理内容 | 所要時間 |
|------|------|---------|---------|---------|
| 1 | フォームURL開く | ローディング画面 | フォームデータ読み込み | 1-2秒 |
| 2 | 最初の質問表示 | 動画自動再生 | 質問動画の再生 | 10-60秒 |
| 3 | 動画視聴 | フルスクリーン動画 | 進捗バー表示 | 動画長に依存 |
| 4 | 回答入力表示 | 入力フォームオーバーレイ | スキップまたは動画終了後 | 即時 |
| 5 | 回答を入力 | 各種入力フィールド | バリデーション実行 | 10-30秒 |
| 6 | 次へボタン | ロジック評価 | 次質問or終了判定 | 即時 |
| 7 | 次の質問へ | ステップ2-6を繰り返し | 全質問を順次表示 | 質問数に依存 |
| 8 | フォーム送信 | 完了画面 | 回答データ保存 | 1-2秒 |

---

## 詳細な工程説明

### 【フォーム作成フェーズ】

#### 工程1: 新規フォーム作成

**操作手順:**
1. ダッシュボード (`/dashboard/forms`) にアクセス
2. 「新しいフォームを作成」ボタンをクリック
3. フォーム名を入力

**技術的処理:**
```typescript
// src/pages/dashboard/forms/index.tsx
const createForm = api.forms.create.useMutation({
  onSuccess: (data) => {
    router.push(`/dashboard/forms/${data.id}`)
  }
})

// フォームレコード作成
{
  id: randomUUID(),
  title: "新しいフォーム",
  workspaceId: currentWorkspaceId,
  createdAt: new Date(),
  questions: []
}
```

**所要時間:** 10秒

---

#### 工程2: 質問追加（Flow Builder）

**操作手順:**
1. Flow Builderキャンバスをクリック
2. 「質問を追加」ダイアログが開く
3. 質問タイプを選択（テキスト or 選択式）

**技術的処理:**
```typescript
// src/components/form-builder/flow-builder/add-question-dialog.tsx
const newQuestion: TQuestion = {
  id: randomUUID(),
  title: "新しい質問",
  type: selectedType,
  subType: selectedSubType,
  position: { x: 100, y: 100 },
  options: type === 'select' ? ['オプション1', 'オプション2'] : undefined
}

// ReactFlowにノード追加
setNodes([...nodes, {
  id: newQuestion.id,
  type: 'improved-question',
  data: newQuestion,
  position: newQuestion.position
}])
```

**視覚表現:**
```
┌─────────────────────────────────────┐
│     Flow Builder Canvas              │
│                                      │
│   ┌───────────┐                     │
│   │  START    │                     │
│   └─────┬─────┘                     │
│         │                            │
│         ▼                            │
│   ┌───────────┐   ← 新しいノード    │
│   │  質問 1   │                     │
│   └─────┬─────┘                     │
│         │                            │
│         ▼                            │
│   ┌───────────┐                     │
│   │   END     │                     │
│   └───────────┘                     │
└─────────────────────────────────────┘
```

**所要時間:** 30秒

---

#### 工程3: 質問内容の編集

**操作手順:**
1. 質問ノードをクリック
2. ホバーツールバーから「Edit」ボタンをクリック
3. 編集ダイアログで以下を設定:
   - **質問タイトル**: "お名前を教えてください"
   - **説明文**: "フルネームでご記入ください"
   - **プレースホルダー**: "山田太郎"
   - **サブタイプ**: ショートテキスト / 長文 / メール等

**技術的処理:**
```typescript
// src/components/form-builder/flow-builder/edit-question.tsx
const editQuestion = api.forms.questions.update.useMutation({
  onSuccess: () => {
    refetchForm()
  }
})

// 更新内容
{
  ...existingQuestion,
  title: "お名前を教えてください",
  description: "フルネームでご記入ください",
  placeholder: "山田太郎",
  subType: ETextSubType.Short
}
```

**選択式質問の場合:**
```typescript
// オプション管理
{
  type: EQuestionType.Select,
  subType: ESelectSubType.Single, // or Multiple
  options: [
    "選択肢A",
    "選択肢B",
    "選択肢C"
  ]
}
```

**所要時間:** 1-3分

---

#### 工程4: 動画アップロード（詳細版）

**4-1. ファイル選択**

**操作手順:**
1. 質問ノードにホバー
2. 「Video」ボタンをクリック
3. VideoUploadDialogが開く
4. 「ビデオファイルを選択」ボタンをクリック
5. ファイル選択ダイアログでMP4/MOV/AVI/WebMを選択

**技術的処理:**
```typescript
// src/components/form-builder/flow-builder/VideoUploadDialog.tsx
<Input
  type="file"
  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
  onChange={handleFileSelect}
/>

const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // ファイルサイズチェック（500MB上限）
  if (file.size > 500 * 1024 * 1024) {
    toast.error('ファイルサイズは500MB以下にしてください')
    return
  }

  setSelectedFile(file)

  // 動画情報取得
  const dimensions = await getVideoDimensions(file)
  setVideoDimensions(dimensions)
  setAspectRatio(dimensions.aspectRatio)
}
```

**所要時間:** 10秒

---

**4-2. 自動アスペクト比変換（FFmpeg.wasm）**

**操作手順:**
1. システムが自動的にアスペクト比を判定
2. 9:16（縦型）でない場合、変換を提案
3. 「変換してアップロード」をクリック

**技術的処理:**
```typescript
// src/utils/videoConverter.ts

// ステップ1: 動画寸法取得
export async function getVideoDimensions(file: File) {
  const video = document.createElement('video')
  video.src = URL.createObjectURL(file)

  await new Promise((resolve) => {
    video.onloadedmetadata = resolve
  })

  return {
    width: video.videoWidth,
    height: video.videoHeight,
    aspectRatio: video.videoWidth / video.videoHeight
  }
}

// ステップ2: 変換必要性判定
export async function needsConversion(file: File): Promise<boolean> {
  const { aspectRatio } = await getVideoDimensions(file)
  const target = 9 / 16
  const tolerance = 0.05

  return Math.abs(aspectRatio - target) > tolerance
}

// ステップ3: FFmpeg変換実行
export async function convertVideoTo9x16(file: File): Promise<File> {
  const ffmpeg = await loadFFmpeg()

  // 進捗イベント設定
  ffmpeg.on('progress', ({ progress }) => {
    const percentage = progress * 100
    toast.info(`変換中: ${percentage.toFixed(0)}%`)
  })

  // ファイルをFFmpegメモリに書き込み
  await ffmpeg.writeFile('input.mp4', await fetchFile(file))

  // アスペクト比に応じてクロップ設定
  const { aspectRatio } = await getVideoDimensions(file)
  let cropFilter: string

  if (aspectRatio > 1) {
    // 横長動画: 幅をクロップ
    cropFilter = 'crop=ih*9/16:ih'
  } else {
    // 縦長動画: 高さをクロップ
    cropFilter = 'crop=iw:iw*16/9'
  }

  // FFmpegコマンド実行
  await ffmpeg.exec([
    '-i', 'input.mp4',                    // 入力ファイル
    '-vf', `${cropFilter},scale=1080:1920`, // クロップ+リサイズ
    '-c:v', 'libx264',                    // H.264コーデック
    '-preset', 'ultrafast',               // 最速エンコード
    '-crf', '28',                         // 品質設定（0-51）
    '-c:a', 'aac',                        // AACオーディオ
    '-b:a', '128k',                       // 128kbps音声
    '-y',                                 // 上書き許可
    'output.mp4'                          // 出力ファイル
  ])

  // 変換後ファイル取得
  const data = await ffmpeg.readFile('output.mp4')
  const blob = new Blob([data], { type: 'video/mp4' })

  return new File([blob], `${file.name.split('.')[0]}_9x16.mp4`, {
    type: 'video/mp4'
  })
}
```

**FFmpegパラメータ説明:**
- `-vf crop=ih*9/16:ih`: 入力高さの9/16倍に幅をクロップ
- `scale=1080:1920`: 最終サイズを1080×1920に
- `-preset ultrafast`: エンコード速度優先（品質より速度）
- `-crf 28`: 品質レベル（0=最高品質、51=最低品質、28=妥当）
- `-c:a aac -b:a 128k`: 音声をAAC 128kbpsに

**処理例:**
```
入力: 1920×1080 (16:9横長)
↓
クロップ: 1920×1080 → 607×1080 (中央部分のみ)
↓
スケール: 607×1080 → 1080×1920
↓
出力: 1080×1920 (9:16縦長) ✓
```

**所要時間:** 30秒〜2分（動画サイズによる）

---

**4-3. Supabaseへのアップロード**

**操作手順:**
1. 変換完了後、自動的にアップロード開始
2. 進捗バーで進行状況を確認

**技術的処理（3ステージアップロード）:**

**Stage 1: 署名付きURLの取得**
```typescript
// クライアント側
const { uploadUrl, filePath } = await getUploadUrl.mutateAsync({
  filename: file.name,
  fileType: file.type,
  fileSize: file.size
})

// サーバー側: src/server/api/routers/video/router.ts
getUploadUrl: protectedProcedure
  .input(z.object({
    filename: z.string(),
    fileType: z.string(),
    fileSize: z.number().optional()
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.user?.id

    // ファイルパス生成（衝突回避）
    const timestamp = Date.now()
    const sanitized = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${userId}/${timestamp}_${sanitized}`

    // Supabase署名付きURL生成（1時間有効）
    const { data, error } = await getSupabaseAdmin()
      .storage
      .from('videos')
      .createSignedUploadUrl(filePath)

    if (error) throw new Error('アップロードURL生成失敗')

    return {
      uploadUrl: data.signedUrl,
      filePath,
      token: data.token
    }
  })
```

**Stage 2: ダイレクトアップロード**
```typescript
// XMLHttpRequestで進捗トラッキング
const xhr = new XMLHttpRequest()

xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    const percentage = (e.loaded / e.total) * 100
    setUploadProgress(percentage)
  }
})

xhr.addEventListener('load', () => {
  if (xhr.status === 200) {
    toast.success('アップロード完了')
    finalizeUpload()
  }
})

xhr.addEventListener('error', () => {
  toast.error('アップロード失敗')
})

xhr.open('PUT', uploadUrl)
xhr.setRequestHeader('Content-Type', file.type)
xhr.send(file)
```

**Stage 3: メタデータ保存**
```typescript
// クライアント側
const { videoId, url } = await finalizeVideo.mutateAsync({
  filePath: filePath,
  title: videoTitle || file.name
})

// 質問に動画を紐付け
await onVideoUploaded(videoId, url)

// サーバー側
finalizeVideo: protectedProcedure
  .input(z.object({
    filePath: z.string(),
    title: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.user?.id

    // パブリックURL取得
    const { data: urlData } = getSupabaseAdmin()
      .storage
      .from('videos')
      .getPublicUrl(input.filePath)

    // データベースに保存
    const { data: video } = await getSupabaseAdmin()
      .from('Video')
      .insert({
        id: randomUUID(),
        title: input.title,
        filePath: input.filePath,
        url: urlData.publicUrl,
        userId: userId,
        workspaceId: ctx.session?.user?.workspaceId,
        status: 'READY',
        createdAt: new Date()
      })
      .select()
      .single()

    return {
      videoId: video.id,
      url: urlData.publicUrl
    }
  })
```

**アップロードフロー図:**
```
クライアント                     サーバー                    Supabase Storage
    │                              │                              │
    ├──getUploadUrl()──────────────>                              │
    │                              ├──createSignedUploadUrl()────>
    │                              <──signedUrl + token───────────┤
    <──uploadUrl + filePath────────┤                              │
    │                              │                              │
    ├──PUT video file──────────────────────────────────────────────>
    │                              │                              │
    <──200 OK──────────────────────────────────────────────────────┤
    │                              │                              │
    ├──finalizeVideo()─────────────>                              │
    │                              ├──getPublicUrl()──────────────>
    │                              <──publicUrl───────────────────┤
    │                              ├──INSERT into Video table     │
    <──videoId + url───────────────┤                              │
    │                              │                              │
```

**所要時間:** 30秒〜2分（ファイルサイズ・回線速度による）

---

**4-4. 質問への紐付け**

**操作手順:**
1. アップロード完了後、自動的に質問に紐付け
2. 質問ノードに動画アイコンが表示される

**技術的処理:**
```typescript
// src/components/form-builder/flow-builder/VideoUploadDialog.tsx
const onVideoUploaded = async (videoId: string, videoUrl: string) => {
  // 質問データ更新
  await editQuestion.mutateAsync({
    formId: data.formId,
    question: {
      ...currentQuestion,
      videoId: videoId,
      videoUrl: videoUrl
    }
  })

  // Flow Builder再描画
  refetchForm()

  // ダイアログを閉じる
  setVideoDialogOpen(false)

  toast.success('動画を追加しました')
}
```

**所要時間:** 即時

---

#### 工程5: 分岐ロジック設定

**操作手順:**
1. 質問ノードにホバー
2. 「Logic」ボタン（分岐アイコン）をクリック
3. Logic Editorが開く
4. 各オプション/条件に対して「次の質問」を設定

**技術的処理:**
```typescript
// src/components/form-builder/flow-builder/edit-question.tsx

// ロジックルール構造
type TLogic = {
  questionId: string       // このロジックが適用される質問ID
  condition: ELogicCondition
  value: string | string[] // 条件値
  skipTo: string           // ジャンプ先質問ID or 'end'
}

enum ELogicCondition {
  ALWAYS = 'always',              // 常に
  IS = 'is',                      // 等しい
  IS_NOT = 'is_not',              // 等しくない
  CONTAINS = 'contains',          // 含む
  IS_GREATER_THAN = 'is_greater_than',  // より大きい
  IS_LESS_THAN = 'is_less_than',        // より小さい
  IS_ONE_OF = 'is_one_of'         // いずれかに該当
}

// 例: 選択式質問のロジック設定
const question: TQuestion = {
  id: 'q1',
  title: 'あなたの役職は？',
  type: EQuestionType.Select,
  subType: ESelectSubType.Single,
  options: ['マネージャー', '開発者', 'デザイナー'],
  logic: [
    {
      questionId: 'q1',
      condition: ELogicCondition.IS,
      value: 'マネージャー',
      skipTo: 'q3'  // マネージャー専用質問へジャンプ
    },
    {
      questionId: 'q1',
      condition: ELogicCondition.IS,
      value: '開発者',
      skipTo: 'q5'  // 開発者専用質問へジャンプ
    },
    {
      questionId: 'q1',
      condition: ELogicCondition.IS,
      value: 'デザイナー',
      skipTo: 'end' // 直接終了
    }
  ]
}
```

**ロジック評価処理:**
```typescript
// src/utils/forms/evaluateLogic.ts

export function getNextQuestionIndex(
  currentIndex: number,
  currentQuestion: TQuestion,
  answer: any,
  allQuestions: TQuestion[]
): number | null {

  // ロジックルールがない場合は次の質問へ
  if (!currentQuestion.logic || currentQuestion.logic.length === 0) {
    return currentIndex + 1 < allQuestions.length
      ? currentIndex + 1
      : null
  }

  // ロジックルールを順番に評価
  for (const rule of currentQuestion.logic) {
    if (evaluateCondition(rule.condition, answer, rule.value)) {

      if (rule.skipTo === 'end') {
        return null  // フォーム終了
      }

      // skipTo質問のインデックスを検索
      const targetIndex = allQuestions.findIndex(q => q.id === rule.skipTo)
      return targetIndex !== -1 ? targetIndex : null
    }
  }

  // どのルールにも該当しない場合は次の質問へ
  return currentIndex + 1 < allQuestions.length
    ? currentIndex + 1
    : null
}

function evaluateCondition(
  condition: ELogicCondition,
  answer: any,
  ruleValue: string | string[]
): boolean {
  switch (condition) {
    case ELogicCondition.ALWAYS:
      return true

    case ELogicCondition.IS:
      return answer === ruleValue

    case ELogicCondition.IS_NOT:
      return answer !== ruleValue

    case ELogicCondition.CONTAINS:
      return String(answer).includes(String(ruleValue))

    case ELogicCondition.IS_GREATER_THAN:
      return Number(answer) > Number(ruleValue)

    case ELogicCondition.IS_LESS_THAN:
      return Number(answer) < Number(ruleValue)

    case ELogicCondition.IS_ONE_OF:
      return Array.isArray(ruleValue)
        ? ruleValue.includes(answer)
        : false

    default:
      return false
  }
}
```

**ロジックフロー例:**
```
質問1: "あなたの経験年数は？"
├─ 回答: "1年未満" → ロジック: skipTo "初心者向け質問"
├─ 回答: "1-3年" → ロジック: skipTo "中級者向け質問"
├─ 回答: "3-5年" → ロジック: skipTo "上級者向け質問"
└─ 回答: "5年以上" → ロジック: skipTo "エキスパート向け質問"

質問2: 初心者向け質問
└─ 次へ → 質問6（共通質問）

質問3: 中級者向け質問
└─ 次へ → 質問6

質問4: 上級者向け質問
└─ 次へ → 質問6

質問5: エキスパート向け質問
└─ 次へ → 質問7（エキスパート専用追加質問）

質問6: 共通質問
└─ 次へ → 終了

質問7: エキスパート専用追加質問
└─ 次へ → 終了
```

**所要時間:** 2-5分（質問数・複雑さによる）

---

#### 工程6: プレビュー確認

**操作手順:**
1. 「プレビュー」ボタンをクリック
2. 別タブでフォームが開く
3. 実際のユーザー体験を確認

**技術的処理:**
```typescript
// src/pages/dashboard/forms/[id]/preview.tsx
export default function PreviewPage() {
  const { id } = useRouter().query
  const { data: form } = api.forms.getById.useQuery({ id: id as string })

  return (
    <VideoAskRenderer
      questions={form.questions}
      onSubmit={async (data) => {
        console.log('プレビューモード - 送信データ:', data)
        toast.info('プレビューモードのため送信されません')
      }}
    />
  )
}
```

**所要時間:** 1-2分

---

#### 工程7: フォーム公開・共有

**操作手順:**
1. 「共有」ボタンをクリック
2. Share Dialogが開く
3. 以下のいずれかを選択:
   - **パブリックURL**: `https://formonce.com/f/{formId}`
   - **埋め込みコード**: `<iframe src="..."></iframe>`
   - **QRコード**: モバイル用

**技術的処理:**
```typescript
// src/components/form-builder/share-dialog.tsx

const ShareDialog = ({ formId }: { formId: string }) => {
  const publicUrl = `${window.location.origin}/f/${formId}`
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="800px" frameborder="0"></iframe>`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success('URLをコピーしました')
  }

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success('埋め込みコードをコピーしました')
  }

  return (
    <Dialog>
      <DialogContent>
        <Tabs>
          <TabsList>
            <TabsTrigger value="link">リンク</TabsTrigger>
            <TabsTrigger value="embed">埋め込み</TabsTrigger>
            <TabsTrigger value="qr">QRコード</TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <Input value={publicUrl} readOnly />
            <Button onClick={handleCopyUrl}>コピー</Button>
          </TabsContent>

          <TabsContent value="embed">
            <Textarea value={embedCode} readOnly />
            <Button onClick={handleCopyEmbed}>コピー</Button>
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeSVG value={publicUrl} size={256} />
            <Button onClick={downloadQR}>ダウンロード</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

**所要時間:** 即時

---

### 【フォーム回答フェーズ】

#### 工程1: フォームURL開く

**操作手順:**
1. 回答者が共有URLにアクセス
2. ローディング画面表示

**技術的処理:**
```typescript
// src/components/form-builder/liveForm.tsx
export default function LiveForm({ formId }: { formId: string }) {
  const { data: form, isLoading } = api.forms.getPublicForm.useQuery({
    id: formId
  })

  const { data: formView } = api.forms.createFormView.useMutation({
    onSuccess: (data) => {
      setFormViewId(data.id)
    }
  })

  useEffect(() => {
    // フォームビュー記録（アナリティクス用）
    formView.mutate({ formId })
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <VideoAskRenderer
      questions={form.questions}
      onSubmit={handleSubmit}
    />
  )
}
```

**所要時間:** 1-2秒

---

#### 工程2-7: 質問回答ループ

**詳細な流れ:**

```
┌──────────────────────────────────────────────────┐
│  ステップ1: 質問読み込み                           │
│  - questions[currentIndex]を取得                 │
│  - videoUrlの有無をチェック                       │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  ステップ2: 動画再生（videoUrlがある場合）          │
│  - 動画を自動再生                                 │
│  - 進捗バー表示（X / Y 質問）                     │
│  - スキップボタン表示                             │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  ステップ3: 動画終了 or スキップ                   │
│  - onEnded イベント発火                          │
│  - setVideoEnded(true)                          │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  ステップ4: 回答入力表示                           │
│  - 入力フォームがフェードイン                      │
│  - 質問タイトル・説明表示                         │
│  - 適切な入力タイプ表示                           │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  ステップ5: ユーザー入力                           │
│  - テキスト入力 / 選択肢クリック                  │
│  - リアルタイムバリデーション                     │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  ステップ6: バリデーション                         │
│  - Zodスキーマでチェック                          │
│  - エラー時: エラーメッセージ表示                  │
│  - 成功時: 次へボタン有効化                       │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│  ステップ7: ロジック評価                           │
│  - evaluateLogic(currentQ, answer, questions)   │
│  - 次質問インデックス決定                         │
│  - skipTo 'end' → 送信へ                        │
│  - skipTo 'qX' → qXへジャンプ                    │
│  - ルールなし → 次の質問へ                        │
└────────────┬─────────────────────────────────────┘
             │
             ├─ 次の質問がある場合 → ステップ1へ戻る
             │
             └─ 全質問完了 → 送信処理へ
```

**技術的処理:**
```typescript
// src/components/form-builder/videoask-renderer.tsx

export function VideoAskRenderer({ questions, onSubmit }: Props) {
  const [qIdx, setQuestionIdx] = useState(0)
  const [videoEnded, setVideoEnded] = useState(false)
  const [isNextLoading, setIsNextLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(generateZodSchema(questions))
  })

  const currentQ = questions[qIdx]
  const hasVideo = !!currentQ?.videoUrl
  const progress = ((qIdx + 1) / questions.length) * 100

  // 質問が変わったら動画をリセット
  useEffect(() => {
    setVideoEnded(false)

    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0

      const playPromise = videoRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Auto-play prevented:', error)
          // ブラウザが自動再生をブロック
          // ユーザーが手動で再生ボタンをクリック可能
        })
      }
    } else {
      // 動画がない質問は即座に入力表示
      setVideoEnded(true)
    }
  }, [qIdx, hasVideo])

  // 次へボタンハンドラー
  const handleNext = async () => {
    setIsNextLoading(true)

    // バリデーション
    const isValid = await form.trigger(currentQ.id)
    if (!isValid) {
      setIsNextLoading(false)
      return
    }

    const currentAnswer = form.getValues()[currentQ.id]

    // 最後の質問かチェック
    if (qIdx === questions.length - 1) {
      await onSubmit(form.getValues())
      setIsNextLoading(false)
      return
    }

    // ロジック評価
    const nextIndex = getNextQuestionIndex(
      qIdx,
      currentQ,
      currentAnswer,
      questions
    )

    if (nextIndex !== null) {
      setQuestionIdx(nextIndex)
    } else {
      // フォーム終了
      await onSubmit(form.getValues())
    }

    setIsNextLoading(false)
  }

  // スキップボタンハンドラー
  const handleSkipVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setVideoEnded(true)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900">

      {/* 進捗バー */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all',
                  idx < qIdx && 'bg-violet-400',
                  idx === qIdx && 'bg-violet-300',
                  idx > qIdx && 'bg-white/20'
                )}
              />
            ))}
          </div>
          <p className="text-white/60 text-sm">
            質問 {qIdx + 1} / {questions.length}
          </p>
        </div>
      </div>

      {/* 動画セクション */}
      {hasVideo && (
        <div className="relative h-screen flex items-center justify-center">
          <video
            ref={videoRef}
            src={currentQ.videoUrl}
            className="w-full h-full object-cover"
            playsInline
            onEnded={() => setVideoEnded(true)}
          />

          {/* スキップボタン */}
          {!videoEnded && (
            <Button
              onClick={handleSkipVideo}
              variant="ghost"
              className="absolute bottom-24 right-8 text-white"
            >
              スキップ →
            </Button>
          )}
        </div>
      )}

      {/* 入力セクション（動画終了後 or 動画なし） */}
      {videoEnded && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="max-w-2xl w-full space-y-6">

            {/* 質問タイトル */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {currentQ.title}
              </h2>
              {currentQ.description && (
                <p className="text-gray-300 text-lg">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* 入力フィールド */}
            <FormField
              control={form.control}
              name={currentQ.id}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <VideoAskInput
                      question={currentQ}
                      field={field}
                      onNext={handleNext}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* 次へボタン（単一選択以外） */}
            {currentQ.type !== EQuestionType.Select ||
             currentQ.subType !== ESelectSubType.Single && (
              <Button
                onClick={handleNext}
                disabled={isNextLoading}
                className="w-full py-6 text-lg"
              >
                {isNextLoading ? (
                  <Loader2 className="animate-spin" />
                ) : qIdx === questions.length - 1 ? (
                  '送信'
                ) : (
                  '次へ →'
                )}
              </Button>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
```

**所要時間:** 質問数・動画長による（通常3-10分）

---

#### 工程8: フォーム送信

**操作手順:**
1. 最後の質問に回答
2. 「送信」ボタンをクリック
3. 完了画面表示

**技術的処理:**
```typescript
// src/components/form-builder/liveForm.tsx

const handleSubmit = async (responses: Record<string, any>) => {
  try {
    // 回答データ構造
    const responseData = {
      formId: formId,
      formViewId: formViewId,  // アナリティクス用
      response: responses,      // { q1: "答え1", q2: ["選択A", "選択B"], ... }
      submittedAt: new Date(),
      ipAddress: await getClientIp(),
      userAgent: navigator.userAgent
    }

    // サーバーに送信
    await submitResponse.mutateAsync(responseData)

    // 成功画面表示
    setShowSuccessScreen(true)

  } catch (error) {
    toast.error('送信に失敗しました')
  }
}

// サーバー側: src/server/api/routers/forms/router.ts
submitResponse: publicProcedure
  .input(z.object({
    formId: z.string(),
    formViewId: z.string(),
    response: z.record(z.any())
  }))
  .mutation(async ({ input }) => {

    // FormResponse作成
    const { data: formResponse } = await supabase
      .from('FormResponse')
      .insert({
        id: randomUUID(),
        formId: input.formId,
        formViewId: input.formViewId,
        response: input.response,
        submittedAt: new Date()
      })
      .select()
      .single()

    // FormView更新（完了フラグ）
    await supabase
      .from('FormView')
      .update({ completed: true, completedAt: new Date() })
      .eq('id', input.formViewId)

    // Webhookトリガー（設定されている場合）
    const form = await supabase
      .from('Form')
      .select('webhookUrl')
      .eq('id', input.formId)
      .single()

    if (form.data?.webhookUrl) {
      await fetch(form.data.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: input.formId,
          responseId: formResponse.id,
          response: input.response,
          submittedAt: new Date()
        })
      })
    }

    return { success: true, responseId: formResponse.id }
  })
```

**完了画面:**
```tsx
{showSuccessScreen && (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-900">
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
        <Check className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white">
        ありがとうございました！
      </h1>
      <p className="text-xl text-gray-300">
        回答を受け付けました
      </p>
    </div>
  </div>
)}
```

**所要時間:** 1-2秒

---

## 技術アーキテクチャ

### システム全体図

```
┌─────────────────────────────────────────────────────────────┐
│                     クライアント層                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │  Flow Builder  │  │ Video Upload   │  │  Live Form     ││
│  │                │  │  Dialog        │  │  (回答画面)     ││
│  │ - ReactFlow    │  │                │  │                ││
│  │ - 質問ノード    │  │ - FFmpeg.wasm  │  │ - VideoAsk     ││
│  │ - エッジ接続    │  │ - Progress Bar │  │   Renderer     ││
│  │ - Logic Editor │  │ - Signed URL   │  │ - Input Types  ││
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘│
│           │                   │                   │         │
└───────────┼───────────────────┼───────────────────┼─────────┘
            │                   │                   │
            │                   │                   │
┌───────────┼───────────────────┼───────────────────┼─────────┐
│           │       tRPC API層 (型安全通信)          │         │
├───────────┼───────────────────┼───────────────────┼─────────┤
│           │                   │                   │         │
│  ┌────────▼───────┐  ┌────────▼───────┐  ┌────────▼───────┐│
│  │  Forms Router  │  │  Video Router  │  │  Response      ││
│  │                │  │                │  │  Router        ││
│  │ - create()     │  │ - getUploadUrl│  │                ││
│  │ - update()     │  │ - finalize()   │  │ - submit()     ││
│  │ - delete()     │  │ - getVideo()   │  │ - getResults() ││
│  │ - getById()    │  │ - deleteVideo()│  │                ││
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘│
│           │                   │                   │         │
└───────────┼───────────────────┼───────────────────┼─────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   データ層（Supabase）                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL DB│  │  Storage      │  │  Auth        │      │
│  │              │  │  (videos/)    │  │              │      │
│  │ - Form       │  │               │  │ - Users      │      │
│  │ - Question   │  │ - {userId}/   │  │ - Sessions   │      │
│  │ - Video      │  │   timestamp_  │  │ - Workspaces │      │
│  │ - Response   │  │   video.mp4   │  │              │      │
│  │ - FormView   │  │               │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### データベーススキーマ

```sql
-- フォームテーブル
CREATE TABLE "Form" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  workspaceId UUID NOT NULL REFERENCES "Workspace"(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE,
  webhookUrl TEXT
);

-- 質問テーブル（JSONBで柔軟に管理）
CREATE TABLE "Question" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formId UUID NOT NULL REFERENCES "Form"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'text' | 'select'
  subType TEXT NOT NULL,
  position JSONB, -- { x: number, y: number }
  options TEXT[], -- 選択式の選択肢
  logic JSONB, -- TLogic[]
  videoId UUID REFERENCES "Video"(id),
  videoUrl TEXT,
  "order" INT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 動画テーブル
CREATE TABLE "Video" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filePath TEXT NOT NULL,
  url TEXT NOT NULL,
  userId UUID NOT NULL REFERENCES "User"(id),
  workspaceId UUID NOT NULL REFERENCES "Workspace"(id),
  status TEXT NOT NULL DEFAULT 'READY', -- 'UPLOADING' | 'READY' | 'ERROR'
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- フォーム回答テーブル
CREATE TABLE "FormResponse" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formId UUID NOT NULL REFERENCES "Form"(id),
  formViewId UUID NOT NULL REFERENCES "FormView"(id),
  response JSONB NOT NULL, -- { questionId: answer }
  submittedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  ipAddress TEXT,
  userAgent TEXT
);

-- フォームビュー（アナリティクス用）
CREATE TABLE "FormView" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formId UUID NOT NULL REFERENCES "Form"(id),
  viewedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completedAt TIMESTAMP,
  ipAddress TEXT,
  referrer TEXT
);

-- インデックス
CREATE INDEX idx_question_formId ON "Question"(formId);
CREATE INDEX idx_video_userId ON "Video"(userId);
CREATE INDEX idx_response_formId ON "FormResponse"(formId);
CREATE INDEX idx_formview_formId ON "FormView"(formId);
```

---

## 主要コンポーネント

### 1. Flow Builder (`src/components/form-builder/flow-builder/index.tsx`)

**役割:** ビジュアルフォームエディター

**主要機能:**
- ReactFlowベースのドラッグ&ドロップUI
- 質問ノードの追加・削除・編集
- ノード間の接続でフロー可視化
- ズーム・パン操作

**カスタムノード:**
```tsx
const nodeTypes = {
  'improved-start': ImprovedStartNode,
  'improved-question': ImprovedQuestionNode,
  'improved-end': ImprovedEndNode
}

const edgeTypes = {
  'improved-edge': ImprovedCustomEdge
}
```

---

### 2. VideoUploadDialog (`src/components/form-builder/flow-builder/VideoUploadDialog.tsx`)

**役割:** 動画アップロード管理

**主要機能:**
- ファイル選択（ドラッグ&ドロップ対応）
- アスペクト比自動検出
- FFmpeg.wasmによる変換
- 進捗トラッキング
- エラーハンドリング

**状態管理:**
```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [videoTitle, setVideoTitle] = useState('')
const [isConverting, setIsConverting] = useState(false)
const [conversionProgress, setConversionProgress] = useState(0)
const [isUploading, setIsUploading] = useState(false)
const [uploadProgress, setUploadProgress] = useState(0)
const [videoDimensions, setVideoDimensions] = useState<{width: number, height: number} | null>(null)
```

---

### 3. VideoAskRenderer (`src/components/form-builder/videoask-renderer.tsx`)

**役割:** フォーム回答インターフェース

**主要機能:**
- フルスクリーン動画再生
- 自動/手動プレイ制御
- 質問間ナビゲーション
- 進捗バー表示
- 条件分岐ロジック適用

**状態管理:**
```tsx
const [qIdx, setQuestionIdx] = useState(0)
const [videoEnded, setVideoEnded] = useState(false)
const [isNextLoading, setIsNextLoading] = useState(false)
const videoRef = useRef<HTMLVideoElement>(null)

const form = useForm({
  mode: 'all',
  resolver: zodResolver(schema)
})
```

---

### 4. VideoAskInput (`src/components/form-builder/videoask-input.tsx`)

**役割:** 各種入力タイプの描画

**対応タイプ:**

| タイプ | サブタイプ | UIコンポーネント | 自動進行 |
|-------|----------|----------------|---------|
| text | short | Input (text) | No |
| text | long | Textarea | No |
| text | email | Input (email) | No |
| text | number | Input (number) | No |
| text | url | Input (url) | No |
| text | phone | Input (tel) | No |
| text | password | Input (password) | No |
| select | single | Checkbox (単一) | Yes (300ms) |
| select | multiple | Checkbox (複数) | No |

**単一選択の自動進行:**
```tsx
const handleCheckboxChange = (item: string, checked: boolean) => {
  if (question.subType === ESelectSubType.Single) {
    field.onChange([item])
    setTimeout(() => {
      onNext() // 自動的に次へ
    }, 300)
  } else {
    // 複数選択: ユーザーが「次へ」をクリック
    if (checked) {
      field.onChange([...field.value, item])
    } else {
      field.onChange(field.value.filter(v => v !== item))
    }
  }
}
```

---

### 5. evaluateLogic (`src/utils/forms/evaluateLogic.ts`)

**役割:** 条件分岐ロジック評価

**主要関数:**
```typescript
export function getNextQuestionIndex(
  currentIndex: number,
  currentQuestion: TQuestion,
  answer: any,
  allQuestions: TQuestion[]
): number | null

function evaluateCondition(
  condition: ELogicCondition,
  answer: any,
  ruleValue: string | string[]
): boolean
```

**評価フロー:**
```
1. currentQuestion.logicを取得
2. ロジックルールがない場合 → 次の質問（currentIndex + 1）
3. ロジックルールがある場合 → 各ルールを順番に評価
4. 最初にtrueになったルールのskipToを適用
5. skipTo === 'end' → null（フォーム終了）
6. skipTo === '{questionId}' → その質問のインデックス
7. どのルールにもマッチしない → 次の質問
```

---

### 6. videoConverter (`src/utils/videoConverter.ts`)

**役割:** クライアント側動画変換

**主要関数:**
```typescript
// FFmpeg読み込み（シングルトン）
export async function loadFFmpeg(): Promise<FFmpeg>

// 動画寸法取得
export async function getVideoDimensions(file: File): Promise<{
  width: number
  height: number
  aspectRatio: number
}>

// 変換必要性判定
export async function needsConversion(file: File): Promise<boolean>

// 9:16変換実行
export async function convertVideoTo9x16(file: File): Promise<File>
```

**変換ロジック:**
```typescript
const { width, height, aspectRatio } = await getVideoDimensions(file)

let cropFilter: string

if (aspectRatio > 1) {
  // 横長（例: 1920×1080, 16:9）
  // 高さを基準に幅をクロップ
  // 新幅 = 高さ × (9/16)
  cropFilter = 'crop=ih*9/16:ih'

  // 例: 1920×1080 → crop=1080*9/16:1080 → 607×1080

} else {
  // 縦長（例: 1080×1920, 9:16）
  // 幅を基準に高さをクロップ
  // 新高さ = 幅 × (16/9)
  cropFilter = 'crop=iw:iw*16/9'

  // 例: 1080×1350 → crop=1080:1080*16/9 → 1080×1920
}

// 最終的に1080×1920にスケール
const finalFilter = `${cropFilter},scale=1080:1920`
```

---

## ユーザー体験フロー

### フォーム作成者のジャーニー

```
[ダッシュボード]
    ↓
    クリック「新しいフォームを作成」
    ↓
[Flow Builder - 空のキャンバス]
    ↓
    クリック「質問を追加」
    ↓
[質問タイプ選択ダイアログ]
    ↓
    選択: テキスト / 選択式
    ↓
[質問ノードが追加される]
    ↓
    ノードをクリック → ホバーツールバー表示
    ↓
    「Edit」ボタン → タイトル・説明・オプション編集
    ↓
    「Video」ボタン → 動画アップロード
    ↓
[VideoUploadDialog]
    ↓
    ファイル選択 → MP4選択
    ↓
    自動検出: 16:9 (横長) → 変換推奨
    ↓
    クリック「変換してアップロード」
    ↓
    FFmpeg変換: 30秒-2分
    ↓
    Supabaseアップロード: 1-2分
    ↓
    完了 → 質問に動画が紐付く
    ↓
    「Logic」ボタン → 分岐ロジック設定
    ↓
[Logic Editor]
    ↓
    選択肢A → 質問3へジャンプ
    選択肢B → 質問5へジャンプ
    選択肢C → 終了
    ↓
    保存 → Flow Builderに戻る
    ↓
    繰り返し: 必要な質問をすべて追加
    ↓
    クリック「プレビュー」
    ↓
[プレビュー画面]
    ↓
    実際の動作を確認
    ↓
    問題なければ「共有」ボタン
    ↓
[Share Dialog]
    ↓
    URLをコピー or 埋め込みコード取得
    ↓
    フォーム公開完了！
```

---

### 回答者のジャーニー

```
[フォームURLにアクセス]
    ↓
    ローディング: フォームデータ読み込み (1-2秒)
    ↓
[質問1: 動画再生開始]
    ↓
    動画自動再生（または手動再生）
    ↓
    進捗バー表示: 「質問 1 / 5」
    ↓
    動画視聴（10-60秒）
    ↓
    動画終了 or スキップボタンクリック
    ↓
[入力フォームがフェードイン]
    ↓
    質問タイトル: "お名前を教えてください"
    説明: "フルネームでご記入ください"
    ↓
    入力: "山田太郎"
    ↓
    クリック「次へ」
    ↓
    バリデーション: OK
    ↓
    ロジック評価: ルールなし → 次の質問へ
    ↓
[質問2: 動画再生開始]
    ↓
    進捗バー: 「質問 2 / 5」
    ↓
    動画視聴
    ↓
[入力フォーム表示]
    ↓
    質問: "あなたの役職は？"
    オプション:
      - マネージャー
      - 開発者
      - デザイナー
    ↓
    選択: "開発者"
    ↓
    自動進行（単一選択のため）
    ↓
    ロジック評価:
      condition: IS, value: "開発者", skipTo: "q5"
      → 質問5へジャンプ！
    ↓
[質問5: 開発者専用質問]
    ↓
    進捗バー: 「質問 5 / 5」（質問3-4をスキップ）
    ↓
    動画視聴 → 入力 → 次へ
    ↓
    最後の質問 → 「送信」ボタン表示
    ↓
    クリック「送信」
    ↓
    サーバーに送信中...
    ↓
[完了画面]
    ✓ ありがとうございました！
    回答を受け付けました
```

---

## パフォーマンス最適化

### 1. FFmpeg遅延読み込み

```typescript
// 初回アクセス時は読み込まない
let ffmpeg: FFmpeg | null = null

// 動画アップロード時のみ読み込み
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg // 2回目以降はキャッシュ

  ffmpeg = new FFmpeg()
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
  })

  return ffmpeg
}
```

**メリット:**
- 初期ロード時間短縮（~15MB削減）
- 動画アップロードしないユーザーには不要

---

### 2. 署名付きURLダイレクトアップロード

```
従来のアップロード方式:
クライアント → サーバー → Supabase Storage
（サーバー経由でファイル転送）

署名付きURL方式:
クライアント → 直接 → Supabase Storage
（サーバーはURL発行のみ）
```

**メリット:**
- サーバー負荷軽減
- アップロード速度向上
- 帯域幅削減

---

### 3. ReactFlowパフォーマンス

```tsx
// 大量ノードでも高速描画
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  attributionPosition="bottom-left"
  proOptions={{ hideAttribution: true }}
  // パフォーマンス最適化
  minZoom={0.1}
  maxZoom={4}
  defaultEdgeOptions={{ type: 'smoothstep' }}
/>
```

---

### 4. 動画エンコーディング最適化

```bash
# ultrafast preset: エンコード速度優先
-preset ultrafast

# CRF 28: 品質と速度のバランス
-crf 28

# 128kbps audio: 十分な音声品質
-b:a 128k
```

**トレードオフ:**
- ファイルサイズ: やや大きめ
- 変換速度: 非常に高速
- 品質: ビデオフォームには十分

---

## セキュリティ対策

### 1. ファイルアップロードセキュリティ

```typescript
// クライアント側検証
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
]

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
  throw new Error('サポートされていないファイル形式です')
}

if (file.size > MAX_FILE_SIZE) {
  throw new Error('ファイルサイズは500MB以下にしてください')
}

// サーバー側再検証
getUploadUrl: protectedProcedure
  .input(z.object({
    filename: z.string(),
    fileType: z.string(),
    fileSize: z.number().optional()
  }))
  .mutation(async ({ ctx, input }) => {
    if (!ALLOWED_VIDEO_TYPES.includes(input.fileType)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid file type'
      })
    }

    if (input.fileSize && input.fileSize > MAX_FILE_SIZE) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'File size exceeds limit'
      })
    }

    // ...
  })
```

---

### 2. 認証・認可

```typescript
// Protected Procedure（認証必須）
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

// フォーム作成・編集・削除: 認証必須
export const formsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(...),
  update: protectedProcedure.mutation(...),
  delete: protectedProcedure.mutation(...),

  // 公開フォーム取得: 認証不要
  getPublicForm: publicProcedure.query(...)
})
```

---

### 3. ユーザーデータ分離

```typescript
// 動画は常にユーザーIDでスコープ
const filePath = `${userId}/${timestamp}_${filename}`

// Supabase RLS (Row Level Security)
CREATE POLICY "Users can only access their own videos"
ON "Video"
FOR ALL
USING (auth.uid() = userId);

CREATE POLICY "Users can only access their workspace forms"
ON "Form"
FOR ALL
USING (
  workspaceId IN (
    SELECT workspaceId FROM "WorkspaceMember"
    WHERE userId = auth.uid()
  )
);
```

---

### 4. 署名付きURL有効期限

```typescript
// 1時間で期限切れ
const { data } = await supabase
  .storage
  .from('videos')
  .createSignedUploadUrl(filePath, {
    expiresIn: 3600 // 1時間
  })
```

---

### 5. 入力バリデーション

```typescript
// Zodスキーマでサーバー側検証
export const formSchemaToZod = (questions: TQuestion[]) => {
  const shape: Record<string, ZodTypeAny> = {}

  questions.forEach((q) => {
    switch (q.type) {
      case EQuestionType.Text:
        if (q.subType === ETextSubType.Email) {
          shape[q.id] = z.string().email('有効なメールアドレスを入力してください')
        } else if (q.subType === ETextSubType.Number) {
          shape[q.id] = z.number().or(z.string().regex(/^\d+$/))
        } else {
          shape[q.id] = z.string().min(1, '入力必須です')
        }
        break

      case EQuestionType.Select:
        if (q.subType === ESelectSubType.Multiple) {
          shape[q.id] = z.array(z.string()).min(1, '1つ以上選択してください')
        } else {
          shape[q.id] = z.array(z.string()).length(1, '1つ選択してください')
        }
        break
    }
  })

  return z.object(shape)
}
```

---

## まとめ

このVideoAskフォーム作成システムは、以下の特徴を持つ包括的なソリューションです:

### 主要機能
✅ ビジュアルフォームビルダー（ReactFlow）
✅ 動画質問のアップロード・自動変換
✅ 条件分岐ロジック
✅ フルスクリーン動画体験
✅ 多様な入力タイプ
✅ リアルタイムバリデーション
✅ 進捗トラッキング
✅ アナリティクス

### 技術スタック
- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **フォームビルダー**: ReactFlow
- **動画処理**: FFmpeg.wasm
- **バックエンド**: tRPC, Prisma
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **バリデーション**: Zod
- **認証**: Supabase Auth

### パフォーマンス
- クライアント側動画変換（サーバー負荷軽減）
- 署名付きURLダイレクトアップロード
- 遅延読み込み（FFmpeg）
- 型安全なAPI通信（tRPC）

### セキュリティ
- ファイルタイプ・サイズ検証
- 認証・認可（Protected Procedures）
- ユーザーデータ分離（RLS）
- 入力バリデーション（Zod）
- 署名付きURL（時間制限）

このシステムにより、誰でも簡単に魅力的なビデオフォームを作成・共有できます。
