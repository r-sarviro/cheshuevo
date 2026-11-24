import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'
import { Icon } from '@/shared/ui/icon'

import { useInstallPrompt } from '../model/useInstallPrompt'

export interface IInstallAppButtonProps {
  className?: string
}

/** Footer control: shows only when the browser can install the PWA. */
const InstallAppButton = (props: IInstallAppButtonProps) => {
  const { className } = props
  const { t } = useTranslation()
  const { canInstall, install } = useInstallPrompt()

  if (!canInstall) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => {
        void install()
      }}
    >
      <Icon name="home" aria-hidden />
      {t('landing.installApp')}
    </Button>
  )
}

export default InstallAppButton
