import { create } from 'zustand'

import { defaultLocale, i18n, type AppLocale } from '@/shared/config'

type UiState = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}

export const useUiStore = create<UiState>((set) => ({
  locale: defaultLocale,
  setLocale: (locale) => {
    void i18n.changeLanguage(locale)
    set({ locale })
  },
}))
