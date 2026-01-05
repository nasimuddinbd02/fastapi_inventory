/**
 * Application Configuration
 * Centralized configuration for application settings
 * These can be overridden by environment variables for deployment
 */

// Application Display Settings
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Inventory Management System'

// Pagination Settings
export const DEFAULT_PAGE_SIZE = parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '10', 10)

// Feature Flags
export const FEATURES = {
  USER_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_USER_MANAGEMENT !== 'false',
  AGENTS: process.env.NEXT_PUBLIC_ENABLE_AGENTS === 'true',
} as const

// UI Settings
export const UI_SETTINGS = {
  SHOW_TOOLTIPS: true,
  ENABLE_ANIMATIONS: true,
} as const

// Table Settings
export const TABLE_SETTINGS = {
  DEFAULT_PAGE_SIZE: DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  ENABLE_SORTING: true,
  ENABLE_FILTERING: true,
} as const

// Export all settings for convenience
export const APP_CONFIG = {
  APP_NAME,
  DEFAULT_PAGE_SIZE,
  FEATURES,
  UI_SETTINGS,
  TABLE_SETTINGS,
} as const
