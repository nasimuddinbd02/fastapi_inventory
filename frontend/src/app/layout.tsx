import './globals.css'
import React from 'react'
import StoreProvider from '@/providers/StoreProvider'
import { ThemeProvider } from 'next-themes'
import { SettingsProvider } from '@/providers/settings-provider'
import { Toaster } from '@/components/ui/toaster'
import { GlobalLoading } from '@/components/ui/global-loading'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AuthExpiryHandler } from '@/components/auth/AuthExpiryHandler'
import '@/lib/axiosInterceptor' // Initialize axios interceptor
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Inventory UI',
  description: 'Inventory frontend'
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <SettingsProvider>
              <AuthExpiryHandler />
              <AuthGuard>
                {children}
              </AuthGuard>
              <GlobalLoading />
            </SettingsProvider>
          </ThemeProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  )
}
