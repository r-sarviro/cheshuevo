import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import {
  ABOUT_PATH,
  CABINET_BOOKINGS_PATH,
  CATALOG_PATH,
  HOME_PATH,
  PLAY_PATH,
  RENTAL_EMAIL,
  RENTAL_PHONE,
  RENTAL_PHONE_TEL,
  type AppLocale,
} from '@/shared/config'
import { useUiStore } from '@/shared/model'

/** Shared locale/theme props for Hero, SiteHeader, SiteFooter. */
export function useSiteChrome() {
  const { t } = useTranslation()
  const location = useLocation()
  const locale = useUiStore((state) => state.locale)
  const theme = useUiStore((state) => state.theme)
  const setLocale = useUiStore((state) => state.setLocale)
  const toggleTheme = useUiStore((state) => state.toggleTheme)

  const locales = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ]

  const onAbout = location.pathname === ABOUT_PATH

  return {
    brand: t('app.title'),
    brandHref: HOME_PATH,
    navItems: [
      { href: CATALOG_PATH, label: t('landing.navCatalog') },
      {
        href: ABOUT_PATH,
        label: t('landing.navAbout'),
        current: onAbout,
      },
      { href: PLAY_PATH, label: t('landing.navFlight') },
      { href: CABINET_BOOKINGS_PATH, label: t('landing.navBookings') },
    ],
    navAriaLabel: t('landing.navPrimary'),
    footerCopy: t('landing.footerCopy'),
    rentalPhone: RENTAL_PHONE,
    rentalPhoneHref: `tel:${RENTAL_PHONE_TEL}`,
    rentalEmail: RENTAL_EMAIL,
    rentalEmailHref: `mailto:${RENTAL_EMAIL}`,
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
