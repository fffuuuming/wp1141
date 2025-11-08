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
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  )
}

