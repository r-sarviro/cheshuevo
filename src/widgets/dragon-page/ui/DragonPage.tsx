import type { ReactNode } from 'react'

import { CardPic } from '@/shared/ui/card'
import { Tag, Tags } from '@/shared/ui/tag'
import { Typography } from '@/shared/ui/typography'

import styles from './DragonPage.module.css'

export interface IDragonPageTag {
  label: string
  key?: string
}

export interface IDragonPageProps {
  back: ReactNode
  picture: ReactNode
  pictureTile?: string
  pictureLabel?: string
  name: ReactNode
  tags?: IDragonPageTag[]
  tagsLabel?: string
  about: ReactNode
  fit?: ReactNode
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
    tags,
    tagsLabel,
    about,
    fit,
    rateAmount,
    rateUnit,
    rateHint,
    children,
    className,
  } = props

  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const picClass = [styles.pic, styles.picEarth].join(' ')

  return (
    <div>
      <p className={styles.back}>{back}</p>
      <div className={rootClass}>
        <div className={styles.side}>
          <CardPic
            className={picClass}
            tile={pictureTile}
            aria-label={pictureLabel}
          >
            {picture}
          </CardPic>
          <Typography className={styles.title} variant="h1">
            {name}
          </Typography>
          {tags?.length ? (
            <Tags className={styles.tags} aria-label={tagsLabel}>
              {tags.map((tag) => (
                <Tag key={`${tag.key ?? ''}:${tag.label}`} tagKey={tag.key}>
                  {tag.label}
                </Tag>
              ))}
            </Tags>
          ) : null}
          <Typography className={styles.about} variant="text">
            {about}
          </Typography>
          {fit ? <p className={styles.fit}>{fit}</p> : null}
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
