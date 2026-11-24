import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Steps.module.css'

export type TStepsItemStatus = 'todo' | 'done' | 'current'

export interface IStepsItem {
  id: string
  label: ReactNode
  status?: TStepsItemStatus
}

export interface IStepsProps extends HTMLAttributes<HTMLOListElement> {
  items: IStepsItem[]
}

/** Booking progress steps: done / current / upcoming. */
const Steps = (props: IStepsProps) => {
  const { items, className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <ol className={rootClass} {...rest}>
      {items.map((item) => {
        const status = item.status ?? 'todo'
        const itemClass = [
          styles.item,
          status === 'done' ? styles.done : '',
          status === 'current' ? styles.current : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <li
            key={item.id}
            className={itemClass}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span className={styles.label}>{item.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default Steps
