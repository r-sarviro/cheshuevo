import type { HTMLAttributes, ReactNode } from 'react'

import { Icon } from '@/shared/ui/icon'

import styles from './ReadonlyField.module.css'

export interface IReadonlyFieldProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  className?: string
}

/** Locked sunk value row (kb-readonly) for non-editable profile fields. */
const ReadonlyField = (props: IReadonlyFieldProps) => {
  const { children, className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <p className={rootClass} {...rest}>
      <Icon name="lock" className={styles.icon} />
      <span>{children}</span>
    </p>
  )
}

export default ReadonlyField
