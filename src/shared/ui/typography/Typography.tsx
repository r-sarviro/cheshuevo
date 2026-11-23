import type { ElementType, HTMLAttributes, ReactNode } from 'react'

import styles from './Typography.module.css'

type TTypographyVariant =
  'sign' | 'h1' | 'h2' | 'h3' | 'label' | 'lead' | 'text' | 'small'

const VARIANT_TAG: Record<TTypographyVariant, ElementType> = {
  sign: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  label: 'span',
  lead: 'p',
  text: 'p',
  small: 'p',
}

export interface ITypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TTypographyVariant
  as?: ElementType
  muted?: boolean
  children: ReactNode
}

/** Display and body text styles from the design-system foundation. */
const Typography = (props: ITypographyProps) => {
  const {
    variant = 'text',
    as,
    muted = false,
    className,
    children,
    ...rest
  } = props
  const Tag = as ?? VARIANT_TAG[variant]
  const rootClass = [styles[variant], muted ? styles.muted : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={rootClass} {...rest}>
      {children}
    </Tag>
  )
}

export interface INumProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

/** Tabular digits for prices, codes, and counters. */
const Num = (props: INumProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.num, className].filter(Boolean).join(' ')

  return (
    <span className={rootClass} {...rest}>
      {children}
    </span>
  )
}

export { Num }
export default Typography
