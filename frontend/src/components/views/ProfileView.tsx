"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateUserProfile } from '@/store/authSlice'
import { toastSuccess, toastError, toastValidation } from '@/lib/toast-messages'
import { useSettings } from '@/hooks/use-settings'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'
import {
  User,
  Mail,
  Shield,
  Key,
} from 'lucide-react'

export default function ProfileView() {
  const dispatch = useAppDispatch()
  const { user, token } = useAppSelector(state => state.auth)
  const { companyName, adminEmail } = useSettings()
  
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)

  // Generate avatar color
  const displayName = user?.name || 'User'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'
  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  const colorIndex = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length
  const avatarColor = avatarColors[colorIndex]

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toastValidation.passwordMismatch()
      return
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toastValidation.minLength('Password', 8)
      return
    }

    setLoading(true)

    try {
      const updateData: Record<string, string | null> = {
        display_name: formData.displayName || null,
        email_address: formData.email || null
      }

      if (formData.newPassword && formData.currentPassword) {
        updateData.current_password = formData.currentPassword
        updateData.new_password = formData.newPassword
        updateData.confirm_new_password = formData.confirmPassword
      }

      const response = await axios.put(
        buildApiUrl(API_ENDPOINTS.USER_PROFILE),
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const updatedUser = {
        name: response.data.display_name || response.data.login_name,
        email: response.data.email_address,
        loginName: response.data.login_name
      }
      
      dispatch(updateUserProfile(updatedUser))
      
      if (globalThis.window !== undefined) {
        globalThis.window.sessionStorage.setItem('user', JSON.stringify(updatedUser))
      }

      toastSuccess.profileUpdated()
      
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))

    } catch (err: unknown) {
      console.error('Profile update error:', err)
      let errorMessage = 'Failed to update profile'
      
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: { msg?: string }) => e.msg || String(e)).join(', ')
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      }
      
      toastError.updateFailed('profile', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`
                relative h-20 w-20 rounded-full ${avatarColor}
                flex items-center justify-center text-white text-3xl font-semibold
                flex-shrink-0
              `}>
                {initial}
                <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-4 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold truncate">{user?.name || 'User'}</h3>
                <p className="text-muted-foreground truncate">{user?.email || 'No email set'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Shield className="w-3.5 h-3.5" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loginName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Login Name
                  </Label>
                  <Input
                    id="loginName"
                    type="text"
                    value={user?.loginName || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-[10px] text-muted-foreground">Login name cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Change Password</span>
                </div>
                
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => handleChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        placeholder="New password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
