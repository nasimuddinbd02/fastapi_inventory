'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  fetchSettings, 
  selectSettings, 
  selectSettingsInitialized,
  selectSettingsLoading,
  type AppSettings 
} from '@/store/settingsSlice'

/**
 * Hook to access application settings from anywhere in the app.
 * Settings are loaded from the database and cached in Redux.
 */
export function useSettings() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const initialized = useAppSelector(selectSettingsInitialized)
  const loading = useAppSelector(selectSettingsLoading)

  // Load settings if not initialized
  useEffect(() => {
    if (!initialized && !loading) {
      dispatch(fetchSettings())
    }
  }, [dispatch, initialized, loading])

  return {
    settings,
    initialized,
    loading,
    // Helper getters for common settings
    companyName: settings.company_name,
    adminEmail: settings.admin_email,
    currency: settings.currency,
    dateFormat: settings.date_format,
    itemsPerPage: settings.items_per_page,
    lowStockThreshold: settings.low_stock_threshold,
    enableLowStockAlerts: settings.enable_low_stock_alerts,
    showStockValueInDashboard: settings.show_stock_value_in_dashboard,
    enableDarkMode: settings.enable_dark_mode,
  }
}

/**
 * Get currency symbol for the configured currency
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    BDT: '৳',
    INR: '₹',
  }
  return symbols[currency] || currency
}

/**
 * Format a number as currency using the app's currency setting
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format a date using the app's date format setting
 */
export function formatDate(date: string | Date, format: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }

  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = monthNames[d.getMonth()]

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD-MMM-YYYY':
      return `${day}-${monthName}-${year}`
    default:
      return `${month}/${day}/${year}`
  }
}

/**
 * Hook that returns formatted currency based on app settings
 */
export function useFormattedCurrency() {
  const { currency } = useSettings()
  
  return {
    format: (amount: number) => formatCurrency(amount, currency),
    symbol: getCurrencySymbol(currency),
    currency,
  }
}

/**
 * Hook that returns formatted date based on app settings
 */
export function useFormattedDate() {
  const { dateFormat } = useSettings()
  
  return {
    format: (date: string | Date) => formatDate(date, dateFormat),
    dateFormat,
  }
}
