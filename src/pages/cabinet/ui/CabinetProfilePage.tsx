import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useCabinetSessionStore } from '@/features/cabinet-auth'
import { useUpdateProfileMutation } from '@/features/update-profile'
import { CABINET_LOGIN_PATH } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { Note } from '@/shared/ui/note'
import { ProfileForm, type IProfileFormValues } from '@/widgets/profile-form'

/** Cabinet profile editor with save flash and logout. */
const CabinetProfilePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const email = useCabinetSessionStore((s) => s.email) ?? ''
  const name = useCabinetSessionStore((s) => s.name)
  const phone = useCabinetSessionStore((s) => s.phone)
  const signOut = useCabinetSessionStore((s) => s.signOut)
  const updateProfile = useUpdateProfileMutation()
  const [alert, setAlert] = useState<ReactNode>(null)

  useDocumentMeta({
    title: t('seo.cabinet.profile.title'),
    description: t('seo.cabinet.profile.description'),
    noIndex: true,
  })

  const onSubmit = async (values: IProfileFormValues) => {
    setAlert(null)
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        phone: values.phone,
      })
      setAlert(
        <Note tone="jade" icon="check">
          {t('cabinet.saveSuccess')}
        </Note>,
      )
    } catch {
      setAlert(
        <Note tone="peach" icon="cross" alert>
          {t('cabinet.saveFailed')}
        </Note>,
      )
    }
  }

  const onLogout = () => {
    signOut()
    void navigate(CABINET_LOGIN_PATH, {
      replace: true,
      state: { flash: 'loggedOut' },
    })
  }

  return (
    <ProfileForm
      email={email}
      defaultValues={{
        name: name ?? '',
        phone: phone ?? '',
      }}
      onSubmit={onSubmit}
      onLogout={onLogout}
      loading={updateProfile.isPending}
      alert={alert}
    />
  )
}

export default CabinetProfilePage
