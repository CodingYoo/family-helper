import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 检测是否为生产环境部署
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/family-helper' : '';

export const metadata: Metadata = {
  title: "家庭助手 - 任务分配小程序",
  description: "让家务可见、可停机、可议价的家庭任务管理工具",
  manifest: basePath + "/manifest.webmanifest",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "家庭助手",
  },
  icons: {
    icon: [
      { url: basePath + "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: basePath + "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: basePath + "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="家庭助手" />
        <link rel="apple-touch-icon" href={basePath + "/apple-touch-icon.png"} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen`}>
        <AppProvider>
          {children}
        </AppProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // 动态获取正确的 Service Worker 路径
                  const basePath = '${process.env.NODE_ENV === 'production' ? '/family-helper' : ''}';
                  navigator.serviceWorker.register(basePath + '/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
