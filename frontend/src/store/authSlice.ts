import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AuthResult, SessionUser } from '@/lib/auth'

type AuthState = {
  user: SessionUser | null
  token: string | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  initialized: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateSession(state, action: PayloadAction<AuthResult | null>) {
      if (action.payload) {
        state.user = action.payload.user
        state.token = action.payload.token
      } else {
        state.user = null
        state.token = null
      }
      state.initialized = true
    },
    setSession(state, action: PayloadAction<AuthResult>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.initialized = true
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },
    clearSessionState(state) {
      state.user = null
      state.token = null
      state.initialized = true
    },
    updateUserProfile(state, action: PayloadAction<SessionUser>) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        }
      }
    }
  }
})

export const { hydrateSession, setSession, setToken, clearSessionState, updateUserProfile } = authSlice.actions

export default authSlice.reducer
