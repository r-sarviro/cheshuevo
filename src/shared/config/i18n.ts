import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import dr from './locales/dr.json'
import en from './locales/en.json'
import ru from './locales/ru.json'

export const supportedLocales = ['ru', 'en', 'dr'] as const
export type AppLocale = (typeof supportedLocales)[number]

export const defaultLocale: AppLocale = 'ru'

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    dr: { translation: dr },
  },
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  interpolation: {
    escapeValue: false,
  },
  // Avoid Locize promo noise in tests/console
  showSupportNotice: false,
})

export { i18n }
