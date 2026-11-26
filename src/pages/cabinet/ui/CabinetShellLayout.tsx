import { Outlet, useNavigate } from 'react-router-dom'

import { logoutCustomer } from '@/entities/customer'
import { useCabinetSessionStore } from '@/features/cabinet-auth'
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

  const onLogout = async () => {
    try {
      await logoutCustomer()
    } catch {
      // Local sign-out still required.
    }
    signOut()
    void navigate(CABINET_LOGIN_PATH, {
      replace: true,
      state: { flash: 'loggedOut' },
    })
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
          onLogout={() => {
            void onLogout()
          }}
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
        phone={chrome.rentalPhone}
        phoneHref={chrome.rentalPhoneHref}
        email={chrome.rentalEmail}
        emailHref={chrome.rentalEmailHref}
        copy={chrome.footerCopy}
      />
    </div>
  )
}

export default CabinetShellLayout
