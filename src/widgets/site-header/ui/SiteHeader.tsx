import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Brand } from '@/shared/ui/brand'
import { Button } from '@/shared/ui/button'
import { Icon } from '@/shared/ui/icon'
import { Segment, SegmentItem } from '@/shared/ui/segment'

import styles from './SiteHeader.module.css'

export interface ISiteHeaderNavItem {
  href: string
  label: ReactNode
  current?: boolean
}

export interface ISiteHeaderProps {
  brand: ReactNode
  brandHref?: string
  navItems?: ISiteHeaderNavItem[]
  locale?: string
  locales?: Array<{ code: string; label: ReactNode }>
  onLocaleChange?: (code: string) => void
  localeAriaLabel?: string
  navAriaLabel?: string
  theme?: 'day' | 'night'
  onThemeToggle?: () => void
  themeLabel?: ReactNode
  themeAriaLabel?: string
  className?: string
}

/** Page chrome header: brand, nav, locale, theme — not the hero sky bar. */
const SiteHeader = (props: ISiteHeaderProps) => {
  const {
    brand,
    brandHref = '/',
    navItems = [],
    locale,
    locales = [],
    onLocaleChange,
    localeAriaLabel,
    navAriaLabel,
    theme,
    onThemeToggle,
    themeLabel,
    themeAriaLabel,
    className,
  } = props

  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const night = theme === 'night'

  return (
    <header className={rootClass}>
      <Brand to={brandHref}>{brand}</Brand>
      {navItems.length > 0 ? (
        <nav className={styles.nav} aria-label={navAriaLabel}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : (
        <div className={styles.nav} />
      )}
      {locales.length > 0 && onLocaleChange && localeAriaLabel ? (
        <div className={styles.localeSlot}>
          <Segment aria-label={localeAriaLabel}>
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
        </div>
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
    </header>
  )
}

export default SiteHeader
