import type { ReactNode } from 'react'

import { CardPic } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'

import styles from './DragonPage.module.css'

export interface IDragonPageProps {
  back: ReactNode
  picture: ReactNode
  pictureTile?: string
  pictureLabel?: string
  name: ReactNode
  about: ReactNode
  rateAmount: ReactNode
  rateUnit: ReactNode
  rateHint?: ReactNode
  children: ReactNode
  className?: string
}

/** Dragon detail layout: sticky side + booking panel (vitrina #s-drakon). */
const DragonPage = (props: IDragonPageProps) => {
  const {
    back,
    picture,
    pictureTile,
    pictureLabel,
    name,
    about,
    rateAmount,
    rateUnit,
    rateHint,
    children,
    className,
  } = props

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div>
      <p className={styles.back}>{back}</p>
      <div className={rootClass}>
        <div className={styles.side}>
          <CardPic
            className={styles.pic}
            tile={pictureTile}
            aria-label={pictureLabel}
          >
            {picture}
          </CardPic>
          <Typography className={styles.title} variant="h1">
            {name}
          </Typography>
          <Typography className={styles.about} variant="text">
            {about}
          </Typography>
          <div className={styles.rate}>
            <p className={styles.price}>
              <b className={styles.priceStrong}>{rateAmount}</b> {rateUnit}
            </p>
            {rateHint ? (
              <Typography className={styles.rateHint} variant="small" muted>
                {rateHint}
              </Typography>
            ) : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export default DragonPage
