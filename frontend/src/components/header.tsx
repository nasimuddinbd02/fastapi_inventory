"use client"
import React from 'react'
import type { ViewKey } from '@/store/uiSlice'
import { useSettings } from '@/hooks/use-settings'
import { 
  Package, 
  Bell, 
  Search, 
  Menu,
  ChevronRight,
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
  Slash,
  User,
  Command,
  HelpCircle,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificationMenu from './NotificationMenu'

const pageConfig: Record<ViewKey, { title: string; icon: React.ReactNode; parent?: string }> = {
  'dashboard': { title: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  'intake': { title: 'Inventory Intake', icon: <ArrowDownToLine className="w-4 h-4" /> },
  'dispatch': { title: 'Inventory Dispatch', icon: <ArrowUpFromLine className="w-4 h-4" /> },
  'stock': { title: 'Stock Position', icon: <BarChart3 className="w-4 h-4" /> },
  'ledger': { title: 'Stock Ledger', icon: <ClipboardList className="w-4 h-4" /> },
  'masterdata': { title: 'Master Data', icon: <Box className="w-4 h-4" /> },
  'masterdata.categories': { title: 'Categories', icon: <Tag className="w-4 h-4" />, parent: 'Master Data' },
  'masterdata.suppliers': { title: 'Suppliers', icon: <Building2 className="w-4 h-4" />, parent: 'Master Data' },
  'masterdata.products': { title: 'Products', icon: <Box className="w-4 h-4" />, parent: 'Master Data' },
  'masterdata.users': { title: 'Users', icon: <Users className="w-4 h-4" />, parent: 'Master Data' },
  'settings': { title: 'Settings', icon: <Settings className="w-4 h-4" /> },
  'help': { title: 'Help & Tools', icon: <HelpCircle className="w-4 h-4" /> },
  'ai.insights': { title: 'AI Intelligence', icon: <Brain className="w-4 h-4" /> },
  'profile': { title: 'Account Settings', icon: <User className="w-4 h-4" /> }
}

type HeaderProps = {
  onOpenProduct?: () => void
  onToggleSidebar?: () => void
  activeView?: ViewKey
}

export default function Header({ onOpenProduct, onToggleSidebar, activeView = 'dashboard' }: HeaderProps){
  const { companyName } = useSettings()
  const config = pageConfig[activeView] || pageConfig.dashboard
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6 flex h-16 items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu + Logo + Breadcrumbs */}
        <div className="flex items-center gap-4 lg:gap-8">
          
          {/* Mobile Menu */}
          <button 
            onClick={() => onToggleSidebar?.()} 
            className="lg:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:bg-muted/50 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-sm text-primary-foreground transform transition-transform hover:scale-105">
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
              <div className="hidden md:flex flex-col justify-center">
                <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                  {companyName || 'Inventory Mastery'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                  Workspace
                </span>
              </div>
            </div>

            {/* Separator / Breadcrumbs */}
            <div className="hidden md:flex items-center h-5 w-px bg-border/60 mx-2" />

            <nav className="hidden md:flex items-center text-sm font-medium">
              {config.parent && (
                <div className="flex items-center text-muted-foreground">
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    {config.parent}
                  </span>
                  <Slash className="w-[10px] h-[10px] mx-2 text-muted-foreground/40 -rotate-[15deg]" />
                </div>
              )}
              <div className="flex items-center gap-2 text-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/40">
                <span className="text-primary/80">{config.icon}</span>
                <span>{config.title}</span>
              </div>
            </nav>
          </div>
        </div>
        
        {/* Right Section: Search + Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Search Bar */}
          <button 
            className="group hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-muted/20 hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 w-full sm:w-56 lg:w-72"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary/70 transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">Search...</span>
            <kbd className="hidden lg:inline-flex ml-auto items-center gap-1 h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background/50 border border-border/50 rounded shadow-sm font-mono">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          
          <div className="flex items-center gap-2 border-l border-border/60 pl-4">
            {/* Notifications */}
            {/* Notifications */}
            <NotificationMenu />
            
            {/* Profile Avatar Trigger - Removed as per user request to use Sidebar for profile actions */}
            {/* 
            <button 
              className="flex items-center justify-center p-0.5 rounded-full border border-border hover:border-primary/50 transition-colors ring-offset-background ml-1"
              aria-label="User Profile"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center overflow-hidden">
                 <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </button> 
            */}
          </div>
          
          {/* Mobile Page Title (Visible only on mobile) */}
          <div className="md:hidden flex items-center gap-2 text-sm font-medium mr-2">
             <span className="text-primary">{config.icon}</span>
          </div>

        </div>
      </div>
    </header>
  )
}
