"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignupForm'
import { SessionUser } from '@/lib/auth'

type AuthMode = 'login' | 'signup'

interface AuthPanelProps {
  onSuccess?: (user: SessionUser) => void
}

export default function AuthPanel({ onSuccess }: AuthPanelProps){
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="w-full">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-muted rounded-lg mb-8 relative">
        <div 
          className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] top-1 bg-background rounded-md shadow-sm transition-all duration-300 ease-in-out ${mode === 'login' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
        />
        <button
          onClick={() => setMode('login')}
          className={`flex-1 text-sm font-medium py-2.5 z-10 transition-colors duration-200 ${mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 text-sm font-medium py-2.5 z-10 transition-colors duration-200 ${mode === 'signup' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Create Account
        </button>
      </div>

      <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
        {mode === 'login' ? (
          <div className="space-y-4">
             <LoginForm onSuccess={onSuccess} />
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" disabled>
                  Google
                </Button>
                <Button variant="outline" type="button" disabled>
                  Microsoft
                </Button>
              </div>
          </div>
        ) : (
          <SignUpForm onSuccess={onSuccess} />
        )}
      </div>
    </div>
  )
}
