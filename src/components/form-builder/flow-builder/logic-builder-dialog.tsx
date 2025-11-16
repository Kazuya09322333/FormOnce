import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui'
import { LogicBuilder, LogicBuilderProps } from './logic-builder'

type LogicBuilderDialogProps = LogicBuilderProps & {
  open: boolean
  setIsOpen: (open: boolean) => void
}

export const LogicBuilderDialog = ({
  open,
  setIsOpen,
  ...logicBuilerProps
}: LogicBuilderDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className="max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">分岐ロジック設定</DialogTitle>
          <DialogDescription className="text-base mt-2">
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">
                この質問へジャンプする選択肢を選んでください
              </p>
              <p className="text-sm text-gray-500">
                💡 選択した選択肢が回答されると、この質問に自動的に移動します
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <LogicBuilder {...logicBuilerProps} />
      </DialogContent>
    </Dialog>
  )
}
