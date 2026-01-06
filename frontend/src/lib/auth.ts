import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'

export type SessionUser = {
  name: string
  email?: string | null
  loginName: string
}

export type AuthResult = {
  token: string
  refreshToken: string
  expiresIn: number  // seconds until access token expires
  user: SessionUser
}

export type TokenRefreshResult = {
  token: string
  refreshToken: string
  expiresIn: number
}

export async function authenticateUser(loginName: string, password: string): Promise<AuthResult> {
  const loginResponse = await axios.post(buildApiUrl(API_ENDPOINTS.LOGIN), {
    login_name: loginName,
    password
  }, { skipLoading: true })

  const accessToken = loginResponse.data?.access_token
  const refreshToken = loginResponse.data?.refresh_token
  const expiresIn = loginResponse.data?.expires_in || 1800  // Default 30 minutes
  
  if (!accessToken) {
    throw new Error('Authentication failed: access token missing')
  }

  const profileResponse = await axios.get(buildApiUrl(API_ENDPOINTS.USER_PROFILE), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    skipLoading: true
  })

  const profile = profileResponse.data
  const sessionUser: SessionUser = {
    name: profile?.display_name || profile?.login_name || loginName,
    email: profile?.email_address,
    loginName: profile?.login_name || loginName
  }

  return {
    token: accessToken,
    refreshToken: refreshToken,
    expiresIn: expiresIn,
    user: sessionUser
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResult | null> {
  try {
    const response = await axios.post(buildApiUrl('/users/refresh'), {
      refresh_token: refreshToken
    }, { skipLoading: true })

    const newAccessToken = response.data?.access_token
    const newRefreshToken = response.data?.refresh_token
    const expiresIn = response.data?.expires_in || 1800

    if (!newAccessToken) {
      return null
    }

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken || refreshToken,
      expiresIn: expiresIn
    }
  } catch (error) {
    console.error('[Auth] Failed to refresh token:', error)
    return null
  }
}

export function persistSession(auth: AuthResult){
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem('token', auth.token)
  window.sessionStorage.setItem('refreshToken', auth.refreshToken)
  window.sessionStorage.setItem('tokenExpiresAt', String(Date.now() + auth.expiresIn * 1000))
  window.sessionStorage.setItem('user', JSON.stringify(auth.user))
}

export function updateTokens(tokens: TokenRefreshResult) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem('token', tokens.token)
  window.sessionStorage.setItem('refreshToken', tokens.refreshToken)
  window.sessionStorage.setItem('tokenExpiresAt', String(Date.now() + tokens.expiresIn * 1000))
}

export function clearSession(){
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem('token')
  window.sessionStorage.removeItem('refreshToken')
  window.sessionStorage.removeItem('tokenExpiresAt')
  window.sessionStorage.removeItem('user')
}

export function readSession(): AuthResult | null {
  if (typeof window === 'undefined') return null
  const token = window.sessionStorage.getItem('token')
  const refreshToken = window.sessionStorage.getItem('refreshToken')
  const tokenExpiresAt = window.sessionStorage.getItem('tokenExpiresAt')
  const userRaw = window.sessionStorage.getItem('user')
  if (!token || !userRaw) return null
  try {
    const user = JSON.parse(userRaw) as SessionUser
    const expiresAt = tokenExpiresAt ? parseInt(tokenExpiresAt, 10) : Date.now() + 1800000
    const expiresIn = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    return { 
      token, 
      refreshToken: refreshToken || '',
      expiresIn,
      user 
    }
  } catch (_err) {
    return null
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem('refreshToken')
}

export function isTokenExpiringSoon(): boolean {
  if (typeof window === 'undefined') return false
  const tokenExpiresAt = window.sessionStorage.getItem('tokenExpiresAt')
  if (!tokenExpiresAt) return true
  
  const expiresAt = parseInt(tokenExpiresAt, 10)
  const now = Date.now()
  // Consider token "expiring soon" if less than 2 minutes remaining
  return (expiresAt - now) < 120000
}
