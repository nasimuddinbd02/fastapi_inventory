import './globals.css'
import React from 'react'
import StoreProvider from '@/providers/StoreProvider'
import { Toaster } from '@/components/ui/toaster'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AuthExpiryHandler } from '@/components/auth/AuthExpiryHandler'
import '@/lib/axiosInterceptor' // Initialize axios interceptor

export const metadata = {
  title: 'Inventory UI',
  description: 'Inventory frontend'
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <StoreProvider>
          <AuthExpiryHandler />
          <AuthGuard>
            {children}
          </AuthGuard>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  )
}
