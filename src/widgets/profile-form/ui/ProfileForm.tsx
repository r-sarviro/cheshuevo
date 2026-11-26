import { useId, type FormEvent, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, ButtonText } from '@/shared/ui/button'
import { Field, Input } from '@/shared/ui/field'
import { Icon } from '@/shared/ui/icon'
import { ReadonlyField } from '@/shared/ui/readonly-field'
import { Typography } from '@/shared/ui/typography'

import styles from './ProfileForm.module.css'

export interface IProfileFormValues {
  name: string
  phone: string
}

export interface IProfileFormProps {
  email: string
  defaultValues: IProfileFormValues
  onSubmit: (values: IProfileFormValues) => void | Promise<void>
  onLogout?: () => void
  loading?: boolean
  disabled?: boolean
  alert?: ReactNode
  title?: ReactNode
  className?: string
}

function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length !== 11 || !/^[78]/.test(digits)) return null
  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}

/** Cabinet profile editor: name, optional phone, locked email. */
const ProfileForm = (props: IProfileFormProps) => {
  const {
    email,
    defaultValues,
    onSubmit,
    onLogout,
    loading = false,
    disabled = false,
    alert,
    title,
    className,
  } = props
  const { t } = useTranslation()
  const nameId = useId()
  const phoneId = useId()
  const nameErrId = `${nameId}-err`
  const phoneErrId = `${phoneId}-err`
  const phoneHintId = `${phoneId}-hint`
  const emailHintId = useId()

  const { register, handleSubmit, setError, formState } =
    useForm<IProfileFormValues>({
      defaultValues,
      mode: 'onSubmit',
    })

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  const submit = handleSubmit(async (data) => {
    const name = data.name.trim()
    if (!name) {
      setError('name', { type: 'required' })
      return
    }
    if (name.length > 50) {
      setError('name', { type: 'maxLength' })
      return
    }

    const phone = normalizePhone(data.phone)
    if (phone === null) {
      setError('phone', { type: 'pattern' })
      return
    }

    await onSubmit({ name, phone })
  })

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void submit(event)
  }

  const nameError = formState.errors.name
    ? formState.errors.name.type === 'maxLength'
      ? t('cabinet.nameTooLong')
      : t('cabinet.nameRequired')
    : undefined

  const phoneError = formState.errors.phone
    ? t('cabinet.phoneError')
    : undefined

  return (
    <div className={rootClass}>
      <Typography variant="h1" tabIndex={-1}>
        {title ?? t('cabinet.profileTitle')}
      </Typography>
      <form className={styles.form} noValidate onSubmit={onFormSubmit}>
        {alert}
        <Field
          label={t('cabinet.nameLabel')}
          htmlFor={nameId}
          error={nameError}
          errorId={nameErrId}
        >
          <Input
            id={nameId}
            autoComplete="name"
            maxLength={60}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? nameErrId : undefined}
            disabled={disabled || loading}
            {...register('name')}
          />
        </Field>
        <Field
          label={t('cabinet.phoneLabel')}
          htmlFor={phoneId}
          hint={t('cabinet.phoneHint')}
          hintId={phoneHintId}
          error={phoneError}
          errorId={phoneErrId}
        >
          <Input
            id={phoneId}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={
              [phoneHintId, phoneError ? phoneErrId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            disabled={disabled || loading}
            {...register('phone')}
          />
        </Field>
        <Field
          label={t('cabinet.emailLabel')}
          hint={t('cabinet.emailHint')}
          hintId={emailHintId}
        >
          <ReadonlyField>{email}</ReadonlyField>
        </Field>
        <div className={styles.actions}>
          <Button
            type="submit"
            loading={loading}
            disabled={disabled || loading}
          >
            {t('cabinet.save')}
          </Button>
          <ButtonText type="button" onClick={onLogout} disabled={loading}>
            <Icon name="exit" />
            {t('cabinet.logout')}
          </ButtonText>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
