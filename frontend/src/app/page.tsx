"use client"

import React, { useEffect, useMemo } from 'react'
import ClientAppShell from '@/components/ClientAppShell'
import DashboardView from '@/components/views/DashboardView'
import ProductsView from '@/components/views/ProductsView'
import AuthPanel from '@/components/auth/AuthPanel'
import { clearSession, readSession } from '@/lib/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { hydrateSession, clearSessionState } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

export default function Home(){
  const dispatch = useAppDispatch()
  const { user, initialized } = useAppSelector(state => state.auth)
  const activeView = useAppSelector(state => state.ui.activeView)

  useEffect(()=>{
    const session = readSession()
    dispatch(hydrateSession(session))
    if (session){
      dispatch(setActiveView('dashboard'))
    }
  }, [dispatch])

  const content = useMemo(()=>{
    switch(activeView){
      case 'products':
        return <ProductsView />
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

  if (!initialized) return null

  if (!user){
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <AuthPanel />
        </div>
      </div>
    )
  }

  function handleUserAction(action: string){
    if (action === 'logout'){
      clearSession()
      dispatch(clearSessionState())
      dispatch(setActiveView('dashboard'))
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
