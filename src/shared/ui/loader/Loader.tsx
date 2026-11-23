import type { HTMLAttributes } from 'react'

import styles from './Loader.module.css'

export type ILoaderProps = HTMLAttributes<HTMLSpanElement>

/** Pearl orbit loader from the design-system foundation. */
const Loader = (props: ILoaderProps) => {
  const { className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return <span className={rootClass} aria-hidden="true" {...rest} />
}

export default Loader
