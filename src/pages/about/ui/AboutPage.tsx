import { useTranslation } from 'react-i18next'

import {
  ABOUT_PATH,
  CONTACTS_HASH,
  HOW_HASH,
  PLACE_HASH,
  TRUST_HASH,
} from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Divider } from '@/shared/ui/divider'
import { Wrap } from '@/shared/ui/layout'
import {
  LandingAbout,
  LandingHow,
  LandingTrust,
} from '@/widgets/landing-info'
import { useSiteChrome } from '@/widgets/site-chrome'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './AboutPage.module.css'

/** Indexable about page: place+map, how, trust, contacts. */
const AboutPage = () => {
  const { t } = useTranslation()
  const chrome = useSiteChrome()

  useDocumentMeta({
    title: t('seo.about.title'),
    description: t('seo.about.description'),
    canonicalPath: ABOUT_PATH,
  })

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
        <LandingAbout id={PLACE_HASH} showContacts={false} />
        <Wrap>
          <Divider />
        </Wrap>
        <LandingHow id={HOW_HASH} />
        <Wrap>
          <Divider />
        </Wrap>
        <LandingTrust id={TRUST_HASH} />
        <Wrap>
          <Divider />
        </Wrap>
        <LandingAbout
          id={CONTACTS_HASH}
          contactsId={CONTACTS_HASH}
          showHead={false}
          showBody={false}
          showPlace={false}
          showMap={false}
          showContacts
        />
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

export default AboutPage
