"use client"
import React from 'react'
import type { ViewKey } from '@/store/uiSlice'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  HelpCircle,
  Brain,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  MoreVertical,
  FlaskConical,
  Database,
  LineChart,
  type LucideIcon,
  ShoppingBag,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SidebarProps = {
  mobile?: boolean
  onNavigate?: () => void
  activeView: ViewKey
  onSelect?: (view: ViewKey) => void
  userName?: string | null
  onUserAction?: (action: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

type NavItem = {
  key: string
  icon: LucideIcon
  label: string
  view?: ViewKey
  badge?: string // e.g., 'TRIAL'
}

type NavSection = {
  title?: string
  items: NavItem[]
  collapsed?: boolean // internal UI state if we wanted collapsible sections
}

const navSections: NavSection[] = [
  {
    items: [
       // Search is handled separately in the UI, or could be here
    ]
  },
  {
    title: 'Operations',
    items: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
      { key: 'intake', icon: ArrowDownToLine, label: 'Intake', view: 'intake' },
      { key: 'dispatch', icon: ArrowUpFromLine, label: 'Dispatch', view: 'dispatch' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { key: 'stock', icon: LineChart, label: 'Stock Balance', view: 'stock' },
      { key: 'ledger', icon: Database, label: 'Stock Ledger', view: 'ledger' },
      { key: 'ai.insights', icon: Brain, label: 'AI Intelligence', view: 'ai.insights' },
    ]
  },
  {
    title: 'Data',
    items: [
      { key: 'masterdata.categories', icon: Tag, label: 'Categories', view: 'masterdata.categories' },
      { key: 'masterdata.suppliers', icon: Building2, label: 'Suppliers', view: 'masterdata.suppliers' },
      { key: 'masterdata.products', icon: Package, label: 'Products', view: 'masterdata.products' },
      { key: 'masterdata', icon: Users, label: 'Users & Sessions', view: 'masterdata.users' },
    ]
  }
]

export default function Sidebar({ 
  mobile, 
  onNavigate, 
  activeView, 
  onSelect, 
  userName, 
  onUserAction,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps){

  const displayName = userName || 'User'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'
  
  // Avatar logic
  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500']
  const colorIndex = displayName.length % avatarColors.length
  const avatarColor = avatarColors[colorIndex]

  const handleItemClick = (view: ViewKey) => {
    onSelect?.(view)
    onNavigate?.()
  }

  // Helper to render a nav item
  const renderNavItem = (item: NavItem) => {
    const active = item.view ? activeView === item.view : false
    const IconComponent = item.icon

    return (
      <button
        key={item.key}
        onClick={() => item.view && handleItemClick(item.view)}
        className={cn(
          "group flex items-center w-full text-left rounded-md transition-all duration-200",
          // Collapsed vs Expanded sizing
          isCollapsed && !mobile ? "justify-center p-2" : "gap-3 px-3 py-2",
          // Active state
          active 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <IconComponent size={20} className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        
        {(!isCollapsed || mobile) && (
          <div className="flex flex-1 items-center justify-between overflow-hidden">
            <span className="truncate text-sm">{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-sm uppercase">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </button>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "flex flex-col h-full bg-sidebar/50 backdrop-blur-xl",
        mobile ? "w-full" : "w-full"
      )}>
        
        {/* Header: Logo area */}
        <div className={cn(
          "flex items-center h-16 border-b border-border/40 transition-all duration-300",
          isCollapsed && !mobile ? "justify-center px-0" : "px-4 gap-3"
        )}>
          {/* Custom Logo */}
          <div className="flex items-center justify-center shrink-0">
             <div className="bg-primary text-primary-foreground rounded-lg p-1.5 shadow-sm">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-primary-foreground"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
             </div>
          </div>
          
          {(!isCollapsed || mobile) && (
            <span className="font-bold text-lg tracking-tight text-foreground truncate animate-in fade-in duration-300">
              Inventory Mastery
            </span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">


          <nav className="space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="px-2">
                {/* Section Title (only expanded) */}
                {section.title && (!isCollapsed || mobile) && (
                  <h4 className="px-2 mb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
                    {section.title}
                  </h4>
                )}
                
                <div className="space-y-1">
                  {section.items.map(item => {
                    if (isCollapsed && !mobile) {
                      return (
                        <Tooltip key={item.key}>
                          <TooltipTrigger asChild>
                            {renderNavItem(item)}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-medium bg-foreground text-background">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }
                    return renderNavItem(item)
                  })}
                </div>
                {/* Separator for collapsed state */}
                {isCollapsed && !mobile && idx < navSections.length - 1 && (
                  <div className="h-px w-full bg-border/50 my-2 mx-auto" />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions: Settings, Help, User, Toggle */}
        <div className="mt-auto border-t border-border/40 bg-muted/5 space-y-1 p-2">
          
          {/* Settings & Help */}
          {[
             { key: 'settings', label: 'Settings', icon: Settings, view: 'settings' as const },
             { key: 'help', label: 'Help & Tools', icon: HelpCircle, view: 'help' as const }
          ].map((item) => {
            const btn = (
              <button 
                key={item.key} 
                onClick={() => item.view ? handleItemClick(item.view) : undefined}
                className={cn(
                  "flex items-center w-full rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                  isCollapsed && !mobile ? "justify-center p-2" : "gap-3 px-3 py-2"
              )}>
                <item.icon size={18} />
                {(!isCollapsed || mobile) && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
            return isCollapsed && !mobile 
              ? <Tooltip key={item.key}><TooltipTrigger asChild>{btn}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip>
              : btn
          })}

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn(
                "mt-2 mb-1 flex items-center rounded-md hover:bg-muted/60 transition-colors cursor-pointer outline-none",
                isCollapsed && !mobile ? "justify-center p-2" : "gap-3 px-3 py-2"
              )}>
                <div className={cn(
                  "relative flex items-center justify-center rounded-full text-white text-xs font-medium bg-indigo-500 shrink-0",
                  isCollapsed && !mobile ? "w-8 h-8" : "w-7 h-7"
                )}>
                  {initial}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-sidebar rounded-full"></span>
                </div>
                
                {(!isCollapsed || mobile) && (
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">Admin Workspace</p>
                  </div>
                )}
                
                {(!isCollapsed || mobile) && (
                  <MoreVertical size={16} className="text-muted-foreground" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side={isCollapsed && !mobile ? "right" : "top"} 
              align={isCollapsed && !mobile ? "start" : "center"}
              className="w-56"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUserAction?.('profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onUserAction?.('logout')}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collapse Toggle */}
          {!mobile && (
            <button
              onClick={onToggleCollapse}
              className={cn(
                "w-full flex items-center text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 border-t border-border/10 mt-1",
                isCollapsed ? "justify-center" : "px-3 gap-3"
              )}
            >
               {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center"><ChevronLeft size={18} /></div>}
               {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
            </button>
          )}

        </div>
      </aside>
    </TooltipProvider>
  )
}
