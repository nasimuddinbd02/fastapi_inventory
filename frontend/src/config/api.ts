/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

import type { AxiosRequestConfig } from 'axios'

// Base API URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// API version (can be configured via environment)
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

// API timeout in milliseconds
export const API_TIMEOUT = Number.parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10)

// Enable API debug mode
export const API_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === 'true'

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/users/login',
  USER_PROFILE: '/users/me',
  SIGNUP: '/users/',
  
  // Inventory/Products
  INVENTORY: '/inventory',
  
  // Master Data
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  SUPPLIERS: '/suppliers',
  USERS: '/users',
  
  // Intake & Dispatch
  INTAKE: '/intake',
  DISPATCH: '/dispatch',
  
  // Settings
  SETTINGS: '/settings',
  
  // Agents (if used)
  AGENTS: '/agents',
} as const

// Helper function to build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`
}

/**
 * Create axios config with options
 * @param options - Configuration options
 * @param options.skipLoading - Skip showing the global loading spinner
 * @param options.loadingMessage - Custom loading message to show
 * @param options.headers - Additional headers
 */
export function createApiConfig(options?: {
  skipLoading?: boolean
  loadingMessage?: string
  headers?: Record<string, string>
  token?: string | null
}): AxiosRequestConfig {
  const config: AxiosRequestConfig = {}
  
  if (options?.skipLoading) {
    config.skipLoading = true
  }
  
  if (options?.loadingMessage) {
    config.loadingMessage = options.loadingMessage
  }
  
  if (options?.headers || options?.token) {
    config.headers = {
      ...options?.headers,
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {})
    }
  }
  
  return config
}

/**
 * Config presets for common use cases
 */
export const apiConfig = {
  /** Silent request - no loading spinner */
  silent: (): AxiosRequestConfig => ({ skipLoading: true }),
  
  /** Request with auth token */
  withAuth: (token: string | null): AxiosRequestConfig => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  
  /** Silent request with auth token */
  silentWithAuth: (token: string | null): AxiosRequestConfig => ({
    skipLoading: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  
  /** Custom loading message */
  withMessage: (message: string): AxiosRequestConfig => ({
    loadingMessage: message
  }),
}
