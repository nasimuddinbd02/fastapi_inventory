"use client"

import React from 'react'
import AuthPanel from '@/components/auth/AuthPanel'
import { SessionUser } from '@/lib/auth'

export default function LoginPage(){
  function handleSuccess(_user: SessionUser){
    if (typeof window !== 'undefined'){
      window.location.replace('/')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AuthPanel onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
