import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useCabinetSessionStore } from '@/entities/customer'
import { ButtonText } from '@/shared/ui/button'
import { Icon } from '@/shared/ui/icon'

export interface ILogoutButtonProps {
  className?: string
  children?: ReactNode
  onLogout?: () => void
}

/** Text button that clears cabinet session (CAB-006). */
const LogoutButton = (props: ILogoutButtonProps) => {
  const { className, children, onLogout } = props
  const { t } = useTranslation()
  const signOut = useCabinetSessionStore((s) => s.signOut)

  const handleClick = () => {
    signOut()
    onLogout?.()
  }

  return (
    <ButtonText
      type="button"
      className={className}
      aria-label={t('cabinet.logout')}
      onClick={handleClick}
    >
      <Icon name="exit" />
      {children ?? <span>{t('cabinet.logout')}</span>}
    </ButtonText>
  )
}

export default LogoutButton
