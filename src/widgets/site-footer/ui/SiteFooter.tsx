import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Brand } from '@/shared/ui/brand'
import { Wrap } from '@/shared/ui/layout'
import { Segment, SegmentItem } from '@/shared/ui/segment'

import styles from './SiteFooter.module.css'

export interface ISiteFooterNavItem {
  href: string
  label: ReactNode
  current?: boolean
}

export interface ISiteFooterProps {
  brand: ReactNode
  brandHref?: string
  navItems?: ISiteFooterNavItem[]
  locale?: string
  locales?: Array<{ code: string; label: ReactNode }>
  onLocaleChange?: (code: string) => void
  localeAriaLabel?: string
  navAriaLabel?: string
  credits?: ReactNode
  className?: string
}

/** Landing footer: brand, nav, locale, optional credits. */
const SiteFooter = (props: ISiteFooterProps) => {
  const {
    brand,
    brandHref = '/',
    navItems = [],
    locale,
    locales = [],
    onLocaleChange,
    localeAriaLabel,
    navAriaLabel,
    credits,
    className,
  } = props

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <footer className={rootClass}>
      <Wrap>
        <div className={styles.row}>
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
          ) : null}
          {locales.length > 0 && onLocaleChange && localeAriaLabel ? (
            <Segment className={styles.locale} aria-label={localeAriaLabel}>
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
          ) : null}
        </div>
        {credits ? <p className={styles.credits}>{credits}</p> : null}
      </Wrap>
    </footer>
  )
}

export default SiteFooter
