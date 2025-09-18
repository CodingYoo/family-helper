import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  // 检测是否为生产环境部署
  const isProduction = process.env.NODE_ENV === 'production';
  const basePath = isProduction ? '/family-helper' : '';

  return {
    name: '家庭助手 - 任务分配小程序',
    short_name: '家庭助手',
    description: '让家务可见、可停机、可议价的家庭任务管理工具',
    start_url: basePath + '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    scope: basePath + '/',
    icons: [
      {
        src: basePath + '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: basePath + '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: basePath + '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['productivity', 'lifestyle'],
    lang: 'zh-CN',
    dir: 'ltr'
  }
}
