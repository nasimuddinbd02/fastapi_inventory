"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

/**
 * Client component to handle authentication expiry events
 */
export function AuthExpiryHandler() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>
      
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: customEvent.detail?.message || 'Your session has expired. Please login again.',
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:expired', handleAuthExpired)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:expired', handleAuthExpired)
      }
    }
  }, [router, toast])

  return null
}
