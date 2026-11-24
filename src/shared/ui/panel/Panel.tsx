import type { ElementType, HTMLAttributes, ReactNode } from 'react'

import styles from './Panel.module.css'

export interface IPanelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children: ReactNode
}

/** Stepped surface panel for booking forms and samples. */
const Panel = (props: IPanelProps) => {
  const { as: Tag = 'div', className, children, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <Tag className={rootClass} {...rest}>
      {children}
    </Tag>
  )
}

export default Panel
