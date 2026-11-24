import { useTranslation } from 'react-i18next'

import { PLAY_PATH } from '@/shared/config'
import { useDocumentMeta } from '@/shared/lib/document-meta'
import { DragonFlightGame } from '@/widgets/dragon-flight'

import styles from './PlayPage.module.css'

/** Fullscreen dragon flight mini-game. */
const PlayPage = () => {
  const { t } = useTranslation()

  useDocumentMeta({
    title: t('seo.play.title'),
    description: t('seo.play.description'),
    canonicalPath: PLAY_PATH,
  })

  return (
    <div className={styles.page}>
      <DragonFlightGame />
    </div>
  )
}

export default PlayPage
