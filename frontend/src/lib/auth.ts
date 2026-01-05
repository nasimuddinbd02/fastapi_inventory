import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'

export type SessionUser = {
  name: string
  email?: string | null
  loginName: string
}

export type AuthResult = {
  token: string
  user: SessionUser
}

export async function authenticateUser(loginName: string, password: string): Promise<AuthResult> {
  const loginResponse = await axios.post(buildApiUrl(API_ENDPOINTS.LOGIN), {
    login_name: loginName,
    password
  })

  const accessToken = loginResponse.data?.access_token
  if (!accessToken) {
    throw new Error('Authentication failed: access token missing')
  }

  const profileResponse = await axios.get(buildApiUrl(API_ENDPOINTS.USER_PROFILE), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const profile = profileResponse.data
  const sessionUser: SessionUser = {
    name: profile?.display_name || profile?.login_name || loginName,
    email: profile?.email_address,
    loginName: profile?.login_name || loginName
  }

  return {
    token: accessToken,
    user: sessionUser
  }
}

export function persistSession(auth: AuthResult){
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem('token', auth.token)
  window.sessionStorage.setItem('user', JSON.stringify(auth.user))
}

export function clearSession(){
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem('token')
  window.sessionStorage.removeItem('user')
}

export function readSession(): AuthResult | null {
  if (typeof window === 'undefined') return null
  const token = window.sessionStorage.getItem('token')
  const userRaw = window.sessionStorage.getItem('user')
  if (!token || !userRaw) return null
  try {
    const user = JSON.parse(userRaw) as SessionUser
    return { token, user }
  } catch (_err) {
    return null
  }
}
