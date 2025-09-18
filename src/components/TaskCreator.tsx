'use client'

import React, { useState } from 'react'
import { Family, TaskStatus } from '@/lib/types'
import { useApp } from '@/contexts/AppContext'
import { TASK_TEMPLATES, getAllCategories } from '@/lib/taskTemplates'
import { Button } from '@/components/ui/Button'
import { isAfterWorkEndTime } from '@/lib/algorithms'

interface TaskCreatorProps {
  family: Family
  onClose: () => void
}

export function TaskCreator({ family, onClose }: TaskCreatorProps) {
  const { actions } = useApp()
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [customTask, setCustomTask] = useState({
    title: '',
    description: '',
    estimatedMinutes: 15,
    category: '其他'
  })
  const [isUrgent, setIsUrgent] = useState(false)
  const [urgentPrice, setUrgentPrice] = useState(0)

  const isAfterWorkEnd = isAfterWorkEndTime(family.workEndTime)
  const categories = getAllCategories()

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const handleCreateFromTemplates = () => {
    selectedTemplates.forEach(templateId => {
      const template = TASK_TEMPLATES.find(t => t.id === templateId)
      if (template) {
        const taskData = {
          title: template.title,
          description: template.description,
          status: TaskStatus.TODO,
          estimatedMinutes: template.estimatedMinutes,
          category: template.category,
          isUrgent: isAfterWorkEnd ? isUrgent : false,
          urgentPrice: isAfterWorkEnd && isUrgent ? urgentPrice : undefined
        }

        if (isAfterWorkEnd && isUrgent) {
          // 收工时间后的加急任务需要议价
          actions.addUrgentRequest({
            taskId: '', // 将在创建任务后更新
            requestedBy: family.members[0].id, // TODO: 获取当前用户
            estimatedMinutes: template.estimatedMinutes,
            price: urgentPrice,
            message: `加急任务：${template.title}`,
            status: 'pending'
          })
        } else {
          // 正常时间或非加急任务，自动分配
          actions.assignTaskAutomatically(taskData)
        }
      }
    })

    onClose()
  }

  const handleCreateCustomTask = () => {
    if (!customTask.title.trim()) {
      alert('请输入任务标题')
      return
    }

    const taskData = {
      title: customTask.title,
      description: customTask.description,
      status: TaskStatus.TODO,
      estimatedMinutes: customTask.estimatedMinutes,
      category: customTask.category,
      isUrgent: isAfterWorkEnd ? isUrgent : false,
      urgentPrice: isAfterWorkEnd && isUrgent ? urgentPrice : undefined
    }

    if (isAfterWorkEnd && isUrgent) {
      // 收工时间后的加急任务需要议价
      actions.addUrgentRequest({
        taskId: '', // 将在创建任务后更新
        requestedBy: family.members[0].id, // TODO: 获取当前用户
        estimatedMinutes: customTask.estimatedMinutes,
        price: urgentPrice,
        message: `加急任务：${customTask.title}`,
        status: 'pending'
      })
    } else {
      // 正常时间或非加急任务，自动分配
      actions.assignTaskAutomatically(taskData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              创建新任务
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* 收工时间提示 */}
          {isAfterWorkEnd && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-700 text-sm">
                ⏰ 收工时间已到！新增任务需要设置为加急并议价。
              </p>
            </div>
          )}
        </div>

        {/* 标签页 */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              预设模板
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              自定义任务
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'templates' ? (
            <div>
              <p className="text-gray-600 mb-4">选择预设任务模板（可多选）：</p>
              
              {/* 按分类显示模板 */}
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TASK_TEMPLATES
                      .filter(template => template.category === category)
                      .map(template => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateToggle(template.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedTemplates.includes(template.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {template.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {template.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                预估 {template.estimatedMinutes} 分钟
                              </p>
                            </div>
                            {selectedTemplates.includes(template.id) && (
                              <span className="text-blue-500">✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务标题 *
                </label>
                <input
                  type="text"
                  value={customTask.title}
                  onChange={(e) => setCustomTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入任务标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务描述
                </label>
                <textarea
                  value={customTask.description}
                  onChange={(e) => setCustomTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="输入任务描述（可选）"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预估时间（分钟）
                  </label>
                  <input
                    type="number"
                    value={customTask.estimatedMinutes}
                    onChange={(e) => setCustomTask(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类
                  </label>
                  <select
                    value={customTask.category}
                    onChange={(e) => setCustomTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 加急选项（收工时间后显示） */}
          {isAfterWorkEnd && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="urgent" className="text-sm font-medium text-orange-700">
                  设为加急任务
                </label>
              </div>

              {isUrgent && (
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">
                    外包价（元）
                  </label>
                  <input
                    type="number"
                    value={urgentPrice}
                    onChange={(e) => setUrgentPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="输入外包价格"
                    min="0"
                    step="0.5"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    对方同意后，此金额将加入月度基金
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={activeTab === 'templates' ? handleCreateFromTemplates : handleCreateCustomTask}
              disabled={
                activeTab === 'templates' 
                  ? selectedTemplates.length === 0
                  : !customTask.title.trim()
              }
            >
              {activeTab === 'templates' 
                ? `创建 ${selectedTemplates.length} 个任务`
                : '创建任务'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
