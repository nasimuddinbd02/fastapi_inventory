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
  Settings
} from 'lucide-react'

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
  'settings': { title: 'Settings', icon: <Settings className="w-4 h-4" /> }
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
    <header className="bg-header border-b border-border h-14 flex items-center sticky top-0 z-40 shadow-sm backdrop-blur-sm bg-opacity-95">
      <div className="w-full px-4 flex items-center justify-between">
        {/* Left Section: Logo, Company & Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button 
            onClick={() => onToggleSidebar?.()} 
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-header-foreground" />
          </button>
          
          {/* Logo & Company Name */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-header-foreground leading-tight">
                {companyName || 'Inventory Pro'}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Management System
              </span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-border mx-1" />
          
          {/* Breadcrumb Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            {config.parent && (
              <>
                <span className="text-muted-foreground">{config.parent}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
              <span className="text-primary">{config.icon}</span>
              <span className="font-medium text-header-foreground">{config.title}</span>
            </div>
          </nav>
        </div>
        
        {/* Right Section: Search, Notifications, Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button 
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors text-sm text-muted-foreground"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background rounded border border-border">
              ⌘K
            </kbd>
          </button>
          
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-header-foreground" />
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          </button>
          
          {/* Mobile Page Title */}
          <div className="md:hidden flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
            <span className="text-primary">{config.icon}</span>
            <span className="text-sm font-medium text-header-foreground truncate max-w-[100px]">
              {config.title}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
