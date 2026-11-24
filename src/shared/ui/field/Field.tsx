import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

import { Icon } from '@/shared/ui/icon'

import styles from './Field.module.css'

export interface IFieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  htmlFor?: string
  hintId?: string
  errorId?: string
  children: ReactNode
  className?: string
}

/** Labeled control stack with optional hint or error. */
const Field = (props: IFieldProps) => {
  const {
    label,
    hint,
    error,
    htmlFor,
    hintId,
    errorId,
    children,
    className,
  } = props
  const rootClass = [styles.field, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      {label ? (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className={styles.error} role="alert" id={errorId}>
          <Icon name="cross" className={styles.errorIcon} />
          <span>{error}</span>
        </p>
      ) : null}
      {!error && hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export type IInputProps = InputHTMLAttributes<HTMLInputElement>

const Input = (props: IInputProps) => {
  const { className, ...rest } = props
  const rootClass = [styles.control, className].filter(Boolean).join(' ')
  return <input className={rootClass} {...rest} />
}

export type ITextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = (props: ITextareaProps) => {
  const { className, ...rest } = props
  const rootClass = [styles.textarea, className].filter(Boolean).join(' ')
  return <textarea className={rootClass} {...rest} />
}

export interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

const Select = (props: ISelectProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.select, className].filter(Boolean).join(' ')
  return (
    <select className={rootClass} {...rest}>
      {children}
    </select>
  )
}

export { Input, Textarea, Select }
export default Field
