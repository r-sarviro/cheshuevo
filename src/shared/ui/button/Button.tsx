import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Loader } from '@/shared/ui/loader'

import styles from './Button.module.css'

export type TButtonVariant = 'primary' | 'ghost' | 'danger'

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant
  size?: 'md' | 'sm'
  block?: boolean
  iconOnly?: boolean
  loading?: boolean
  children?: ReactNode
}

/** Stepped primary/ghost/danger button with key shadow. */
const Button = (props: IButtonProps) => {
  const {
    variant = 'primary',
    size = 'md',
    block = false,
    iconOnly = false,
    loading = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  } = props

  const rootClass = [
    styles.btn,
    variant === 'ghost' ? styles.ghost : '',
    variant === 'danger' ? styles.danger : '',
    size === 'sm' ? styles.sm : '',
    block ? styles.block : '',
    iconOnly ? styles.iconOnly : '',
    loading ? styles.isLoading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={rootClass}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {loading ? <Loader /> : null}
      {children}
    </button>
  )
}

export interface IButtonTextProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/** Textual secondary action without a frame. */
const ButtonText = (props: IButtonTextProps) => {
  const { className, children, type = 'button', ...rest } = props
  const rootClass = [styles.text, className].filter(Boolean).join(' ')

  return (
    <button className={rootClass} type={type} {...rest}>
      {children}
    </button>
  )
}

export { ButtonText }
export default Button
