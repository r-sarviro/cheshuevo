import type { HTMLAttributes, ReactNode } from 'react'

import { Icon, type TIconName } from '@/shared/ui/icon'
import toneStyles from '@/shared/ui/tone/tone.module.css'
import type { TToneKey } from '@/shared/ui/tone'

import styles from './Note.module.css'

export interface INoteProps extends HTMLAttributes<HTMLDivElement> {
  tone?: TToneKey
  icon?: TIconName
  heading?: ReactNode
  actions?: ReactNode
  alert?: boolean
  children: ReactNode
}

/** Inline page message with optional alert animation. */
const Note = (props: INoteProps) => {
  const {
    tone = 'sky',
    icon,
    heading,
    actions,
    alert = false,
    className,
    children,
    role,
    ...rest
  } = props

  const rootClass = [styles.root, toneStyles[tone], className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} role={alert ? 'alert' : role} {...rest}>
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
      <div className={styles.body}>
        {heading ? <p className={styles.title}>{heading}</p> : null}
        {typeof children === 'string' || typeof children === 'number' ? (
          <p>{children}</p>
        ) : (
          children
        )}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>
  )
}

export default Note
