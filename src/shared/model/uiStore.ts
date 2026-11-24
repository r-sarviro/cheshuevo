import { create } from 'zustand'

import { defaultLocale, i18n, type AppLocale } from '@/shared/config'

import {
  applyThemeToDocument,
  persistTheme,
  readStoredTheme,
  type TThemeMode,
} from './theme'

type UiState = {
  locale: AppLocale
  theme: TThemeMode
  setLocale: (locale: AppLocale) => void
  setTheme: (theme: TThemeMode) => void
  toggleTheme: () => void
}

const initialTheme = readStoredTheme()
applyThemeToDocument(initialTheme)

export const useUiStore = create<UiState>((set, get) => ({
  locale: defaultLocale,
  theme: initialTheme,
  setLocale: (locale) => {
    void i18n.changeLanguage(locale)
    set({ locale })
  },
  setTheme: (theme) => {
    applyThemeToDocument(theme)
    persistTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next: TThemeMode = get().theme === 'night' ? 'day' : 'night'
    get().setTheme(next)
  },
}))
