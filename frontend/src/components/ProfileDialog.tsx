"use client"

import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  Phone,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Book,
  Shield,
  Key,
  Building2,
  Send,
  CheckCircle2,
  Clock,
  FileQuestion
} from 'lucide-react'

type ProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: 'profile' | 'contact' | 'help'
}

type TabKey = 'profile' | 'contact' | 'help'

export default function ProfileDialog({ open, onOpenChange, initialTab = 'profile' }: ProfileDialogProps) {
  const dispatch = useAppDispatch()
  const { user, token } = useAppSelector(state => state.auth)
  const { companyName, adminEmail } = useSettings()
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
      setContactSent(false)
      if (user) {
        setFormData({
          displayName: user.name || '',
          email: user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
      setContactForm({ subject: '', message: '' })
    }
  }, [open, user, initialTab])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContactChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
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
      setTimeout(() => onOpenChange(false), 1000)

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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toastValidation.required('All fields')
      return
    }

    setLoading(true)
    
    // Simulate sending contact form (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setContactSent(true)
    setLoading(false)
    toastSuccess.messageSent()
  }

  const tabs = [
    { key: 'profile' as TabKey, label: 'Profile', icon: User },
    { key: 'contact' as TabKey, label: 'Contact', icon: Mail },
    { key: 'help' as TabKey, label: 'Help & Support', icon: HelpCircle },
  ]

  // Generate avatar color
  const displayName = user?.name || 'User'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'
  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  const colorIndex = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length
  const avatarColor = avatarColors[colorIndex]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-xl">Account Settings</SheetTitle>
          <SheetDescription>
            Manage your profile, contact support, or get help
          </SheetDescription>
        </SheetHeader>
        
        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {tabs.map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                    transition-all duration-150
                    ${activeTab === tab.key 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* User Card */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className={`
                  relative h-16 w-16 rounded-full ${avatarColor}
                  flex items-center justify-center text-white text-2xl font-semibold
                  flex-shrink-0
                `}>
                  {initial}
                  <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{user?.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user?.email || 'No email set'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">Administrator</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Login Name (Read-only) */}
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
                  <p className="text-xs text-muted-foreground">Login name cannot be changed</p>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
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

                {/* Email */}
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

                {/* Password Section */}
                <div className="border-t pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Change Password</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>
                  
                  <div className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-3">
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

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              {/* Company Info Card */}
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{companyName || 'Company'}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">System Administrator</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2.5">
                  <a 
                    href={`mailto:${adminEmail}`}
                    className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{adminEmail || 'admin@company.com'}</span>
                  </a>
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Response time: Within 24 hours</span>
                  </div>
                </div>
              </div>

              {contactSent ? (
                /* Success State */
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We&apos;ve received your message and will respond to<br />
                    <span className="font-medium text-foreground">{user?.email || 'your email'}</span> shortly.
                  </p>
                  <Button variant="outline" onClick={() => setContactSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => handleContactChange('subject', e.target.value)}
                      placeholder="What can we help you with?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      placeholder="Describe your issue or question in detail..."
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                    <p>Your message will be sent to <span className="font-medium text-foreground">{adminEmail}</span>. 
                    We&apos;ll respond to your registered email address.</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Help & Support Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Links</h3>
                <div className="grid gap-2">
                  {[
                    { icon: Book, label: 'User Guide', desc: 'Learn how to use the system', href: '#' },
                    { icon: FileQuestion, label: 'FAQs', desc: 'Frequently asked questions', href: '#' },
                    { icon: Phone, label: 'Contact Support', desc: 'Get help from our team', action: () => setActiveTab('contact') },
                  ].map((item, index) => {
                    const IconComponent = item.icon
                    const content = (
                      <>
                        <div className="p-2 bg-muted rounded-lg">
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </>
                    )
                    
                    if (item.action) {
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={item.action}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                        >
                          {content}
                        </button>
                      )
                    }
                    
                    return (
                      <a
                        key={index}
                        href={item.href}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        {content}
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* System Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Information</h3>
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Application</span>
                    <span className="font-medium">{companyName} Inventory</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono text-xs bg-background px-2 py-0.5 rounded">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Support Email</span>
                    <a href={`mailto:${adminEmail}`} className="text-primary hover:underline">
                      {adminEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Keyboard Shortcuts</h3>
                <div className="grid gap-2">
                  {[
                    { keys: ['⌘', 'K'], desc: 'Quick search' },
                    { keys: ['⌘', 'N'], desc: 'New record' },
                    { keys: ['Esc'], desc: 'Close dialog' },
                  ].map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-muted/50">
                      <span className="text-muted-foreground">{shortcut.desc}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i} className="px-2 py-0.5 text-xs bg-muted rounded border font-mono">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
