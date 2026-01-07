"use client"
import React, { useEffect, useRef, useState } from 'react'
import type { ViewKey } from '@/store/uiSlice'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  ClipboardList,
  Tag,
  Building2,
  Box,
  Users,
  Settings,
  LogOut,
  User,
  ChevronUp,
  Shield,
  HelpCircle,
  Brain,
  type LucideIcon
} from 'lucide-react'

type SidebarProps = {
  mobile?: boolean
  onNavigate?: () => void
  activeView: ViewKey
  onSelect?: (view: ViewKey) => void
  userName?: string | null
  onUserAction?: (action: string) => void
}

type UserMenuItem = {
  key: string
  label: string
  icon: LucideIcon
  danger?: boolean
}

const userMenuItems: UserMenuItem[] = [
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'help', label: 'Help & Support', icon: HelpCircle },
  { key: 'logout', label: 'Sign Out', icon: LogOut, danger: true }
]

type NavItem = {
  key: string
  icon: LucideIcon
  label: string
  view?: ViewKey
}

type NavSection = {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    // Main Navigation
    items: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
    ]
  },
  {
    title: 'Transactions',
    items: [
      { key: 'intake', icon: ArrowDownToLine, label: 'Intake', view: 'intake' },
      { key: 'dispatch', icon: ArrowUpFromLine, label: 'Dispatch', view: 'dispatch' },
    ]
  },
  {
    title: 'Reports',
    items: [
      { key: 'stock', icon: BarChart3, label: 'Stock Position', view: 'stock' },
      { key: 'ledger', icon: ClipboardList, label: 'Stock Ledger', view: 'ledger' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { key: 'ai.insights', icon: Brain, label: 'AI Insights', view: 'ai.insights' },
    ]
  },
  {
    title: 'Master Data',
    items: [
      { key: 'masterdata.categories', icon: Tag, label: 'Categories', view: 'masterdata.categories' },
      { key: 'masterdata.suppliers', icon: Building2, label: 'Suppliers', view: 'masterdata.suppliers' },
      { key: 'masterdata.products', icon: Box, label: 'Products', view: 'masterdata.products' },
      { key: 'masterdata.users', icon: Users, label: 'Users', view: 'masterdata.users' },
    ]
  },
  {
    title: 'System',
    items: [
      { key: 'settings', icon: Settings, label: 'Settings', view: 'settings' },
    ]
  }
]

export default function Sidebar({ mobile, onNavigate, activeView, onSelect, userName, onUserAction }: SidebarProps){
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
  
  // Generate a consistent avatar color based on username
  const avatarColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500'
  ]
  const colorIndex = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length
  const avatarColor = avatarColors[colorIndex]

  const handleItemClick = (view: ViewKey) => {
    onSelect?.(view)
    onNavigate?.()
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside 
        className={`${mobile ? 'w-64' : ''} h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200`}
        style={{
          boxShadow: '1px 0 0 0 var(--sidebar-border)',
          width: mobile ? undefined : 'var(--sidebar-width)'
        }}
      >
        {/* Navigation */}
        <nav className={`${mobile ? 'flex flex-col p-2 gap-0.5 flex-1 overflow-y-auto' : 'flex flex-col items-center py-3 space-y-0.5 flex-1 overflow-y-auto'}`}>
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="w-full">
              {/* Section Title - only show in mobile mode */}
              {mobile && section.title && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {section.title}
                </div>
              )}
              
              {/* Section Items */}
              {section.items.map(item => {
                const active = item.view ? activeView === item.view : false
                const IconComponent = item.icon

                const buttonContent = (
                  <button
                    type="button"
                    className={`
                      ${mobile 
                        ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left' 
                        : 'flex items-center justify-center w-10 h-10 rounded-xl'
                      }
                      transition-all duration-150 group
                      ${active 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-sidebar-foreground hover:text-foreground'
                      }
                    `}
                    onClick={() => item.view && handleItemClick(item.view)}
                  >
                    <IconComponent 
                      className={`
                        w-5 h-5
                        ${active ? '' : 'group-hover:scale-110'}
                        transition-transform duration-150
                      `}
                    />
                    {mobile ? (
                      <span className="truncate font-medium">{item.label}</span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </button>
                )

                return (
                  <div key={item.key} className={mobile ? 'w-full' : 'w-full flex flex-col items-center px-2'}>
                    {!mobile ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      buttonContent
                    )}
                  </div>
                )
              })}
              
              {/* Divider between sections */}
              {sectionIndex < navSections.length - 1 && (
                <div className={`${mobile ? 'mx-3 my-2' : 'mx-auto my-2 w-6'} h-px bg-border/60`} />
              )}
            </div>
          ))}
        </nav>
        
        {/* User Profile Section */}
        <div className="p-2 border-t border-border/60">
          <div ref={menuRef} className={mobile ? 'relative' : 'relative flex flex-col items-center'}>
            {!mobile ? (
              /* Desktop: Compact User Button */
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`
                      flex flex-col items-center gap-1.5 w-full rounded-xl px-2 py-2.5
                      hover:bg-slate-100 dark:hover:bg-slate-800 
                      transition-all duration-150 group
                      ${menuOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}
                    `}
                    onClick={() => setMenuOpen(o => !o)}
                  >
                    <div className={`
                      relative h-9 w-9 rounded-full ${avatarColor} 
                      flex items-center justify-center text-white text-sm font-semibold
                      ring-2 ring-offset-2 ring-offset-sidebar ring-transparent
                      group-hover:ring-primary/30 transition-all duration-150
                    `}>
                      {initial}
                      {/* Online indicator */}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-sidebar" />
                    </div>
                    <ChevronUp className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${menuOpen ? '' : 'rotate-180'}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <p>{displayName}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              /* Mobile: Full User Card */
              <button
                type="button"
                className={`
                  flex items-center gap-3 w-full rounded-xl px-3 py-3
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  transition-all duration-150
                  ${menuOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}
                `}
                onClick={() => setMenuOpen(o => !o)}
              >
                <div className={`
                  relative h-10 w-10 rounded-full ${avatarColor}
                  flex items-center justify-center text-white text-sm font-semibold
                  flex-shrink-0
                `}>
                  {initial}
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-sidebar" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Administrator</span>
                  </p>
                </div>
                <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${menuOpen ? '' : 'rotate-180'}`} />
              </button>
            )}
            
            {/* User Dropdown Menu */}
            {menuOpen && (
              <div 
                className={`
                  ${mobile ? 'absolute left-0 right-0 bottom-full mb-2' : 'absolute left-full ml-2 bottom-0'}
                  animate-in fade-in-0 zoom-in-95 duration-150
                `}
              >
                <div className="bg-popover text-popover-foreground border border-border rounded-xl shadow-lg overflow-hidden min-w-[200px]">
                  {/* User Info Header */}
                  <div className="px-3 py-3 border-b border-border bg-muted/30">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    {userMenuItems.map((item) => {
                      const IconComponent = item.icon
                      
                      return (
                        <React.Fragment key={item.key}>
                          {item.danger && <div className="h-px bg-border mx-2 my-1" />}
                          <button
                            type="button"
                            className={`
                              w-full text-left px-3 py-2.5 text-sm
                              flex items-center gap-3
                              transition-colors duration-150
                              ${item.danger 
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30' 
                                : 'hover:bg-muted'
                              }
                            `}
                            onClick={() => {
                              setMenuOpen(false)
                              onUserAction?.(item.key)
                              onNavigate?.()
                            }}
                          >
                            <IconComponent className={`w-4 h-4 ${item.danger ? '' : 'text-muted-foreground'}`} />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
