import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import {
  CabinetLogin,
  safeReturnPath,
  useCabinetSessionStore,
} from '@/features/cabinet-auth'
import { CABINET_BOOKINGS_PATH } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Wrap } from '@/shared/ui/layout'
import { Note } from '@/shared/ui/note'
import { useSiteChrome } from '@/widgets/site-chrome'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './CabinetPage.module.css'

function bookingNumberFromPath(path: string): string | null {
  const prefix = `${CABINET_BOOKINGS_PATH}/`
  if (!path.startsWith(prefix)) return null
  const rest = path.slice(prefix.length)
  if (!rest || rest.includes('/')) return null
  try {
    return decodeURIComponent(rest)
  } catch {
    return rest
  }
}

/** Guest cabinet login (OTP). Redirects authenticated users to return URL. */
const CabinetLoginPage = () => {
  const { t } = useTranslation()
  const chrome = useSiteChrome()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useCabinetSessionStore((s) => s.isAuthenticated)

  useDocumentMeta({
    title: t('seo.cabinet.login.title'),
    description: t('seo.cabinet.login.description'),
    noIndex: true,
  })

  const state = location.state as
    | { from?: unknown; flash?: string }
    | null
    | undefined
  const returnPath = safeReturnPath(state?.from, CABINET_BOOKINGS_PATH)
  const fromPathname =
    typeof state?.from === 'object' &&
    state?.from &&
    typeof (state.from as { pathname?: unknown }).pathname === 'string'
      ? (state.from as { pathname: string }).pathname
      : ''
  const deepLinkNumber = bookingNumberFromPath(fromPathname)

  const redirectHint = useMemo((): ReactNode => {
    if (state?.flash === 'loggedOut') {
      return (
        <Note tone="sky" icon="info">
          {t('cabinet.loggedOut')}
        </Note>
      )
    }
    if (state?.flash === 'expired') {
      return (
        <Note tone="butter" icon="warn" alert>
          {t('cabinet.loginExpired')}
        </Note>
      )
    }
    if (deepLinkNumber) {
      return (
        <Note tone="sky" icon="info">
          {t('cabinet.loginDeepLink', { number: deepLinkNumber })}
        </Note>
      )
    }
    return null
  }, [deepLinkNumber, state?.flash, t])

  if (isAuthenticated()) {
    return <Navigate to={returnPath} replace />
  }

  return (
    <div className={styles.page}>
      <SiteHeader
        brand={chrome.brand}
        brandHref={chrome.brandHref}
        navItems={chrome.navItems}
        navAriaLabel={chrome.navAriaLabel}
        locale={chrome.locale}
        locales={chrome.locales}
        onLocaleChange={chrome.onLocaleChange}
        localeAriaLabel={chrome.localeAriaLabel}
        theme={chrome.theme}
        onThemeToggle={chrome.onThemeToggle}
        themeLabel={chrome.themeLabel}
        themeAriaLabel={chrome.themeAriaLabel}
      />
      <main className={styles.main}>
        <Wrap>
          <div className={styles.mainNarrow}>
            <CabinetLogin
              redirectHint={redirectHint}
              onSuccess={() => {
                void navigate(returnPath, { replace: true })
              }}
            />
          </div>
        </Wrap>
      </main>
      <SiteFooter
        brand={chrome.brand}
        brandHref={chrome.brandHref}
        locale={chrome.locale}
        locales={chrome.locales}
        onLocaleChange={chrome.onLocaleChange}
        localeAriaLabel={chrome.footerLocaleAriaLabel}
        theme={chrome.theme}
        onThemeToggle={chrome.onThemeToggle}
        themeLabel={chrome.themeLabel}
        themeAriaLabel={chrome.themeAriaLabel}
      />
    </div>
  )
}

export default CabinetLoginPage
