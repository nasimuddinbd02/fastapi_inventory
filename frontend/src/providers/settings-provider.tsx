'use client'

import { useEffect, ReactNode, createContext, useContext } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useTheme } from 'next-themes'
import { 
  fetchSettings, 
  selectSettings, 
  selectSettingsInitialized,
  type AppSettings 
} from '@/store/settingsSlice'

type SettingsContextType = {
  settings: AppSettings
  initialized: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

type SettingsProviderProps = {
  children: ReactNode
}

/**
 * Provider component that initializes application settings on mount.
 * Also handles theme synchronization based on settings.
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const initialized = useAppSelector(selectSettingsInitialized)
  const { setTheme } = useTheme()

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  // Sync dark mode setting with theme
  useEffect(() => {
    if (initialized) {
      setTheme(settings.enable_dark_mode ? 'dark' : 'light')
    }
  }, [initialized, settings.enable_dark_mode, setTheme])

  return (
    <SettingsContext.Provider value={{ settings, initialized }}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Hook to access settings context
 */
export function useSettingsContext() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}
