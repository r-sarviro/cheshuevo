import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { logoutCustomer, useCabinetSessionStore } from '@/entities/customer'
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
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    if (pending) return
    setPending(true)
    try {
      await logoutCustomer()
    } catch {
      // Local sign-out still required if the token is already invalid.
    } finally {
      signOut()
      setPending(false)
      onLogout?.()
    }
  }

  return (
    <ButtonText
      type="button"
      className={className}
      aria-label={t('cabinet.logout')}
      disabled={pending}
      onClick={() => {
        void handleClick()
      }}
    >
      <Icon name="exit" />
      {children ?? <span>{t('cabinet.logout')}</span>}
    </ButtonText>
  )
}

export default LogoutButton
