"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import AuthPanel from '@/components/auth/AuthPanel'
import { SessionUser } from '@/lib/auth'

export default function LoginPage(){
  const router = useRouter()

  function handleSuccess(_user: SessionUser){
    // Redirect to home page after successful login
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AuthPanel onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
