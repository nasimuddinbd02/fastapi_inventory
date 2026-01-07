"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authenticateUser, persistSession, SessionUser } from '@/lib/auth'
import { useAppDispatch } from '@/store/hooks'
import { setSession } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

interface LoginFormProps {
  onSuccess?: (user: SessionUser) => void
}

export default function LoginForm({ onSuccess }: LoginFormProps){
  const dispatch = useAppDispatch()
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const auth = await authenticateUser(loginName, password)
      persistSession(auth)
      dispatch(setSession(auth))
      dispatch(setActiveView('dashboard'))
      if (onSuccess) {
        onSuccess(auth.user)
      }
    } catch (err: any){
      const data = err?.response?.data
      
      // Handle custom ErrorResponse format
      if (data?.error?.message) {
        setError(data.error.message)
      } 
      // Handle standard FastAPI HTTPException (detail string)
      else if (typeof data?.detail === 'string') {
        setError(data.detail)
      }
      // Handle standard FastAPI Validation Error (detail array)
      else if (Array.isArray(data?.detail)) {
        const formatted = data.detail
          .map((item: any) => typeof item?.msg === 'string' ? item.msg : JSON.stringify(item))
          .join(' ')
        setError(formatted || 'Login failed')
      }
      // Fallback to legacy field message
      else if (data?.message) {
        setError(data.message)
      }
      // Fallback to generic error
      else {
        setError(err?.message || 'Login failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-name" className="text-sm font-medium">Username</Label>
        <Input
          id="login-name"
          placeholder="Enter your username"
          value={loginName}
          onChange={e=>setLoginName(e.target.value)}
          required
          className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
          <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
          className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
