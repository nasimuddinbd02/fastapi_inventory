"use client"

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ClientAppShell from '@/components/ClientAppShell'
import DashboardView from '@/components/views/DashboardView'
import SettingsCategoriesView from '@/components/views/masterData/CategoriesView'
import SettingsSuppliersView from '@/components/views/masterData/SuppliersView'
import SettingsProductsView from '@/components/views/masterData/ProductsView'
import SettingsUsersView from '@/components/views/masterData/UsersView'
import IntakeView from '@/components/views/IntakeView'
import DispatchView from '@/components/views/DispatchView'
import { clearSession } from '@/lib/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearSessionState } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

export default function Home(){
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const activeView = useAppSelector(state => state.ui.activeView)

  const content = useMemo(()=>{
    switch(activeView){
      case 'intake':
        return <IntakeView />
      case 'dispatch':
        return <DispatchView />
      case 'settings.categories':
        return <SettingsCategoriesView />
      case 'settings.suppliers':
        return <SettingsSuppliersView />
      case 'settings.products':
        return <SettingsProductsView />
      case 'settings.users':
        return <SettingsUsersView />
      case 'settings':
        return (
          <div className="container">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-sm text-gray-500">Configuration options will appear here.</p>
          </div>
        )
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
      dispatch(setActiveView('dashboard'))
      return
    }
    if (action === 'edit'){
      dispatch(setActiveView('settings'))
      return
    }
  }

  return (
    <ClientAppShell
      activeView={activeView}
      onSelectView={(view)=> dispatch(setActiveView(view))}
      userName={user.name ?? 'User'}
      onUserAction={handleUserAction}
    >
      {content}
    </ClientAppShell>
  )
}
