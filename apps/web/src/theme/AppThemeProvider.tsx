'use client'

import { darkTheme, lightTheme } from '@buildeross/zord'
import React from 'react'

import { DEFAULT_THEME_MODE, isThemeMode, THEME_STORAGE_KEY, ThemeMode } from './theme'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getInitialTheme(): ThemeMode {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME_MODE
  }

  const currentTheme = document.documentElement.dataset.themeMode

  return isThemeMode(currentTheme) ? currentTheme : DEFAULT_THEME_MODE
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.themeMode = mode
  document.documentElement.style.colorScheme = mode

  if (!document.body) {
    return
  }

  document.body.classList.remove(lightTheme, darkTheme)
  document.body.classList.add(mode === 'dark' ? darkTheme : lightTheme)
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>(getInitialTheme)

  React.useEffect(() => {
    applyTheme(mode)
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  const value = React.useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () =>
        setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeMode() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider')
  }

  return context
}
