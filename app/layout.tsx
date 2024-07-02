import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Toast from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GuessPaint',
  description: 'Create or join rooms and guess the drawing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toast />
      </body>
    </html>
  )
}