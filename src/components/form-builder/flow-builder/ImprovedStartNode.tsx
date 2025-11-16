'use client'

import { Badge } from '@components/ui'
import { Play } from 'lucide-react'
import { memo } from 'react'
import { Handle, Position } from 'reactflow'

const ImprovedStartNode = () => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg min-w-[200px]">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Play size={24} className="text-white ml-0.5" />
        </div>

        <div className="flex-1">
          <Badge className="bg-white/20 text-white border-white/30 mb-1">
            開始
          </Badge>
          <h3 className="font-bold text-white text-lg">始める</h3>
          <p className="text-white/80 text-sm">フォームスタート</p>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: 12,
            height: 12,
            right: -6,
            background: '#10b981',
            border: '2px solid white',
          }}
        />
      </div>
    </div>
  )
}

export default memo(ImprovedStartNode)
