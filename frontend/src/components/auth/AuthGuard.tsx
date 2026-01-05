"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { hydrateSession } from '@/store/authSlice'
import { readSession } from '@/lib/auth'

type AuthGuardProps = {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user, initialized } = useAppSelector(state => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Hydrate session from storage
    const session = readSession()
    dispatch(hydrateSession(session))
    setIsChecking(false)
  }, [dispatch])

  useEffect(() => {
    if (!isChecking && initialized) {
      // Public routes that don't require authentication
      const publicRoutes = ['/login']
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        router.replace('/login')
      } else if (user && pathname === '/login') {
        // User is authenticated but on login page, redirect to home
        router.replace('/')
      }
    }
  }, [user, initialized, isChecking, pathname, router])

  // Show loading state while checking authentication
  if (isChecking || !initialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
