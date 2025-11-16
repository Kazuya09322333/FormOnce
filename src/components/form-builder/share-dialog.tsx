import { CopyIcon } from '@radix-ui/react-icons'

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { Switch } from '@components/ui/switch'
import {
  ArrowLeft,
  Code,
  Facebook,
  Globe,
  HelpCircle,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MessageCircle,
  Share,
  Twitter,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type TShareDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  link: string
}

type ShareMode = 'main' | 'email' | 'embed' | 'social'

export function ShareDialog({
  open,
  onOpenChange,
  disabled,
  link,
}: TShareDialogProps) {
  const [mode, setMode] = useState<ShareMode>('main')
  const [embedType, setEmbedType] = useState<'iframe' | 'widget'>('iframe')
  const [embedWidth, setEmbedWidth] = useState('100%')
  const [embedHeight, setEmbedHeight] = useState('600')
  const [addContactVariables, setAddContactVariables] = useState(false)
  const [showVariablesHelp, setShowVariablesHelp] = useState(false)

  const iframeCode = `<iframe
  src="${link}"
  width="${embedWidth}"
  height="${embedHeight}"
  frameborder="0"
  allow="camera *; microphone *; autoplay *; encrypted-media *; fullscreen *; display-capture *;"
  style="border: none;">
</iframe>`

  const emailEmbedCode = `<a href="${link}">
  <img src="${link}/thumbnail.gif" alt="VideoAsk" style="max-width: 600px;" />
</a>`

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(link)
    toast.success('リンクをコピーしました', {
      position: 'top-center',
      duration: 1500,
    })
  }

  const handleCopyCode = (code: string, message: string) => {
    void navigator.clipboard.writeText(code)
    toast.success(message, {
      position: 'top-center',
      duration: 1500,
    })
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(link)
    const text = encodeURIComponent('フォームに回答してください')

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          共有
          <Share className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        {mode === 'main' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                フォームをどのように共有しますか？
              </DialogTitle>
            </DialogHeader>

            {/* Share Options Cards */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <button
                className="group flex flex-col items-center gap-4 rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-violet-500 hover:shadow-lg"
                onClick={() => setMode('email')}
              >
                <div className="relative h-32 w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                  <div className="absolute left-4 top-4 h-2 w-12 rounded bg-gray-300" />
                  <div className="absolute left-4 top-8 h-2 w-20 rounded bg-gray-300" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
                    <div className="h-16 w-24 rounded-lg bg-violet-600" />
                  </div>
                  <Mail className="absolute bottom-2 right-2 h-8 w-8 text-violet-600" />
                </div>
                <span className="text-base font-semibold">メールで送信</span>
              </button>

              <button
                className="group flex flex-col items-center gap-4 rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-violet-500 hover:shadow-lg"
                onClick={() => setMode('embed')}
              >
                <div className="relative h-32 w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                  <div className="absolute left-1/2 top-4 h-2 w-20 -translate-x-1/2 rounded bg-gray-300" />
                  <div className="absolute left-4 top-10 flex gap-2">
                    <div className="h-8 w-8 rounded bg-gray-300" />
                    <div className="h-8 w-8 rounded bg-gray-300" />
                    <div className="h-8 w-8 rounded bg-gray-300" />
                  </div>
                  <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-violet-600" />
                  <Globe className="absolute bottom-2 right-2 h-8 w-8 text-white" />
                </div>
                <span className="text-base font-semibold">
                  Webサイトに埋め込み
                </span>
              </button>

              <button
                className="group flex flex-col items-center gap-4 rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-violet-500 hover:shadow-lg"
                onClick={() => setMode('social')}
              >
                <div className="relative h-32 w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-300" />
                    <div className="h-2 w-16 rounded bg-gray-300" />
                  </div>
                  <div className="absolute bottom-4 left-1/2 h-16 w-20 -translate-x-1/2 rounded-lg bg-violet-600" />
                  <Share className="absolute bottom-2 right-2 h-8 w-8 text-violet-600" />
                </div>
                <span className="text-base font-semibold">SNSで共有</span>
              </button>
            </div>

            {/* Videoask Link */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  フォームリンク
                </Label>
                <button
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setShowVariablesHelp(!showVariablesHelp)}
                >
                  変数を追加
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              {showVariablesHelp && (
                <div className="rounded-md bg-blue-50 p-3 text-sm dark:bg-blue-950">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    💡 URLパラメータで変数を渡せます
                  </p>
                  <p className="mt-1 text-blue-800 dark:text-blue-200">
                    例: {link}?name=太郎&email=taro@example.com
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border bg-violet-50 px-4 py-3 dark:bg-violet-950">
                  <LinkIcon className="h-5 w-5 text-violet-600" />
                  <Input
                    value={link}
                    readOnly
                    className="border-0 bg-transparent p-0 font-mono text-sm text-violet-600 focus-visible:ring-0"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-black px-8 hover:bg-gray-800"
                  onClick={handleCopyLink}
                >
                  コピー
                </Button>
              </div>
            </div>

            {/* Password Protection */}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>パスワードでフォームを保護</span>
                <HelpCircle className="h-4 w-4" />
              </div>
              <button className="text-sm font-semibold text-green-600 hover:underline">
                プランをアップグレード
              </button>
            </div>
          </>
        ) : mode === 'email' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode('main')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <DialogTitle className="text-xl">メールで送信</DialogTitle>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="mb-4 flex items-center gap-3 border-b pb-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-20 rounded bg-gray-300" />
                  <div className="h-3 w-32 rounded bg-gray-300" />
                  <div className="mt-6 overflow-hidden rounded-lg">
                    <div className="aspect-video bg-gradient-to-br from-violet-600 to-purple-600" />
                  </div>
                  <a
                    href={link}
                    className="mt-2 flex items-center gap-1 text-sm text-violet-600 hover:underline"
                  >
                    <LinkIcon className="h-3 w-3" />
                    {link}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">
                    メールやニュースレターにフォームを追加
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    HTMLコードのスニペットをコピーして貼り付けると、フォームがアニメーションGIFとリンクとして埋め込まれます。
                    <a href="#" className="text-green-600 hover:underline">
                      詳細を見る
                    </a>
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">連絡先変数を追加</p>
                    <p className="text-xs text-muted-foreground">
                      送信先の名前とメールを自動入力します
                    </p>
                  </div>
                  <Switch
                    checked={addContactVariables}
                    onCheckedChange={setAddContactVariables}
                  />
                </div>

                <Button
                  className="w-full bg-black py-6 text-base text-white hover:bg-gray-800"
                  onClick={() =>
                    handleCopyCode(
                      emailEmbedCode,
                      'メール埋め込みコードをコピーしました',
                    )
                  }
                >
                  埋め込みコードをコピー
                </Button>
              </div>
            </div>
          </>
        ) : mode === 'embed' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode('main')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <DialogTitle className="text-xl">
                  Webサイトに埋め込み
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="mb-4 flex items-center gap-3 border-b pb-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
                  <div className="flex h-full items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-sm">フォームプレビュー</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  value={embedType}
                  onValueChange={(v) => setEmbedType(v as 'iframe' | 'widget')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iframe">Iframe</SelectItem>
                    <SelectItem value="widget">Widget</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <h3 className="mb-2 font-semibold">
                    フォームをWebサイトのどこにでも埋め込めます
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ほとんどのWebサイト、オンラインストアビルダー、CMSにフォームを埋め込めます。カスタムコードの挿入やHTMLコードの編集が可能であれば使用できます。
                    <a href="#" className="text-green-600 hover:underline">
                      詳細を見る
                    </a>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Width:</Label>
                    <Input
                      value={embedWidth}
                      onChange={(e) => setEmbedWidth(e.target.value)}
                      placeholder="100%"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Height (px):</Label>
                    <Input
                      value={embedHeight}
                      onChange={(e) => setEmbedHeight(e.target.value)}
                      placeholder="600"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-black py-6 text-base text-white hover:bg-gray-800"
                  onClick={() =>
                    handleCopyCode(iframeCode, '埋め込みコードをコピーしました')
                  }
                >
                  埋め込みコードをコピー
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode('main')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <DialogTitle className="text-xl">SNSで共有</DialogTitle>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="mb-4 flex items-center gap-3 border-b pb-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300" />
                    <div className="h-3 w-32 rounded bg-gray-300" />
                  </div>
                  <div className="aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 to-purple-600" />
                  <div className="space-y-2">
                    <div className="h-2 w-24 rounded bg-gray-300" />
                    <div className="h-2 w-32 rounded bg-gray-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">サムネイルを選択</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    SNSでシェアする際のプレビュー画像として使用されます
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-video cursor-pointer overflow-hidden rounded-lg border-4 border-violet-600 bg-gradient-to-br from-violet-600 to-purple-600 transition-all hover:scale-105" />
                    <div className="aspect-video cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 bg-gradient-to-br from-violet-600 to-purple-600 transition-all hover:scale-105 hover:border-violet-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 py-6"
                    onClick={() => handleSocialShare('facebook')}
                  >
                    <Facebook className="h-5 w-5" />
                    Facebookでシェア
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 py-6"
                    onClick={() => handleSocialShare('linkedin')}
                  >
                    <Linkedin className="h-5 w-5" />
                    LinkedInでシェア
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 py-6"
                    onClick={() => handleSocialShare('twitter')}
                  >
                    <Twitter className="h-5 w-5" />
                    Twitterでシェア
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 py-6"
                    onClick={() => handleSocialShare('whatsapp')}
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsAppでシェア
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
