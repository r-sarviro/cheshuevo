import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { Card, CardBody, CardPic } from '@/shared/ui/card'
import { Icon } from '@/shared/ui/icon'
import skeletonStyles from '@/shared/ui/skeleton/Skeleton.module.css'
import {
  DragonSheetSprite,
  DragonSprite,
  hasDragonSheet,
} from '@/shared/ui/sprite'

import type { IDragonListItem } from '../model/types'
import styles from './DragonCard.module.css'

export interface IDragonCardProps {
  dragon?: IDragonListItem
  href?: string
  loading?: boolean
  loadingLabel?: string
  imageFailed?: boolean
  picture?: ReactNode
  priceLabel: ReactNode
  actionLabel: ReactNode
  actionHref?: string
  onActionClick?: () => void
  className?: string
}

/** Catalog card: picture, name, blurb, hourly price, CTA. */
const DragonCard = (props: IDragonCardProps) => {
  const {
    dragon,
    href,
    loading = false,
    loadingLabel,
    imageFailed = false,
    picture,
    priceLabel,
    actionLabel,
    actionHref,
    onActionClick,
    className,
  } = props

  const rootClass = [styles.root, loading ? styles.loading : '', className]
    .filter(Boolean)
    .join(' ')

  if (loading) {
    return (
      <Card
        as="article"
        className={rootClass}
        aria-busy="true"
        aria-label={loadingLabel}
      >
        <CardPic
          className={[styles.pic, skeletonStyles.root].join(' ')}
          aria-hidden="true"
        />
        <CardBody className={styles.body}>
          <p className={styles.name}>
            <span
              className={[styles.ghost, skeletonStyles.root].join(' ')}
              style={{ width: '55%' }}
              aria-hidden="true"
            />
          </p>
          <p className={styles.about}>
            <span
              className={[styles.ghost, skeletonStyles.root].join(' ')}
              aria-hidden="true"
            />
            <span
              className={[styles.ghost, skeletonStyles.root].join(' ')}
              style={{ width: '70%', marginTop: 6 }}
              aria-hidden="true"
            />
          </p>
          <div className={styles.foot}>
            <span
              className={[styles.ghost, skeletonStyles.root].join(' ')}
              style={{ width: 90, height: 32 }}
              aria-hidden="true"
            />
            <span
              className={[styles.ghost, skeletonStyles.root].join(' ')}
              style={{ width: 140, height: 44 }}
              aria-hidden="true"
            />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!dragon) {
    return null
  }

  const nameContent = href ? (
    <Link className={styles.nameLink} to={href}>
      {dragon.name}
    </Link>
  ) : (
    dragon.name
  )

  const actionClass = [buttonStyles.btn, styles.action].join(' ')
  const actionNode = actionHref ? (
    <Link className={actionClass} to={actionHref}>
      {actionLabel}
    </Link>
  ) : (
    <Button className={styles.action} type="button" onClick={onActionClick}>
      {actionLabel}
    </Button>
  )

  const picContent =
    picture ??
    (imageFailed ? (
      <Icon name="egg" xl />
    ) : dragon.spriteKey && hasDragonSheet(dragon.spriteKey) ? (
      <DragonSheetSprite name={dragon.spriteKey} label={dragon.name} />
    ) : dragon.spriteKey ? (
      <DragonSprite name={dragon.spriteKey} fit label={dragon.name} />
    ) : dragon.imageUrl ? (
      <img src={dragon.imageUrl} alt="" />
    ) : null)

  return (
    <Card as="article" className={rootClass}>
      <CardPic
        className={[styles.pic, imageFailed ? styles.picFailed : '']
          .filter(Boolean)
          .join(' ')}
        tile={imageFailed ? undefined : dragon.tileToken}
      >
        {picContent}
      </CardPic>
      <CardBody className={styles.body}>
        <h3 className={styles.name}>{nameContent}</h3>
        <p className={styles.about}>{dragon.shortDescription}</p>
        <div className={styles.foot}>
          <p className={styles.price}>
            <b className={styles.priceStrong}>
              {dragon.hourlyRate}&nbsp;{dragon.currency}
            </b>{' '}
            {priceLabel}
          </p>
          {actionNode}
        </div>
      </CardBody>
    </Card>
  )
}

export default DragonCard
