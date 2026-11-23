import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

import styles from './Segment.module.css'

export interface ISegmentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  'aria-label': string
}

/** Compact 2–3 option switch (theme, locale, period). */
const Segment = (props: ISegmentProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} role="group" {...rest}>
      {children}
    </div>
  )
}

export interface ISegmentItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  children: ReactNode
}

const SegmentItem = (props: ISegmentItemProps) => {
  const {
    pressed = false,
    className,
    children,
    type = 'button',
    ...rest
  } = props
  const rootClass = [styles.item, className].filter(Boolean).join(' ')

  return (
    <button className={rootClass} type={type} aria-pressed={pressed} {...rest}>
      {children}
    </button>
  )
}

export { SegmentItem }
export default Segment
