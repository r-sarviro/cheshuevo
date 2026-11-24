import type { ReactNode } from 'react'

import { InstallAppButton } from '@/features/install-app'
import { Brand } from '@/shared/ui/brand'
import { Button } from '@/shared/ui/button'
import { Icon } from '@/shared/ui/icon'
import { Wrap } from '@/shared/ui/layout'
import { Segment, SegmentItem } from '@/shared/ui/segment'

import styles from './SiteFooter.module.css'

export interface ISiteFooterProps {
  brand: ReactNode
  brandHref?: string
  locale?: string
  locales?: Array<{ code: string; label: ReactNode }>
  onLocaleChange?: (code: string) => void
  localeAriaLabel?: string
  theme?: 'day' | 'night'
  onThemeToggle?: () => void
  themeLabel?: ReactNode
  themeAriaLabel?: string
  className?: string
}

/** Landing footer: brand, install, locale and theme toggles. */
const SiteFooter = (props: ISiteFooterProps) => {
  const {
    brand,
    brandHref = '/',
    locale,
    locales = [],
    onLocaleChange,
    localeAriaLabel,
    theme,
    onThemeToggle,
    themeLabel,
    themeAriaLabel,
    className,
  } = props

  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const night = theme === 'night'
  const localeIndex = locales.findIndex((item) => item.code === locale)
  const nextLocale =
    locales.length > 0
      ? locales[(localeIndex >= 0 ? localeIndex + 1 : 0) % locales.length]
      : undefined

  return (
    <footer className={rootClass}>
      <Wrap>
        <div className={styles.row}>
          <Brand to={brandHref}>{brand}</Brand>
          <div className={styles.actions}>
            <InstallAppButton />
            {locales.length > 0 && onLocaleChange && localeAriaLabel ? (
              <>
                {nextLocale ? (
                  <Button
                    className={styles.localeButton}
                    variant="ghost"
                    size="sm"
                    type="button"
                    aria-label={localeAriaLabel}
                    onClick={() => onLocaleChange(nextLocale.code)}
                  >
                    {nextLocale.label}
                  </Button>
                ) : null}
                <Segment
                  className={styles.localeSegment}
                  aria-label={localeAriaLabel}
                >
                  {locales.map((item) => (
                    <SegmentItem
                      key={item.code}
                      pressed={locale === item.code}
                      onClick={() => onLocaleChange(item.code)}
                    >
                      {item.label}
                    </SegmentItem>
                  ))}
                </Segment>
              </>
            ) : null}
            {onThemeToggle ? (
              <Button
                className={styles.theme}
                variant="ghost"
                size="sm"
                type="button"
                aria-label={themeAriaLabel}
                aria-pressed={night}
                onClick={onThemeToggle}
              >
                <Icon name={night ? 'sun' : 'moon'} />
                {themeLabel ? (
                  <span className={styles.themeText}>{themeLabel}</span>
                ) : null}
              </Button>
            ) : null}
          </div>
        </div>
      </Wrap>
    </footer>
  )
}

export default SiteFooter
