import { useTranslation } from 'react-i18next'

import styles from './HomePage.module.css'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <h1 className={styles.title}>{t('app.title')}</h1>
        <p className={styles.tagline}>{t('app.tagline')}</p>
        <p className={styles.cta}>{t('home.cta')}</p>
      </section>
    </main>
  )
}
