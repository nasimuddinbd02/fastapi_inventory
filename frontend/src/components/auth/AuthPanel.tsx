"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'

type AuthMode = 'login' | 'signup'

export default function AuthPanel(){
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <Card className="flex w-full max-w-md flex-col gap-6">
      <CardContent className="space-y-4 pt-6">
        {mode === 'login' ? (
          <LoginForm />
        ) : (
          <SignUpForm />
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center justify-center">
          {mode === 'login' ? (
            <Button type="button" variant="ghost" onClick={()=>setMode('signup')}>
              Need an account? Sign up
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={()=>setMode('login')}>
              Already registered? Login
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
