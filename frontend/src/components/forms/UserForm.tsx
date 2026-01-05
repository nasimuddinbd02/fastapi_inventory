"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
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
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Login name must be at least 3 characters"
      })
      return
    }

    // Check if login name is alphanumeric
    const alphanumericRegex = /^[a-zA-Z0-9]+$/
    if (!alphanumericRegex.test(loginName.trim())) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Login name must contain only letters and numbers"
      })
      return
    }

    // Validate email
    if (!emailAddress.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email address is required"
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress.trim())) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address"
      })
      return
    }

    // Validate password (only required when creating new user)
    if (!editData) {
      if (!password) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Password is required"
        })
        return
      }

      if (password.length < 6) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Password must be at least 6 characters"
        })
        return
      }

      // Validate confirm password
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Passwords do not match"
        })
        return
      }

      // Validate terms acceptance
      if (!acceptTerms) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "You must accept the terms and conditions"
        })
        return
      }
    } else {
      // When editing, only validate password if it's being changed
      if (password || confirmPassword) {
        if (password.length < 6) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Password must be at least 6 characters"
          })
          return
        }

        if (password !== confirmPassword) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Passwords do not match"
          })
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

        toast({
          variant: "success",
          title: "User Updated",
          description: `User ${loginName} has been updated successfully`
        })
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

        toast({
          variant: "success",
          title: "User Created",
          description: `User ${loginName} has been added successfully`
        })
      }

      handleClose()
      
      // Trigger refresh of users list
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('users:updated'))
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.detail 
        || error.message 
        || 'An error occurred'
      toast({
        variant: "destructive",
        title: editData ? "Failed to Update User" : "Failed to Create User",
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editData ? 'Edit User' : 'Add New User'}</SheetTitle>
          <SheetDescription>
            {editData ? 'Update the user details' : 'Enter the user details to create a new account'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="login-name">
              Login Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="login-name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="Enter username (letters and numbers only)"
              disabled={isSubmitting}
              required
              minLength={3}
              pattern="[a-zA-Z0-9]+"
            />
            <p className="text-xs text-gray-500">
              At least 3 characters, letters and numbers only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-address">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email-address"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="user@example.com"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Full name (optional)"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!editData && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editData ? "Leave blank to keep current password" : "Enter password"}
              disabled={isSubmitting}
              required={!editData}
              minLength={6}
            />
            <p className="text-xs text-gray-500">
              {editData ? "Leave blank to keep current password. At least 6 characters if changing." : "At least 6 characters"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirm Password {!editData && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={editData ? "Confirm new password" : "Confirm password"}
              disabled={isSubmitting}
              required={!editData}
            />
          </div>

          {!editData && (
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={isSubmitting}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="accept-terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I accept the terms and conditions <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  You must agree to the terms and conditions to create an account.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
