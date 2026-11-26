import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ButtonText } from '@/shared/ui/button'
import { Icon, type TIconName } from '@/shared/ui/icon'
import { Wrap } from '@/shared/ui/layout'

import styles from './CabinetShell.module.css'

export interface ICabinetShellTabHrefs {
  broni: string
  profil: string
}

export interface ICabinetShellProps {
  name?: string
  email: string
  tabHrefs: ICabinetShellTabHrefs
  onLogout?: () => void
  children: ReactNode
  className?: string
}

const TABS: Array<{
  id: keyof ICabinetShellTabHrefs
  labelKey: string
  icon: TIconName
}> = [
  { id: 'broni', labelKey: 'cabinet.tabBroni', icon: 'list' },
  { id: 'profil', labelKey: 'cabinet.tabProfil', icon: 'user' },
]

/** LK chrome: account strip, section tabs, content area (kb-cab). */
const CabinetShell = (props: ICabinetShellProps) => {
  const { name, email, tabHrefs, onLogout, children, className } = props
  const { t } = useTranslation()
  const who = (name || email || '?').trim()
  const initial = who.charAt(0).toUpperCase()
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <Wrap className={rootClass}>
      <aside className={styles.side} aria-label={t('cabinet.sideAria')}>
        <div className={styles.acc}>
          <span className={styles.accPic} aria-hidden="true">
            {initial}
          </span>
          <span className={styles.accText}>
            {name ? <b className={styles.accName}>{name}</b> : null}
            <span className={styles.accMail}>{email}</span>
          </span>
          <ButtonText
            className={styles.accOut}
            type="button"
            onClick={onLogout}
            aria-label={t('cabinet.logout')}
          >
            <Icon name="exit" />
            <span>{t('cabinet.logout')}</span>
          </ButtonText>
        </div>
        <nav className={styles.tabs} aria-label={t('cabinet.tabsAria')}>
          {TABS.map((tab) => (
            <NavLink key={tab.id} to={tabHrefs[tab.id]} className={styles.tab}>
              <Icon name={tab.icon} className={styles.tabIcon} />
              <span>{t(tab.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>{children}</div>
    </Wrap>
  )
}

export default CabinetShell
