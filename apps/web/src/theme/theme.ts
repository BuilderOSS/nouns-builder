export const THEME_STORAGE_KEY = 'nouns-builder-theme'

export type ThemeMode = 'light' | 'dark'

export const DEFAULT_THEME_MODE: ThemeMode = 'light'

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}
