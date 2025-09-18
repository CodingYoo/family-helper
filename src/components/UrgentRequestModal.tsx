'use client'

import React, { useState } from 'react'
import { UrgentRequest, Family } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'
import { Button } from '@/components/ui/Button'
import { formatTime, formatDuration } from '@/lib/utils'

interface UrgentRequestModalProps {
  requests: UrgentRequest[]
  family: Family
  onClose: () => void
}

export function UrgentRequestModal({ requests, family, onClose }: UrgentRequestModalProps) {
  const { actions } = useApp()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  const pendingRequests = requests.filter(req => req.status === 'pending')

  const handleApprove = (requestId: string) => {
    const request = requests.find(req => req.id === requestId)
    if (request) {
      // 批准议价请求
      actions.updateUrgentRequest(requestId, 'approved')
      
      // 更新月度基金
      if (request.price) {
        actions.updateFamily({
          monthlyFund: family.monthlyFund + request.price
        })
      }
      
      // 创建对应的加急任务
      actions.addTask({
        title: request.message || '加急任务',
        description: `议价通过的加急任务，外包价：¥${request.price}`,
        status: 'todo' as any,
        estimatedMinutes: request.estimatedMinutes || 30,
        category: '加急',
        isUrgent: true,
        urgentPrice: request.price,
        assignedTo: request.requestedBy
      })
    }
  }

  const handleReject = (requestId: string) => {
    actions.updateUrgentRequest(requestId, 'rejected')
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              暂无待处理请求
            </h2>
            <p className="text-gray-600 mb-6">
              当前没有需要议价的加急任务
            </p>
            
            <Button variant="primary" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              加急任务议价
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            有 {pendingRequests.length} 个加急任务等待您的确认
          </p>
        </div>

        {/* 请求列表 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const requester = family.members.find(m => m.id === request.requestedBy)
              
              return (
                <div
                  key={request.id}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedRequest === request.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 请求信息 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🚨</span>
                        <h3 className="font-medium text-gray-900">
                          {request.message}
                        </h3>
                      </div>

                      {/* 请求详情 */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>申请人：{requester?.name}</span>
                          <span>时间：{formatTime(new Date(request.createdAt))}</span>
                        </div>
                        
                        {request.estimatedMinutes && (
                          <div>
                            预估时长：{formatDuration(request.estimatedMinutes)}
                          </div>
                        )}
                        
                        {request.price && (
                          <div className="flex items-center gap-2">
                            <span>外包价：</span>
                            <span className="font-medium text-green-600">
                              ¥{request.price}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 说明文字 */}
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                        💡 同意后，此金额将加入月度基金，可用于双人奶茶/电影等奖励
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                      className="flex-1"
                    >
                      拒绝
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      className="flex-1"
                    >
                      同意（¥{request.price}）
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              当前月度基金：¥{family.monthlyFund}
            </div>
            <Button variant="outline" onClick={onClose}>
              稍后处理
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
