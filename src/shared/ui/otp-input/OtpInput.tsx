import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type FieldsetHTMLAttributes,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'

import styles from './OtpInput.module.css'

const DEFAULT_LENGTH = 6

export interface IOtpInputProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  length?: number
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  digitLabel?: (index: number) => string
  'aria-label'?: string
}

/** Six-digit email code cells with paste and arrow navigation. */
const OtpInput = (props: IOtpInputProps) => {
  const {
    length = DEFAULT_LENGTH,
    value,
    onChange,
    invalid = false,
    disabled = false,
    digitLabel,
    className,
    'aria-label': ariaLabel,
    ...rest
  } = props

  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length)
  }, [length])

  const emit = (nextDigits: string[]) => {
    onChange(nextDigits.join('').slice(0, length))
  }

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = event.target.value.replace(/\D/g, '')
    const char = raw.slice(-1)
    const next = [...digits]
    next[index] = char
    emit(next)
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits]
      next[index - 1] = ''
      emit(next)
      inputsRef.current[index - 1]?.focus()
      event.preventDefault()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = (event.clipboardData.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, length)
    if (!pasted) {
      return
    }
    event.preventDefault()
    const next = Array.from({ length }, (_, index) => pasted[index] ?? '')
    emit(next)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  const rootClass = [
    styles.root,
    invalid ? styles.invalid : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <fieldset
      className={rootClass}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      {...rest}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node
          }}
          className={styles.cell}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          placeholder=" "
          disabled={disabled}
          aria-label={
            digitLabel ? digitLabel(index + 1) : String(index + 1)
          }
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          onPaste={handlePaste}
        />
      ))}
    </fieldset>
  )
}

export default OtpInput
