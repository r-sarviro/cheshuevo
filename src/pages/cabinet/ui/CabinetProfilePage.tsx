import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  logoutCustomer,
  useCabinetSessionStore,
  useCustomerMeQuery,
} from '@/entities/customer'
import { CABINET_LOGIN_PATH } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { ProfileForm } from '@/widgets/profile-form'

/** Read-only cabinet profile from GET customer/me. */
const CabinetProfilePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const email = useCabinetSessionStore((s) => s.email) ?? ''
  const name = useCabinetSessionStore((s) => s.name)
  const setProfile = useCabinetSessionStore((s) => s.setProfile)
  const signOut = useCabinetSessionStore((s) => s.signOut)
  const meQuery = useCustomerMeQuery()

  useDocumentMeta({
    title: t('seo.cabinet.profile.title'),
    description: t('seo.cabinet.profile.description'),
    noIndex: true,
  })

  useEffect(() => {
    if (!meQuery.data) return
    setProfile({ email: meQuery.data.email, name: meQuery.data.name })
  }, [meQuery.data, setProfile])

  const onLogout = async () => {
    try {
      await logoutCustomer()
    } catch {
      // Clear local session anyway.
    }
    signOut()
    void navigate(CABINET_LOGIN_PATH, {
      replace: true,
      state: { flash: 'loggedOut' },
    })
  }

  return (
    <ProfileForm
      email={meQuery.data?.email ?? email}
      name={meQuery.data?.name ?? name}
      onLogout={() => {
        void onLogout()
      }}
    />
  )
}

export default CabinetProfilePage
