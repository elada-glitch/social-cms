import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Social CMS - ניהול סושיאל מדיה',
  description: 'פלטפורמה לניהול תוכן ברשתות חברתיות',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Assistant, sans-serif',
              direction: 'rtl',
              textAlign: 'right',
            },
          }}
        />
      </body>
    </html>
  )
}
