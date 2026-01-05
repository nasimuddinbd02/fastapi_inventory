"use client"
import React, { useEffect, useRef, useState } from 'react'
import type { ViewKey } from '@/store/uiSlice'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

type NavItem = {
  key: string
  icon: string
  label: string
  view?: ViewKey
  children?: Array<{ key: ViewKey; label: string }>
}

const primaryNavItems: NavItem[] = [
  { key: 'dashboard', icon: '🏠', label: 'Home', view: 'dashboard' },
  { key: 'intake', icon: '📥', label: 'Intake', view: 'intake' },
  { key: 'dispatch', icon: '📤', label: 'Dispatch', view: 'dispatch' },
  {
    key: 'settings',
    icon: '⚙️',
    label: 'Settings',
    view: 'settings',
    children: [
      { key: 'settings.categories', label: 'Categories' },
      { key: 'settings.suppliers', label: 'Suppliers' },
      { key: 'settings.products', label: 'Products' },
      { key: 'settings.users', label: 'Users' }
    ]
  }
]

export default function Sidebar({ mobile, onNavigate, activeView, onSelect, userName, onUserAction }: SidebarProps){
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(()=>{
    function handleOutside(event: MouseEvent){
      if (menuRef.current && !menuRef.current.contains(event.target as Node)){
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(()=>{
    if (!openDropdown) return
    function handleOutside(event: MouseEvent){
      const current = dropdownRefs.current[openDropdown]
      if (current && !current.contains(event.target as Node)){
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [openDropdown])

  const displayName = userName || 'User'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <TooltipProvider delayDuration={300}>
      <aside className={(mobile ? 'w-64' : '') + ' h-full bg-sidebar text-sidebar-foreground flex flex-col'} style={{boxShadow:'0 0 0 1px var(--sidebar-border)', width: mobile ? undefined : 'var(--sidebar-width)'}}>
        <div className={(mobile ? 'flex flex-col p-3 gap-2 flex-1' : 'flex flex-col items-center py-4 space-y-3 flex-1') }>
          {primaryNavItems.map(item=>{
            const childActive = item.children?.some(child => child.key === activeView) ?? false
            const selfActive = item.view ? activeView === item.view : false
            const active = childActive || selfActive
            const base = mobile ? 'flex items-center gap-3 p-2 rounded' : 'flex items-center justify-center p-2 rounded'
            const cls = base + (active ? ' bg-primary text-primary-foreground' : ' hover:bg-gray-100')

            const handlePrimaryClick = () => {
              if (item.children && item.children.length > 0){
                setOpenDropdown(prev => (prev === item.key ? null : item.key))
                if (item.view){
                  onSelect?.(item.view)
                }
                if (!mobile && onNavigate){
                  onNavigate()
                }
                return
              }
              if (item.view){
                onSelect?.(item.view)
                onNavigate?.()
                setOpenDropdown(null)
              }
            }

            const showDropdown = openDropdown === item.key || (mobile && childActive)

            const buttonContent = (
              <button
                type="button"
                className={cls + ' w-full' + (mobile ? ' text-left' : '')}
                onClick={handlePrimaryClick}
              >
                <span aria-hidden="true">{item.icon}</span>
                {mobile ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
              </button>
            )

            return (
              <div
                key={item.key}
                ref={el => { dropdownRefs.current[item.key] = el }}
                className={mobile ? 'w-full' : 'w-full flex flex-col items-center relative'}
              >
                {!mobile ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  buttonContent
                )}

              {item.children && showDropdown && (
                mobile ? (
                  <div className="ml-8 mt-1 flex flex-col gap-1">
                    {item.children.map(child => {
                      const childSelected = activeView === child.key
                      const childCls = 'text-sm px-2 py-1 rounded' + (childSelected ? ' bg-gray-200 text-gray-900 font-medium' : ' hover:bg-gray-100')
                      return (
                        <button
                          key={child.key}
                          type="button"
                          className={childCls + ' text-left'}
                          onClick={()=>{
                            onSelect?.(child.key)
                            setOpenDropdown(null)
                            onNavigate?.()
                          }}
                        >
                          {child.label}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="absolute left-full ml-2 top-0 z-30 w-48">
                    <div className="bg-white text-foreground border rounded-md shadow-lg overflow-hidden">
                      {item.children.map(child => {
                        const childSelected = activeView === child.key
                        const childCls = 'w-full text-left px-3 py-2 text-sm' + (childSelected ? ' bg-primary text-primary-foreground' : ' hover:bg-gray-100')
                        return (
                          <button
                            key={child.key}
                            type="button"
                            className={childCls}
                            onClick={()=>{
                              onSelect?.(child.key)
                              setOpenDropdown(null)
                            }}
                          >
                            {child.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
      <div className={mobile ? 'p-3' : 'p-2'}>
        <div ref={menuRef} className={mobile ? 'relative' : 'relative flex flex-col items-center'}>
          {!mobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center gap-2 w-full rounded px-2 py-2 hover:bg-gray-100"
                  onClick={()=>setMenuOpen(o=>!o)}
                >
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {initial}
                  </div>
                  <span className="text-xs text-center text-sidebar-foreground w-full truncate">{displayName}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{displayName}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              className="flex items-center gap-3 w-full rounded px-3 py-2 hover:bg-gray-100"
              onClick={()=>setMenuOpen(o=>!o)}
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-gray-500">View account</p>
              </div>
            </button>
          )}
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
    </TooltipProvider>
  )
}
