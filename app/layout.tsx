import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Social Media QA',
  description: 'A modern social media platform for quality assurance testing',
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
