"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  fetchSettings, 
  updateSettings, 
  selectSettings,
  selectSettingsLoading,
  selectSettingsSaving,
  selectSettingsInitialized,
  type AppSettings
} from '@/store/settingsSlice'
import { toastSuccess, toastError, toastInfo } from '@/lib/toast-messages'
import { Save, RotateCcw, Loader2, RefreshCw } from 'lucide-react'

export default function SettingsView() {
  const dispatch = useAppDispatch()
  
  const settings = useAppSelector(selectSettings)
  const loading = useAppSelector(selectSettingsLoading)
  const saving = useAppSelector(selectSettingsSaving)
  const initialized = useAppSelector(selectSettingsInitialized)
  
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  // Sync local settings when store settings change
  useEffect(() => {
    setLocalSettings(settings)
    setHasChanges(false)
  }, [settings])

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const result = await dispatch(updateSettings(localSettings))
      if (updateSettings.fulfilled.match(result)) {
        toastSuccess.settingsSaved()
        setHasChanges(false)
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save settings'
      toastError.saveFailed(message)
    }
  }

  const handleReset = async () => {
    // Reset to defaults by fetching from server
    const defaultValues: AppSettings = {
      company_name: 'My Company',
      admin_email: 'admin@company.com',
      currency: 'USD',
      date_format: 'MM/DD/YYYY',
      low_stock_threshold: 10,
      enable_low_stock_alerts: true,
      auto_generate_intake_number: true,
      auto_generate_dispatch_number: true,
      items_per_page: 10,
      show_stock_value_in_dashboard: true,
      enable_dark_mode: false,
      enable_email_notifications: false,
      enable_browser_notifications: true,
      notify_on_low_stock: true,
      notify_on_new_intake: false,
      notify_on_new_dispatch: false,
    }
    
    setLocalSettings(defaultValues)
    setHasChanges(true)
    toastInfo.settingsReset()
  }

  const handleRefresh = () => {
    dispatch(fetchSettings())
  }

  if (loading && !initialized) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <p className="text-sm text-muted-foreground">Customize the application to fit your business needs. Configure inventory thresholds, display preferences, and notification settings.</p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={saving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button variant="ghost" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        {hasChanges && (
          <span className="text-sm text-amber-600 font-medium">You have unsaved changes</span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={localSettings.company_name}
                onChange={(e) => handleSettingChange('company_name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Administrator Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={localSettings.admin_email}
                onChange={(e) => handleSettingChange('admin_email', e.target.value)}
                placeholder="admin@company.com"
              />
              <p className="text-xs text-muted-foreground">Contact email shown in Help & Support</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={localSettings.currency}
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={localSettings.date_format}
                onValueChange={(value) => handleSettingChange('date_format', value)}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Settings</CardTitle>
            <CardDescription>Configure inventory management behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={localSettings.low_stock_threshold}
                onChange={(e) => handleSettingChange('low_stock_threshold', Number.parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Items below this quantity will be marked as low stock</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableLowStockAlerts">Low Stock Alerts</Label>
                <p className="text-xs text-gray-500">Show alerts for low stock items</p>
              </div>
              <Switch
                id="enableLowStockAlerts"
                checked={localSettings.enable_low_stock_alerts}
                onCheckedChange={(checked) => handleSettingChange('enable_low_stock_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoGenerateIntakeNumber">Auto-generate Intake Numbers</Label>
                <p className="text-xs text-gray-500">Automatically generate intake order numbers</p>
              </div>
              <Switch
                id="autoGenerateIntakeNumber"
                checked={localSettings.auto_generate_intake_number}
                onCheckedChange={(checked) => handleSettingChange('auto_generate_intake_number', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoGenerateDispatchNumber">Auto-generate Dispatch Numbers</Label>
                <p className="text-xs text-gray-500">Automatically generate dispatch order numbers</p>
              </div>
              <Switch
                id="autoGenerateDispatchNumber"
                checked={localSettings.auto_generate_dispatch_number}
                onCheckedChange={(checked) => handleSettingChange('auto_generate_dispatch_number', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize the application appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Select
                value={localSettings.items_per_page.toString()}
                onValueChange={(value) => handleSettingChange('items_per_page', Number.parseInt(value))}
              >
                <SelectTrigger id="itemsPerPage">
                  <SelectValue placeholder="Select items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 items</SelectItem>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="20">20 items</SelectItem>
                  <SelectItem value="50">50 items</SelectItem>
                  <SelectItem value="100">100 items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showStockValueInDashboard">Show Stock Value in Dashboard</Label>
                <p className="text-xs text-gray-500">Display total inventory value on dashboard</p>
              </div>
              <Switch
                id="showStockValueInDashboard"
                checked={localSettings.show_stock_value_in_dashboard}
                onCheckedChange={(checked) => handleSettingChange('show_stock_value_in_dashboard', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableDarkMode">Dark Mode</Label>
                <p className="text-xs text-gray-500">Enable dark theme</p>
              </div>
              <Switch
                id="enableDarkMode"
                checked={localSettings.enable_dark_mode}
                onCheckedChange={(checked) => handleSettingChange('enable_dark_mode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={localSettings.enable_email_notifications}
                onCheckedChange={(checked) => handleSettingChange('enable_email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableBrowserNotifications">Browser Notifications</Label>
                <p className="text-xs text-gray-500">Show browser push notifications</p>
              </div>
              <Switch
                id="enableBrowserNotifications"
                checked={localSettings.enable_browser_notifications}
                onCheckedChange={(checked) => handleSettingChange('enable_browser_notifications', checked)}
              />
            </div>

            <Separator />

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notify me when:</p>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyOnLowStock">Low Stock Warning</Label>
                <p className="text-xs text-gray-500">When items fall below threshold</p>
              </div>
              <Switch
                id="notifyOnLowStock"
                checked={localSettings.notify_on_low_stock}
                onCheckedChange={(checked) => handleSettingChange('notify_on_low_stock', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyOnNewIntake">New Intake Created</Label>
                <p className="text-xs text-gray-500">When a new intake order is created</p>
              </div>
              <Switch
                id="notifyOnNewIntake"
                checked={localSettings.notify_on_new_intake}
                onCheckedChange={(checked) => handleSettingChange('notify_on_new_intake', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyOnNewDispatch">New Dispatch Created</Label>
                <p className="text-xs text-gray-500">When a new dispatch order is created</p>
              </div>
              <Switch
                id="notifyOnNewDispatch"
                checked={localSettings.notify_on_new_dispatch}
                onCheckedChange={(checked) => handleSettingChange('notify_on_new_dispatch', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
