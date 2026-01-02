"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authenticateUser, persistSession } from '@/lib/auth'
import { useAppDispatch } from '@/store/hooks'
import { setSession } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

export default function LoginForm(){
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
    } catch (err: any){
      const detail = err?.response?.data?.detail
      if (Array.isArray(detail)){
        const formatted = detail
          .map((item: any) => typeof item?.msg === 'string' ? item.msg : JSON.stringify(item))
          .join(' ')
        setError(formatted || 'Login failed')
      } else if (typeof detail === 'string') {
        setError(detail)
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err?.message || 'Login failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-name">Login name</Label>
        <Input
          id="login-name"
          value={loginName}
          onChange={e=>setLoginName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
