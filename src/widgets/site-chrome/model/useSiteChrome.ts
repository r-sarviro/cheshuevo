import { useTranslation } from 'react-i18next'

import {
  CATALOG_PATH,
  HOME_PATH,
  PLAY_PATH,
  type AppLocale,
} from '@/shared/config'
import { useUiStore } from '@/shared/model'

/** Shared locale/theme props for Hero, SiteHeader, SiteFooter. */
export function useSiteChrome() {
  const { t } = useTranslation()
  const locale = useUiStore((state) => state.locale)
  const theme = useUiStore((state) => state.theme)
  const setLocale = useUiStore((state) => state.setLocale)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  const locales = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ]

  return {
    brand: t('app.title'),
    brandHref: HOME_PATH,
    navItems: [
      { href: CATALOG_PATH, label: t('landing.navCatalog') },
      { href: PLAY_PATH, label: t('landing.navFlight') },
    ],
    navAriaLabel: t('landing.navPrimary'),
    locale,
    locales,
    onLocaleChange: (code: string) => setLocale(code as AppLocale),
    localeAriaLabel: t('landing.locale'),
    theme,
    onThemeToggle: toggleTheme,
    themeLabel: theme === 'night' ? t('ds.themeDay') : t('ds.themeNight'),
    themeAriaLabel: t('ds.theme'),
    footerLocaleAriaLabel: t('landing.localeFooter'),
  }
}
