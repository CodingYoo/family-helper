import { TaskTemplate } from './types'

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'template-1',
    title: '扫地拖地',
    description: '清扫客厅、卧室、厨房地面并拖地',
    estimatedMinutes: 25,
    category: '清洁',
    icon: '🧹'
  },
  {
    id: 'template-2',
    title: '洗碗刷锅',
    description: '清洗餐具、锅具并整理厨房台面',
    estimatedMinutes: 15,
    category: '厨房',
    icon: '🍽️'
  },
  {
    id: 'template-3',
    title: '丢垃圾',
    description: '清理各房间垃圾桶并倒垃圾',
    estimatedMinutes: 10,
    category: '清洁',
    icon: '🗑️'
  },
  {
    id: 'template-4',
    title: '叠衣服',
    description: '整理晾干的衣物并放入衣柜',
    estimatedMinutes: 20,
    category: '整理',
    icon: '👕'
  },
  {
    id: 'template-5',
    title: '洗衣服',
    description: '分类脏衣物并启动洗衣机',
    estimatedMinutes: 10,
    category: '洗涤',
    icon: '👔'
  },
  {
    id: 'template-6',
    title: '晾衣服',
    description: '将洗好的衣物晾晒或烘干',
    estimatedMinutes: 15,
    category: '洗涤',
    icon: '🧺'
  },
  {
    id: 'template-7',
    title: '整理床铺',
    description: '整理卧室床铺和枕头',
    estimatedMinutes: 5,
    category: '整理',
    icon: '🛏️'
  },
  {
    id: 'template-8',
    title: '擦桌子',
    description: '清洁餐桌、茶几、书桌表面',
    estimatedMinutes: 10,
    category: '清洁',
    icon: '🪑'
  },
  {
    id: 'template-9',
    title: '买菜购物',
    description: '采购日常生活用品和食材',
    estimatedMinutes: 45,
    category: '采购',
    icon: '🛒'
  },
  {
    id: 'template-10',
    title: '做饭',
    description: '准备和烹饪一餐',
    estimatedMinutes: 40,
    category: '厨房',
    icon: '🍳'
  },
  {
    id: 'template-11',
    title: '清洁卫生间',
    description: '清洁马桶、洗手台、浴室',
    estimatedMinutes: 20,
    category: '清洁',
    icon: '🚿'
  },
  {
    id: 'template-12',
    title: '整理客厅',
    description: '收拾客厅物品，整理沙发和茶几',
    estimatedMinutes: 15,
    category: '整理',
    icon: '🛋️'
  }
]

// 根据分类获取模板
export function getTemplatesByCategory(category: string): TaskTemplate[] {
  return TASK_TEMPLATES.filter(template => template.category === category)
}

// 获取所有分类
export function getAllCategories(): string[] {
  const categories = TASK_TEMPLATES.map(template => template.category)
  return [...new Set(categories)]
}

// 根据ID获取模板
export function getTemplateById(id: string): TaskTemplate | undefined {
  return TASK_TEMPLATES.find(template => template.id === id)
}
