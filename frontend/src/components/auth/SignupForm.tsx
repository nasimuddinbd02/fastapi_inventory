"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authenticateUser, persistSession, SessionUser } from '@/lib/auth'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import axios from 'axios'
import { useAppDispatch } from '@/store/hooks'
import { setSession } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

interface SignUpFormProps {
  onSuccess?: (user: SessionUser) => void
}

export default function SignUpForm({ onSuccess }: SignUpFormProps){
  const dispatch = useAppDispatch()
  const [loginName, setLoginName] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function runLocalValidation(){
    if (loginName.trim().length < 3){
      return 'Login name must be at least 3 characters'
    }
    if (!/^[A-Za-z0-9_-]+$/.test(loginName.trim())){
      return 'Login name can only include letters, numbers, underscores, and hyphens'
    }
    if (password !== confirmPassword){
      return 'Passwords do not match'
    }
    if (!acceptTerms){
      return 'You must accept the terms to continue'
    }
    return ''
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    const validationMessage = runLocalValidation()
    if (validationMessage){
      setError(validationMessage)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await axios.post(
        buildApiUrl(API_ENDPOINTS.SIGNUP),
        {
          login_name: loginName,
          email_address: email,
          display_name: displayName || loginName,
          password,
          confirm_password: confirmPassword,
          accept_terms: acceptTerms
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

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
        const joined = data.detail
          .map((item: any) => typeof item?.msg === 'string' ? item.msg : JSON.stringify(item))
          .join(' ')
        setError(joined || 'Account creation failed')
      }
      // Fallback to legacy field message
      else if (data?.message) {
        setError(data.message)
      }
      // Fallback to generic error
      else {
        setError(err?.message || 'Account creation failed')
      }
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="signup-login-name" className="text-sm font-medium">Username</Label>
            <Input
            id="signup-login-name"
            placeholder="johndoe"
            value={loginName}
            onChange={e=>setLoginName(e.target.value)}
            required
            className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="signup-display-name" className="text-sm font-medium">Display Name</Label>
            <Input
            id="signup-display-name"
            value={displayName}
            onChange={e=>setDisplayName(e.target.value)}
            placeholder="John Doe"
            className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
            />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
          className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signup-password"className="text-sm font-medium">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
              className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password"className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="signup-confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e=>setConfirmPassword(e.target.value)}
              required
              className="h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-all duration-200"
            />
          </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <Checkbox
          id="signup-accept-terms"
          checked={acceptTerms}
          onCheckedChange={value=>setAcceptTerms(value === true)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label htmlFor="signup-accept-terms" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
          I agree to the <span className="text-primary hover:underline">Terms of Service</span> and <span className="text-primary hover:underline">Privacy Policy</span>
        </Label>
      </div>
      
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
        </div>
      )}
      
      <Button type="submit" disabled={submitting} className="w-full h-11 font-medium text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
        {submitting ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}
