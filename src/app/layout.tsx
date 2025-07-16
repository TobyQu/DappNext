import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Web3 ',
  description: '使用Next.js、RainbowKit和shadcn/ui构建的Web3 ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-2">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
