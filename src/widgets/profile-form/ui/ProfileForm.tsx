import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ButtonText } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Icon } from '@/shared/ui/icon'
import { ReadonlyField } from '@/shared/ui/readonly-field'
import { Typography } from '@/shared/ui/typography'

import styles from './ProfileForm.module.css'

export interface IProfileFormProps {
  email: string
  name: string | null
  onLogout?: () => void
  alert?: ReactNode
  title?: ReactNode
  className?: string
}

/** Read-only cabinet profile (PATCH /customer/me is not available yet). */
const ProfileForm = (props: IProfileFormProps) => {
  const { email, name, onLogout, alert, title, className } = props
  const { t } = useTranslation()
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <Typography variant="h1" tabIndex={-1}>
        {title ?? t('cabinet.profileTitle')}
      </Typography>
      <div className={styles.form}>
        {alert}
        <Field label={t('cabinet.nameLabel')}>
          <ReadonlyField>{name?.trim() || '—'}</ReadonlyField>
        </Field>
        <Field label={t('cabinet.emailLabel')} hint={t('cabinet.emailHint')}>
          <ReadonlyField>{email}</ReadonlyField>
        </Field>
        <div className={styles.actions}>
          <ButtonText type="button" onClick={onLogout}>
            <Icon name="exit" />
            {t('cabinet.logout')}
          </ButtonText>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
