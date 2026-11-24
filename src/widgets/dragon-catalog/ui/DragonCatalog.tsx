import type { ReactNode } from 'react'

import styles from './DragonCatalog.module.css'

export interface IDragonCatalogProps {
  children: ReactNode
  className?: string
  'aria-label'?: string
}

/** Responsive grid shell for dragon cards. */
const DragonCatalog = (props: IDragonCatalogProps) => {
  const { children, className, 'aria-label': ariaLabel } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <ul className={rootClass} aria-label={ariaLabel}>
      {children}
    </ul>
  )
}

export interface IDragonCatalogItemProps {
  children: ReactNode
  className?: string
}

const DragonCatalogItem = (props: IDragonCatalogItemProps) => {
  const { children, className } = props
  const rootClass = [styles.item, className].filter(Boolean).join(' ')
  return <li className={rootClass}>{children}</li>
}

export { DragonCatalogItem }
export default DragonCatalog
