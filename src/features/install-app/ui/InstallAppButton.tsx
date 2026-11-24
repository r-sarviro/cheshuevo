import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'
import { Icon } from '@/shared/ui/icon'

import { useInstallPrompt } from '../model/useInstallPrompt'
import styles from './InstallAppButton.module.css'

export interface IInstallAppButtonProps {
  className?: string
}

/** Footer control: shows only when the browser can install the PWA. */
const InstallAppButton = (props: IInstallAppButtonProps) => {
  const { className } = props
  const { t } = useTranslation()
  const { canInstall, install } = useInstallPrompt()
  const label = t('landing.installApp')
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  if (!canInstall) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={rootClass}
      aria-label={label}
      onClick={() => {
        void install()
      }}
    >
      <Icon name="download" aria-hidden />
      <span className={styles.label}>{label}</span>
    </Button>
  )
}

export default InstallAppButton
