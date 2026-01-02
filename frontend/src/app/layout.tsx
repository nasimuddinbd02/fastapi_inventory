import './globals.css'
import React from 'react'
import StoreProvider from '@/providers/StoreProvider'

export const metadata = {
  title: 'Inventory UI',
  description: 'Inventory frontend'
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
