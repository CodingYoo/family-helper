// Service Worker for Family Helper PWA
const CACHE_NAME = 'family-helper-v1.0.0'
const STATIC_CACHE = 'family-helper-static-v1'
const DYNAMIC_CACHE = 'family-helper-dynamic-v1'

// 静态资源缓存列表
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
]

// 动态缓存的URL模式
const CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\/_next\/static\//,
  /\/api\//
]

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
  )
})

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return
  }

  // 跳过Chrome扩展请求
  if (url.protocol === 'chrome-extension:') {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // 如果有缓存，直接返回
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url)
          return cachedResponse
        }

        // 网络请求
        return fetch(request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // 检查是否需要缓存
            const shouldCache = CACHE_PATTERNS.some(pattern => pattern.test(request.url))

            if (shouldCache) {
              const responseToCache = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  console.log('[SW] Caching dynamic resource:', request.url)
                  cache.put(request, responseToCache)
                })
            }

            return response
          })
          .catch(() => {
            // 网络失败时的离线页面
            if (request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service Worker activated')
        return self.clients.claim()
      })
  )
})

// 推送通知事件
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
