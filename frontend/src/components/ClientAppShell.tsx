"use client"
import React, { useState } from 'react'
import Sidebar from './sidebar'
import Header from './header'
import ProductForm from './ProductForm'
import type { ViewKey } from '@/store/uiSlice'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchNotifications, addNotification } from '@/store/notificationSlice'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const dispatch = useAppDispatch()
  const token = useAppSelector(state => state.auth.token?.access_token)

  // SSE & Notification connection
  useEffect(() => {
    dispatch(fetchNotifications())
    
    if (!token) return

    // SSE connection
    // Note: In development, Next.js strict mode might cause double connection. 
    // In production, one connection per client.
    let eventSource: EventSource | null = null;
    
    try {
        eventSource = new EventSource(`http://localhost:8000/v1/notifications/stream?token=${token}`)
        
        eventSource.onopen = () => {
            console.log("SSE Connected to Notification Stream")
        }

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                // Add to store
                dispatch(addNotification(data))
                
                // Optional: Play sound or toast
            } catch (e) {
                console.error("Failed to parse SSE notification:", e)
            }
        }
        
        eventSource.onerror = (e) => {
            console.error("SSE Connection Error. It might be closed or failed.", e)
            eventSource?.close()
        }
    } catch(e) {
        console.error("Failed to Initialize SSE", e)
    }

    return () => {
        if (eventSource) {
            console.log("Closing SSE Connection")
            eventSource.close()
        }
    }
  }, [token, dispatch])

  // Dynamic sidebar width based on collapsed state
  const sidebarWidth = isCollapsed ? '4rem' : '16rem'

  return (
    <div 
      className="min-h-screen bg-background transition-[padding] duration-300 ease-in-out"
      style={{ 
        '--sidebar-width': sidebarWidth 
      } as React.CSSProperties}
    >
      {/* Fixed sidebar rail for desktop */}
      <div 
        className="hidden md:block fixed left-0 top-0 h-full z-50 border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out" 
        style={{ width: 'var(--sidebar-width)' }}
      >
        <Sidebar 
          activeView={activeView} 
          onSelect={onSelectView} 
          userName={userName} 
          onUserAction={onUserAction}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Header - fixed at top */}
      <div className="fixed top-0 right-0 left-0 md:left-[var(--sidebar-width)] h-[var(--header-height)] z-40 transition-[left] duration-300 ease-in-out">
        <Header onOpenProduct={() => setOpenProduct(true)} onToggleSidebar={() => setSidebarOpen(s=>!s)} activeView={activeView} />
      </div>

      {/* Main content - offset by header + sidebar */}
      <main className="min-h-screen pt-[var(--header-height)] md:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out">
        <div className="px-6 py-6 h-full">
          {children}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={()=>setSidebarOpen(false)} />
          <div className="relative w-72 bg-sidebar text-sidebar-foreground h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar
              mobile
              activeView={activeView}
              userName={userName}
              onSelect={(view)=>{ onSelectView(view); setSidebarOpen(false) }}
              onUserAction={onUserAction}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <ProductForm open={openProduct} onClose={() => setOpenProduct(false)} />
    </div>
  )
}
