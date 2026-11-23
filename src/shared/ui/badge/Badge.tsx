import type { HTMLAttributes, ReactNode } from 'react'

import { Icon, type TIconName } from '@/shared/ui/icon'
import toneStyles from '@/shared/ui/tone/tone.module.css'
import type { TStatusKey, TToneKey } from '@/shared/ui/tone'

import styles from './Badge.module.css'

export interface IBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: TStatusKey
  tone?: TToneKey
  icon?: TIconName
  children: ReactNode
}

/** Status chip: icon + label + tone (color is only a helper). */
const Badge = (props: IBadgeProps) => {
  const { status, tone, icon, className, children, ...rest } = props
  const rootClass = [styles.root, tone ? toneStyles[tone] : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={rootClass} data-status={status} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  )
}

export default Badge
