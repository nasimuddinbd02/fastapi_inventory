"use client"
import React, { useState } from 'react'
import Sidebar from './sidebar'
import Header from './header'
import ProductForm from './ProductForm'
import type { ViewKey } from '@/store/uiSlice'

type ClientAppShellProps = {
  children: React.ReactNode
  activeView: ViewKey
  onSelectView: (view: ViewKey) => void
  userName?: string | null
  onUserAction?: (action: string) => void
}

export default function ClientAppShell({ children, activeView, onSelectView, userName, onUserAction }: ClientAppShellProps){
  const [openProduct, setOpenProduct] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed sidebar rail for desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-full" style={{ width: 'var(--sidebar-width)' }}>
        <Sidebar activeView={activeView} onSelect={onSelectView} userName={userName} onUserAction={onUserAction} />
      </div>

      {/* Header - fixed at top */}
      <div className="fixed top-0 right-0 left-0 md:left-[var(--sidebar-width)] h-[var(--header-height)] z-40">
        <Header onOpenProduct={() => setOpenProduct(true)} onToggleSidebar={() => setSidebarOpen(s=>!s)} activeView={activeView} />
      </div>

      {/* Main content - offset by header + sidebar */}
      <main className="min-h-screen pt-[var(--header-height)] md:ml-[var(--sidebar-width)] transition-[margin-left]">
        <div className="px-4 pb-10">
          {children}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-sidebar text-sidebar-foreground p-0 shadow-lg">
            <Sidebar
              mobile
              activeView={activeView}
              userName={userName}
              onSelect={(view)=>{ onSelectView(view); setSidebarOpen(false) }}
              onUserAction={onUserAction}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={()=>setSidebarOpen(false)} />
        </div>
      )}

      <ProductForm open={openProduct} onClose={() => setOpenProduct(false)} />
    </div>
  )
}
