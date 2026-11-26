import { Outlet, useNavigate } from 'react-router-dom'

import { logoutStub, useCabinetSessionStore } from '@/features/cabinet-auth'
import {
  CABINET_BOOKINGS_PATH,
  CABINET_LOGIN_PATH,
  CABINET_PROFILE_PATH,
} from '@/shared/config'
import { CabinetShell } from '@/widgets/cabinet-shell'
import { useSiteChrome } from '@/widgets/site-chrome'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './CabinetPage.module.css'

/** Authenticated cabinet chrome: site header/footer + CabinetShell tabs. */
const CabinetShellLayout = () => {
  const chrome = useSiteChrome()
  const navigate = useNavigate()
  const email = useCabinetSessionStore((s) => s.email) ?? ''
  const name = useCabinetSessionStore((s) => s.name)
  const signOut = useCabinetSessionStore((s) => s.signOut)

  const onLogout = () => {
    void (async () => {
      try {
        await logoutStub()
      } catch {
        /* clear session anyway */
      }
      signOut()
      void navigate(CABINET_LOGIN_PATH, {
        replace: true,
        state: { flash: 'loggedOut' },
      })
    })()
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
        <CabinetShell
          name={name ?? undefined}
          email={email}
          tabHrefs={{
            broni: CABINET_BOOKINGS_PATH,
            profil: CABINET_PROFILE_PATH,
          }}
          onLogout={onLogout}
        >
          <Outlet />
        </CabinetShell>
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

export default CabinetShellLayout
