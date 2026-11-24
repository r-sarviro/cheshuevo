import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { HOME_PATH } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Icon } from '@/shared/ui/icon'
import { Wrap } from '@/shared/ui/layout'
import { Typography } from '@/shared/ui/typography'
import { useSiteChrome } from '@/widgets/site-chrome'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './NotFoundPage.module.css'

/** Catch-all empty state. */
const NotFoundPage = () => {
  const { t } = useTranslation()
  const chrome = useSiteChrome()
  const navigate = useNavigate()

  useDocumentMeta({
    title: t('seo.notFound.title'),
    description: t('seo.notFound.description'),
    noIndex: true,
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
        <Wrap>
          <EmptyState
            picture={<Icon name="cloud" xl />}
            pictureStyle={{ background: 'var(--c-tile-sky)' }}
            heading={<Typography variant="h3">{t('notFound.title')}</Typography>}
            action={
              <Button type="button" onClick={() => void navigate(HOME_PATH)}>
                {t('booking.toCatalog')}
              </Button>
            }
          >
            {t('notFound.body')}
          </EmptyState>
        </Wrap>
      </main>
      <SiteFooter
        brand={chrome.brand}
        brandHref={chrome.brandHref}
        navItems={chrome.navItems}
        navAriaLabel={chrome.footerNavAriaLabel}
        locale={chrome.locale}
        locales={chrome.locales}
        onLocaleChange={chrome.onLocaleChange}
        localeAriaLabel={chrome.footerLocaleAriaLabel}
      />
    </div>
  )
}

export default NotFoundPage
