import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

import styles from './EmptyState.module.css'

export interface IEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  picture?: ReactNode
  pictureStyle?: CSSProperties
  heading?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

/** Centered empty / error / loading placeholder for lists and pages. */
const EmptyState = (props: IEmptyStateProps) => {
  const {
    picture,
    pictureStyle,
    heading,
    action,
    children,
    className,
    ...rest
  } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} {...rest}>
      {picture ? (
        <div className={styles.pic} style={pictureStyle}>
          {picture}
        </div>
      ) : null}
      {heading}
      {typeof children === 'string' || typeof children === 'number' ? (
        <p>{children}</p>
      ) : (
        children
      )}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}

export default EmptyState
