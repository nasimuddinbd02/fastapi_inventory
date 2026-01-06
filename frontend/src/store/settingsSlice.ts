import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ENDPOINTS, buildApiUrl } from '@/config/api'

export type AppSettings = {
  // General Settings
  company_name: string
  admin_email: string
  currency: string
  date_format: string

  // Inventory Settings
  low_stock_threshold: number
  enable_low_stock_alerts: boolean
  auto_generate_intake_number: boolean
  auto_generate_dispatch_number: boolean

  // Display Settings
  items_per_page: number
  show_stock_value_in_dashboard: boolean
  enable_dark_mode: boolean

  // Notification Settings
  enable_email_notifications: boolean
  enable_browser_notifications: boolean
  notify_on_low_stock: boolean
  notify_on_new_intake: boolean
  notify_on_new_dispatch: boolean
}

type SettingsState = {
  settings: AppSettings
  loading: boolean
  saving: boolean
  error: string | null
  initialized: boolean
}

const defaultSettings: AppSettings = {
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

const initialState: SettingsState = {
  settings: defaultSettings,
  loading: false,
  saving: false,
  error: null,
  initialized: false,
}

const getAuthToken = () => {
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null
  return token
}

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.SETTINGS), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch settings')
    }
  }
)

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings: Partial<AppSettings>, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const response = await axios.put(buildApiUrl(API_ENDPOINTS.SETTINGS), settings, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update settings')
    }
  }
)

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocalSetting: (state, action: PayloadAction<{ key: keyof AppSettings; value: any }>) => {
      const { key, value } = action.payload
      ;(state.settings as any)[key] = value
    },
    resetSettings: (state) => {
      state.settings = defaultSettings
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = { ...defaultSettings, ...action.payload }
        state.initialized = true
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true
      })
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saving = false
        state.settings = { ...defaultSettings, ...action.payload }
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
  },
})

export const { setLocalSetting, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings.settings
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.loading
export const selectSettingsSaving = (state: { settings: SettingsState }) => state.settings.saving
export const selectSettingsInitialized = (state: { settings: SettingsState }) => state.settings.initialized
