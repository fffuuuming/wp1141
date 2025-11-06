import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}

