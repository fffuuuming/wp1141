import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { MainLayout } from '@/components/MainLayout'

export const metadata: Metadata = {
  title: 'heya - Social Media Platform',
  description: 'A Twitter-like social media platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  )
}

