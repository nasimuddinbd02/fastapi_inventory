"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientAppShell from '@/components/ClientAppShell'
import DashboardView from '@/components/views/DashboardView'
import SettingsCategoriesView from '@/components/views/masterData/CategoriesView'
import SettingsSuppliersView from '@/components/views/masterData/SuppliersView'
import SettingsProductsView from '@/components/views/masterData/ProductsView'
import SettingsUsersView from '@/components/views/masterData/UsersView'
import IntakeView from '@/components/views/IntakeView'
import DispatchView from '@/components/views/DispatchView'
import StockView from '@/components/views/StockView'
import StockLedgerView from '@/components/views/StockLedgerView'
import SettingsView from '@/components/views/SettingsView'
import ProfileDialog from '@/components/ProfileDialog'
import { clearSession } from '@/lib/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearSessionState } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

export default function Home(){
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const activeView = useAppSelector(state => state.ui.activeView)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [profileDialogTab, setProfileDialogTab] = useState<'profile' | 'contact' | 'help'>('profile')

  // Update page title based on active view
  useEffect(() => {
    const titleMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'intake': 'Inventory Intake',
      'dispatch': 'Inventory Dispatch',
      'stock': 'Stock Position',
      'ledger': 'Stock Ledger',
      'masterdata': 'Master Data',
      'masterdata.categories': 'Categories',
      'masterdata.suppliers': 'Suppliers',
      'masterdata.products': 'Products',
      'masterdata.users': 'Users',
      'settings': 'Settings'
    }

    const pageTitle = titleMap[activeView] || 'Dashboard'
    const fullTitle = `AI Base Inventory Management System [${pageTitle}]`
    
    // Set immediately
    document.title = fullTitle
    
    // Also set after a small delay in case something overwrites it
    const timer = setTimeout(() => {
      document.title = fullTitle
    }, 100)
    
    return () => clearTimeout(timer)
  }, [activeView])

  const content = useMemo(()=>{
    switch(activeView){
      case 'intake':
        return <IntakeView />
      case 'dispatch':
        return <DispatchView />
      case 'stock':
        return <StockView />
      case 'ledger':
        return <StockLedgerView />
      case 'masterdata.categories':
        return <SettingsCategoriesView />
      case 'masterdata.suppliers':
        return <SettingsSuppliersView />
      case 'masterdata.products':
        return <SettingsProductsView />
      case 'masterdata.users':
        return <SettingsUsersView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }, [activeView])

  // AuthGuard will handle the authentication check and redirect
  // This component only renders when user is authenticated
  if (!user) {
    return null
  }

  function handleUserAction(action: string){
    if (action === 'logout'){
      clearSession()
      dispatch(clearSessionState())
      dispatch(setActiveView('dashboard'))
      router.replace('/login')
      return
    }
    if (action === 'profile'){
      setProfileDialogTab('profile')
      setProfileDialogOpen(true)
      return
    }
    if (action === 'help'){
      setProfileDialogTab('help')
      setProfileDialogOpen(true)
      return
    }
  }

  return (
    <>
      <ClientAppShell
        activeView={activeView}
        onSelectView={(view)=> dispatch(setActiveView(view))}
        userName={user.name ?? 'User'}
        onUserAction={handleUserAction}
      >
        {content}
      </ClientAppShell>
      
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        initialTab={profileDialogTab}
      />
    </>
  )
}
