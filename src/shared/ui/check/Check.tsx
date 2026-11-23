import type { InputHTMLAttributes, ReactNode } from 'react'

import styles from './Check.module.css'

export interface ICheckProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  children: ReactNode
}

/** Pixel checkbox with stepped frame. */
const Check = (props: ICheckProps) => {
  const { children, className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <label className={rootClass}>
      <input className={styles.input} type="checkbox" {...rest} />
      <span>{children}</span>
    </label>
  )
}

export default Check
