"use client"
import React, { useEffect, useRef, useState } from 'react'
import type { ViewKey } from '@/store/uiSlice'

type SidebarProps = {
  mobile?: boolean
  onNavigate?: () => void
  activeView: ViewKey
  onSelect?: (view: ViewKey) => void
  userName?: string | null
  onUserAction?: (action: string) => void
}

const userMenuItems = [
  { key: 'profile', label: 'Profile' },
  { key: 'edit', label: 'Edit Profile' },
  { key: 'logout', label: 'Log out' }
]

export default function Sidebar({ mobile, onNavigate, activeView, onSelect, userName, onUserAction }: SidebarProps){
  const items: Array<{ key: ViewKey; icon: string; label: string }> = [
    { key: 'dashboard', icon: '🏠', label: 'Home' },
    { key: 'products', icon: '📦', label: 'Products' },
    { key: 'settings', icon: '⚙️', label: 'Settings' }
  ]

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(()=>{
    function handleOutside(event: MouseEvent){
      if (menuRef.current && !menuRef.current.contains(event.target as Node)){
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const displayName = userName || 'User'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <aside className={(mobile ? 'w-64' : 'w-12') + ' h-full bg-sidebar text-sidebar-foreground flex flex-col'} style={{boxShadow:'0 0 0 1px var(--sidebar-border)'}}>
      <div className={(mobile ? 'flex flex-col p-3 gap-2 flex-1' : 'flex flex-col items-center py-4 space-y-3 flex-1') }>
        {items.map(it=>{
          const active = activeView === it.key
          const base = mobile ? 'flex items-center gap-3 p-2 rounded' : 'flex items-center justify-center p-2 rounded'
          const cls = base + (active ? ' bg-primary text-primary-foreground' : ' hover:bg-gray-100')
          return (
            <button
              key={it.key}
              type="button"
              className={cls + ' w-full' + (mobile ? ' text-left' : '')}
              onClick={()=>{
                onSelect?.(it.key)
                onNavigate?.()
              }}
            >
              <span aria-hidden="true">{it.icon}</span>
              {mobile && <span className="truncate">{it.label}</span>}
            </button>
          )
        })}
      </div>
      <div className={mobile ? 'p-3' : 'p-2'}>
        <div ref={menuRef} className={mobile ? 'relative' : 'relative flex flex-col items-center'}>
          <button
            type="button"
            className={(mobile ? 'flex items-center gap-3 w-full rounded px-3 py-2 hover:bg-gray-100' : 'flex flex-col items-center gap-2 w-full rounded px-2 py-2 hover:bg-gray-100')}
            onClick={()=>setMenuOpen(o=>!o)}
          >
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            {mobile ? (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-gray-500">View account</p>
              </div>
            ) : (
              <span className="text-xs text-center text-sidebar-foreground w-full truncate">{displayName}</span>
            )}
          </button>
          {menuOpen && (
            <div className={(mobile ? 'absolute left-0 right-0 mt-2' : 'absolute left-full ml-2 bottom-0')}>
              <div className="bg-white text-foreground border rounded-md shadow-lg overflow-hidden min-w-[160px]">
                {userMenuItems.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={()=>{
                      setMenuOpen(false)
                      onUserAction?.(item.key)
                      onNavigate?.()
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
