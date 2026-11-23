import type { HTMLAttributes } from 'react'

import styles from './Skeleton.module.css'

export type ISkeletonProps = HTMLAttributes<HTMLDivElement>

/** Checkerboard loading placeholder without shimmer. */
const Skeleton = (props: ISkeletonProps) => {
  const { className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  return <div className={rootClass} aria-hidden="true" {...rest} />
}

export default Skeleton
