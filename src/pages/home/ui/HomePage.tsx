import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { DragonCard, useDragonsQuery } from '@/entities/dragon'
import { CATALOG_HASH, HOME_PATH, dragonPath } from '@/shared/config'
import { scrollToHashId } from '@/shared/lib'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Icon } from '@/shared/ui/icon'
import { Section, SectionHead, Wrap } from '@/shared/ui/layout'
import { Typography } from '@/shared/ui/typography'
import { DragonCatalog, DragonCatalogItem } from '@/widgets/dragon-catalog'
import { Hero } from '@/widgets/hero'
import { useSiteChrome } from '@/widgets/site-chrome'
import { SiteFooter } from '@/widgets/site-footer'

import styles from './HomePage.module.css'

/** Product landing: hero + public catalog (stub data). */
const HomePage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const chrome = useSiteChrome()
  const dragonsQuery = useDragonsQuery()

  useDocumentMeta({
    title: t('seo.home.title'),
    description: t('seo.home.description'),
    canonicalPath: HOME_PATH,
  })

  // Arrive from another route with /#catalog (RR often skips native hash scroll).
  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) {
      return
    }
    const timer = window.setTimeout(() => scrollToHashId(id), 0)
    return () => window.clearTimeout(timer)
  }, [location.hash, location.key, location.pathname])

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <Hero
          brand={chrome.brand}
          brandHref={chrome.brandHref}
          title={t('landing.heroTitle')}
          lead={t('landing.heroLead')}
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
          actions={
            <Button
              type="button"
              onClick={() => {
                scrollToHashId(CATALOG_HASH)
              }}
            >
              {t('landing.heroCta')}
            </Button>
          }
        />

        <Section id={CATALOG_HASH} className={styles.catalogSection}>
          <Wrap>
            <SectionHead>
              <Typography as="h2" variant="h2">
                {t('catalog.title')}
              </Typography>
              <p>{t('catalog.lead')}</p>
            </SectionHead>

            {dragonsQuery.isError ? (
              <EmptyState
                picture={<Icon name="warn" xl />}
                pictureStyle={{ background: 'var(--c-tile-peach)' }}
                heading={
                  <Typography variant="h3">
                    {t('catalog.errorTitle')}
                  </Typography>
                }
                action={
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void dragonsQuery.refetch()}
                  >
                    {t('catalog.refresh')}
                  </Button>
                }
              >
                {t('catalog.errorBody')}
              </EmptyState>
            ) : null}

            {dragonsQuery.isPending ? (
              <DragonCatalog
                className={styles.catalog}
                aria-label={t('catalog.title')}
              >
                {[0, 1, 2].map((key) => (
                  <DragonCatalogItem key={key}>
                    <DragonCard
                      loading
                      loadingLabel={t('catalog.cardLoading')}
                      priceLabel={t('ds.perHour')}
                      actionLabel={t('catalog.book')}
                    />
                  </DragonCatalogItem>
                ))}
              </DragonCatalog>
            ) : null}

            {dragonsQuery.isSuccess && dragonsQuery.data.items.length === 0 ? (
              <EmptyState
                picture={<Icon name="egg" xl />}
                heading={
                  <Typography variant="h3">
                    {t('catalog.emptyTitle')}
                  </Typography>
                }
              >
                {t('catalog.emptyBody')}
              </EmptyState>
            ) : null}

            {dragonsQuery.isSuccess && dragonsQuery.data.items.length > 0 ? (
              <DragonCatalog
                className={styles.catalog}
                aria-label={t('catalog.title')}
              >
                {dragonsQuery.data.items.map((dragon) => (
                  <DragonCatalogItem key={dragon.id}>
                    <DragonCard
                      dragon={dragon}
                      href={dragonPath(dragon.id)}
                      actionHref={dragonPath(dragon.id)}
                      priceLabel={t('ds.perHour')}
                      actionLabel={t('catalog.book')}
                    />
                  </DragonCatalogItem>
                ))}
              </DragonCatalog>
            ) : null}
          </Wrap>
        </Section>
      </div>

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

export default HomePage
