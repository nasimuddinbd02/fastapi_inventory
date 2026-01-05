/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Base API URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// API version (can be configured via environment)
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

// API timeout in milliseconds
export const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10)

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
  
  // Agents (if used)
  AGENTS: '/agents',
} as const

// Helper function to build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`
}
