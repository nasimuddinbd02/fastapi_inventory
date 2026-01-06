"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toastError } from '@/lib/toast-messages'

/**
 * Client component to handle authentication expiry events
 */
export function AuthExpiryHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthExpired = () => {
      toastError.unauthorized()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:expired', handleAuthExpired)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:expired', handleAuthExpired)
      }
    }
  }, [router])

  return null
}
