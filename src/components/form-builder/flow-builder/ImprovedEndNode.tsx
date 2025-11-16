'use client'

import { Badge } from '@components/ui'
import { CheckCircle } from 'lucide-react'
import { memo } from 'react'
import { Handle, Position } from 'reactflow'

const ImprovedEndNode = () => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 shadow-lg min-w-[200px]">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <CheckCircle size={24} className="text-white" />
        </div>

        <div className="flex-1">
          <Badge className="bg-white/20 text-white border-white/30 mb-1">
            終了
          </Badge>
          <h3 className="font-bold text-white text-lg">完成です 👋</h3>
          <p className="text-white/80 text-sm">回答を送信</p>
        </div>

        <Handle
          type="target"
          position={Position.Left}
          style={{
            width: 12,
            height: 12,
            left: -6,
            background: '#ec4899',
            border: '2px solid white',
          }}
        />
      </div>
    </div>
  )
}

export default memo(ImprovedEndNode)
