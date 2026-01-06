"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toastSuccess, toastValidation, handleApiError } from '@/lib/toast-messages'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import { useAppSelector } from '@/store/hooks'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { FormSection, FormField, FormRow, FormActions, RequiredMark } from '@/components/ui/form-section'
import { User, Mail, Lock, Shield, Loader2, Save, X, UserCircle } from 'lucide-react'

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: {
    id?: number | string
    login_name: string
    email_address?: string | null
    display_name?: string | null
  } | null
}

export function UserForm({ open, onOpenChange, editData }: UserFormProps) {
  const [loginName, setLoginName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = useAppSelector(state => state.auth.token)

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setLoginName(editData.login_name || '')
      setEmailAddress(editData.email_address || '')
      setDisplayName(editData.display_name || '')
      // Don't populate password when editing
      setPassword('')
      setConfirmPassword('')
      setAcceptTerms(false)
    } else {
      setLoginName('')
      setEmailAddress('')
      setDisplayName('')
      setPassword('')
      setConfirmPassword('')
      setAcceptTerms(false)
    }
  }, [editData, open])

  const handleClose = () => {
    setLoginName('')
    setEmailAddress('')
    setDisplayName('')
    setPassword('')
    setConfirmPassword('')
    setAcceptTerms(false)
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate login name
    if (!loginName.trim() || loginName.trim().length < 3) {
      toastValidation.minLength('Login name', 3)
      return
    }

    // Check if login name is alphanumeric
    const alphanumericRegex = /^[a-zA-Z0-9]+$/
    if (!alphanumericRegex.test(loginName.trim())) {
      toastValidation.custom('Invalid Format', 'Login name must contain only letters and numbers')
      return
    }

    // Validate email
    if (!emailAddress.trim()) {
      toastValidation.required('Email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress.trim())) {
      toastValidation.invalidEmail()
      return
    }

    // Validate password (only required when creating new user)
    if (!editData) {
      if (!password) {
        toastValidation.required('Password')
        return
      }

      if (password.length < 6) {
        toastValidation.minLength('Password', 6)
        return
      }

      // Validate confirm password
      if (password !== confirmPassword) {
        toastValidation.passwordMismatch()
        return
      }

      // Validate terms acceptance
      if (!acceptTerms) {
        toastValidation.termsRequired()
        return
      }
    } else {
      // When editing, only validate password if it's being changed
      if (password || confirmPassword) {
        if (password.length < 6) {
          toastValidation.minLength('Password', 6)
          return
        }

        if (password !== confirmPassword) {
          toastValidation.passwordMismatch()
          return
        }
      }
    }

    setIsSubmitting(true)

    const fallbackToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
    const authToken = token ?? fallbackToken

    try {
      if (editData) {
        // Update existing user
        const updateData: any = {
          login_name: loginName.trim(),
          email_address: emailAddress.trim(),
          display_name: displayName.trim() || null
        }

        // Only include password fields if password is being changed
        if (password) {
          updateData.password = password
          updateData.confirm_password = confirmPassword
        }

        await axios.put(
          `${buildApiUrl(API_ENDPOINTS.USERS)}/${editData.id}`,
          updateData,
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toastSuccess.updated('User', loginName)
      } else {
        // Create new user
        await axios.post(
          buildApiUrl(API_ENDPOINTS.USERS),
          {
            login_name: loginName.trim(),
            email_address: emailAddress.trim(),
            display_name: displayName.trim() || null,
            password: password,
            confirm_password: confirmPassword,
            accept_terms: acceptTerms
          },
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        )

        toastSuccess.created('User', loginName)
      }

      handleClose()
      
      // Trigger refresh of users list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('users:updated'))
      }
    } catch (error: unknown) {
      handleApiError(error, editData ? 'update' : 'create', 'user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{editData ? 'Edit User' : 'Add New User'}</SheetTitle>
              <SheetDescription>
                {editData ? 'Update user account details' : 'Create a new user account for system access'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <Separator className="mb-6" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Account Information" icon={<UserCircle className="h-4 w-4" />}>
            <FormField>
              <Label htmlFor="login-name" className="text-sm font-medium">
                Login Name<RequiredMark />
              </Label>
              <Input
                id="login-name"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="e.g., johndoe, admin123"
                disabled={isSubmitting}
                required
                minLength={3}
                pattern="[a-zA-Z0-9]+"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                3+ characters, letters and numbers only (used for login)
              </p>
            </FormField>

            <FormField>
              <Label htmlFor="display-name" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., John Doe"
                disabled={isSubmitting}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Name shown in the application
              </p>
            </FormField>

            <FormField>
              <Label htmlFor="email-address" className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address<RequiredMark />
                </span>
              </Label>
              <Input
                id="email-address"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="user@example.com"
                disabled={isSubmitting}
                required
                className="h-10"
              />
            </FormField>
          </FormSection>

          <FormSection title="Security" icon={<Lock className="h-4 w-4" />}>
            <FormRow>
              <FormField>
                <Label htmlFor="password" className="text-sm font-medium">
                  Password{!editData && <RequiredMark />}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editData ? "Leave blank to keep" : "Min. 6 characters"}
                  disabled={isSubmitting}
                  required={!editData}
                  minLength={6}
                  className="h-10"
                />
              </FormField>

              <FormField>
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password{!editData && <RequiredMark />}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={editData ? "Confirm if changing" : "Confirm password"}
                  disabled={isSubmitting}
                  required={!editData}
                  className="h-10"
                />
              </FormField>
            </FormRow>
            <p className="text-xs text-muted-foreground">
              {editData 
                ? "Leave both fields blank to keep the current password" 
                : "Password must be at least 6 characters"}
            </p>
          </FormSection>

          {!editData && (
            <FormSection title="Agreement" icon={<Shield className="h-4 w-4" />}>
              <div className="flex items-start space-x-3 rounded-lg border p-4 bg-muted/50">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="accept-terms"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I accept the terms and conditions<RequiredMark />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </FormSection>
          )}

          <FormActions sticky>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {editData ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </FormActions>
        </form>
      </SheetContent>
    </Sheet>
  )
}
