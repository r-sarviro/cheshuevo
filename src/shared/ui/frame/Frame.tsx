import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Frame.module.css'

export interface IFrameProps extends HTMLAttributes<HTMLDivElement> {
  flat?: boolean
  size?: 'md' | 'sm'
  children: ReactNode
}

/** Stepped frame with optional block shadow. */
const Frame = (props: IFrameProps) => {
  const { flat = false, size = 'md', className, children, ...rest } = props
  const rootClass = [
    styles.root,
    flat ? styles.flat : '',
    size === 'sm' ? styles.sm : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} {...rest}>
      {children}
    </div>
  )
}

export default Frame
