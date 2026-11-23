import type { HTMLAttributes, ReactNode } from 'react'

import styles from './VisuallyHidden.module.css'

export interface IVisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

/** Screen-reader-only text. */
const VisuallyHidden = (props: IVisuallyHiddenProps) => {
  const { children, className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <span className={rootClass} {...rest}>
      {children}
    </span>
  )
}

export default VisuallyHidden
