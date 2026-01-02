"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { API_BASE_URL, authenticateUser, persistSession } from '@/lib/auth'
import axios from 'axios'
import { useAppDispatch } from '@/store/hooks'
import { setSession } from '@/store/authSlice'
import { setActiveView } from '@/store/uiSlice'

export default function SignUpForm(){
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
        `${API_BASE_URL}/users/`,
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
    } catch (err: any){
      const detail = err?.response?.data?.detail
      if (Array.isArray(detail)){
        const joined = detail
          .map((item: any) => typeof item?.msg === 'string' ? item.msg : JSON.stringify(item))
          .join(' ')
        setError(joined || 'Account creation failed')
      } else if (typeof detail === 'string') {
        setError(detail)
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err?.message || 'Account creation failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signup-login-name">Login name</Label>
        <Input
          id="signup-login-name"
          value={loginName}
          onChange={e=>setLoginName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-display-name">Display name</Label>
        <Input
          id="signup-display-name"
          value={displayName}
          onChange={e=>setDisplayName(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm-password">Confirm password</Label>
        <Input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={e=>setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox
          id="signup-accept-terms"
          checked={acceptTerms}
          onCheckedChange={value=>setAcceptTerms(value === true)}
        />
        <Label htmlFor="signup-accept-terms" className="text-sm font-normal">
          I accept the terms and conditions
        </Label>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>
  )
}
