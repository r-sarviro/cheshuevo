import { useEffect, useRef, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { handleInPageHashNav } from '@/shared/lib'
import { useUiStore } from '@/shared/model'
import { Brand } from '@/shared/ui/brand'
import { Button } from '@/shared/ui/button'
import { Icon } from '@/shared/ui/icon'
import { Segment, SegmentItem } from '@/shared/ui/segment'
import { mountHero, refreshSprites } from '@/shared/ui/sprite'

import styles from './Hero.module.css'

export interface IHeroNavItem {
  href: string
  label: ReactNode
  current?: boolean
}

export type THeroSky = 'day' | 'sunset' | 'night'

export interface IHeroProps {
  brand: ReactNode
  brandHref?: string
  title: ReactNode
  lead: ReactNode
  actions?: ReactNode
  navItems?: IHeroNavItem[]
  navAriaLabel?: string
  locale?: string
  locales?: Array<{ code: string; label: ReactNode }>
  onLocaleChange?: (code: string) => void
  localeAriaLabel?: string
  theme?: 'day' | 'night'
  onThemeToggle?: () => void
  themeLabel?: ReactNode
  themeAriaLabel?: string
  /** Manual sky override from vitrina; omit to follow page theme. */
  sky?: THeroSky
  className?: string
}

/** First-screen hero: pixel sky, flying dragon, header slot and CTA copy. */
const Hero = (props: IHeroProps) => {
  const {
    brand,
    brandHref = '/',
    title,
    lead,
    actions,
    navItems = [],
    navAriaLabel,
    locale,
    locales = [],
    onLocaleChange,
    localeAriaLabel,
    theme: themeProp,
    onThemeToggle,
    themeLabel,
    themeAriaLabel,
    sky,
    className,
  } = props

  const rootRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const storeTheme = useUiStore((state) => state.theme)
  const theme = themeProp ?? storeTheme
  const night = theme === 'night'

  useEffect(() => {
    const el = rootRef.current
    if (!el) {
      return
    }

    mountHero(el)
  }, [])

  useEffect(() => {
    refreshSprites()
  }, [theme, sky])

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <section
      ref={rootRef}
      className={rootClass}
      data-sky={sky}
    >
      <canvas
        className={styles.layer}
        data-layer="sky"
        aria-hidden="true"
      />
      <canvas
        className={[styles.layer, styles.mid].join(' ')}
        data-layer="mid"
        aria-hidden="true"
      />
      <canvas
        className={[styles.layer, styles.fly].join(' ')}
        data-layer="fly"
        aria-hidden="true"
      />

      <header className={styles.header}>
        <Brand to={brandHref}>{brand}</Brand>
        {navItems.length > 0 ? (
          <nav className={styles.nav} aria-label={navAriaLabel}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                aria-current={item.current ? 'page' : undefined}
                onClick={(event) => {
                  handleInPageHashNav(event, item.href, location.pathname)
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <span className={styles.nav} aria-hidden="true" />
        )}
        {locales.length > 0 && onLocaleChange && localeAriaLabel ? (
          <Segment
            className={styles.headerLocale}
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
        ) : null}
        {onThemeToggle ? (
          <Button
            className={styles.themeButton}
            type="button"
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            aria-label={themeAriaLabel}
            aria-pressed={night}
          >
            <Icon name={night ? 'sun' : 'moon'} />
            <span className={styles.themeText}>{themeLabel}</span>
          </Button>
        ) : null}
      </header>

      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.lead}>{lead}</p>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </section>
  )
}

export default Hero
