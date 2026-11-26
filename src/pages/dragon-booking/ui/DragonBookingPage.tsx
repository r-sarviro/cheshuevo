import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { getDragonCopy, useDragonQuery } from '@/entities/dragon'
import {
  BookingWizard,
  createDefaultPeriod,
  useBookingDraftStore,
} from '@/widgets/booking-wizard'
import {
  CATALOG_HASH,
  CATALOG_PATH,
  HOME_PATH,
  dragonPath,
} from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Button, ButtonText } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Icon } from '@/shared/ui/icon'
import { Wrap } from '@/shared/ui/layout'
import { DragonSheetSprite, DragonSprite } from '@/shared/ui/sprite'
import { Typography } from '@/shared/ui/typography'
import { DragonPage } from '@/widgets/dragon-page'
import { useSiteChrome } from '@/widgets/site-chrome'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import styles from './DragonBookingPage.module.css'

/** Dragon detail + booking wizard (stub API). */
const DragonBookingPage = () => {
  const { t } = useTranslation()
  const chrome = useSiteChrome()
  const navigate = useNavigate()
  const params = useParams()
  const dragonId = Number(params.dragonId)
  const dragonQuery = useDragonQuery(
    Number.isFinite(dragonId) ? dragonId : undefined,
  )
  const resetForDragon = useBookingDraftStore((s) => s.resetForDragon)
  const storeDragonId = useBookingDraftStore((s) => s.dragonId)

  useEffect(() => {
    if (!Number.isFinite(dragonId) || dragonId <= 0) return
    if (storeDragonId !== dragonId) {
      resetForDragon(dragonId, createDefaultPeriod())
    }
  }, [dragonId, resetForDragon, storeDragonId])

  const headerNav = chrome.navItems.map((item) =>
    item.href === CATALOG_PATH ? { ...item, current: true as const } : item,
  )
  const isCenteredStage = dragonQuery.isPending || dragonQuery.isError
  const dragon = dragonQuery.data
  const copy = dragon ? getDragonCopy(t, dragon) : null
  const hasValidDragonId = Number.isFinite(dragonId) && dragonId > 0

  useDocumentMeta(
    dragonQuery.isError || !hasValidDragonId
      ? {
          title: t('seo.notFound.title'),
          description: t('seo.notFound.description'),
          noIndex: true,
        }
      : copy
        ? {
            title: t('seo.booking.title', { name: copy.name }),
            description: t('seo.booking.description', { name: copy.name }),
            canonicalPath: dragonPath(dragonId),
          }
        : {
            title: t('seo.home.title'),
            description: t('seo.home.description'),
            canonicalPath: hasValidDragonId ? dragonPath(dragonId) : undefined,
          },
  )

  return (
    <div className={styles.page}>
      <SiteHeader
        brand={chrome.brand}
        brandHref={chrome.brandHref}
        navItems={headerNav}
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

      <main
        className={[styles.main, isCenteredStage ? styles.mainCentered : null]
          .filter(Boolean)
          .join(' ')}
      >
        <Wrap>
          {dragonQuery.isPending ? (
            <EmptyState
              role="status"
              pictureBare
              picture={
                <DragonSprite
                  name="loader"
                  width={48}
                  height={48}
                  label={t('catalog.loadingTitle')}
                />
              }
              heading={
                <Typography variant="h3">
                  {t('catalog.loadingTitle')}
                </Typography>
              }
            >
              {t('catalog.loadingBody')}
            </EmptyState>
          ) : null}

          {dragonQuery.isError ? (
            <EmptyState
              picture={<Icon name="cloud" xl />}
              pictureStyle={{ background: 'var(--c-tile-sky)' }}
              heading={
                <Typography variant="h3">{t('notFound.title')}</Typography>
              }
              action={
                <Button type="button" onClick={() => void navigate(HOME_PATH)}>
                  {t('booking.toCatalog')}
                </Button>
              }
            >
              {t('notFound.body')}
            </EmptyState>
          ) : null}

          {dragon && copy ? (
            <DragonPage
              back={
                <ButtonText
                  type="button"
                  onClick={() =>
                    void navigate({
                      pathname: HOME_PATH,
                      hash: CATALOG_HASH,
                    })
                  }
                >
                  <Icon name="left" />
                  {t('booking.backCatalog')}
                </ButtonText>
              }
              picture={
                dragon.spriteKey ? (
                  <DragonSheetSprite
                    name={dragon.spriteKey}
                    label={copy.name}
                  />
                ) : null
              }
              pictureTile={dragon.tileToken}
              pictureLabel={copy.name}
              name={copy.name}
              tags={copy.tags}
              tagsLabel={t('catalog.tagsLabel')}
              about={copy.description}
              fit={
                copy.fit ? t('catalog.fit', { fit: copy.fit }) : undefined
              }
              rateAmount={`${dragon.hourlyRate}\u00a0${dragon.currency}`}
              rateUnit={t('ds.perHour')}
              rateHint={t('booking.rateHint')}
            >
              <BookingWizard dragon={dragon} />
            </DragonPage>
          ) : null}
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
        phone={chrome.rentalPhone}
        phoneHref={chrome.rentalPhoneHref}
        email={chrome.rentalEmail}
        emailHref={chrome.rentalEmailHref}
        copy={chrome.footerCopy}
      />
    </div>
  )
}

export default DragonBookingPage
