import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useUiStore } from '@/shared/model'
import { Button } from '@/shared/ui/button'
import buttonStyles from '@/shared/ui/button/Button.module.css'
import { Card, CardBody, CardPic } from '@/shared/ui/card'
import { Icon } from '@/shared/ui/icon'
import skeletonStyles from '@/shared/ui/skeleton/Skeleton.module.css'
import {
  DragonSheetSprite,
  PixelSprite,
  hasDragonSheet,
} from '@/shared/ui/sprite'
import { Tag, Tags } from '@/shared/ui/tag'

import { resolveDragonLocale } from '../lib/dragonCopy'
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
  const { t } = useTranslation()
  const locale = useUiStore((s) => s.locale)
  const copy = dragon ? resolveDragonLocale(dragon, locale) : null

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
          <div
            className={[styles.tags, styles.tagsGhost].join(' ')}
            aria-hidden="true"
          >
            <span
              className={[styles.ghostTag, skeletonStyles.root].join(' ')}
              style={{ width: 128 }}
            />
            <span
              className={[styles.ghostTag, skeletonStyles.root].join(' ')}
              style={{ width: 108 }}
            />
            <span
              className={[styles.ghostTag, skeletonStyles.root].join(' ')}
              style={{ width: 96 }}
            />
          </div>
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
          <p className={styles.fit} aria-hidden="true">
            <span
              className={[styles.ghost, skeletonStyles.root].join(' ')}
              style={{ width: '58%' }}
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

  if (!dragon || !copy) {
    return null
  }

  const nameContent = href ? (
    <Link className={styles.nameLink} to={href}>
      {copy.name}
    </Link>
  ) : (
    copy.name
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
      <DragonSheetSprite name={dragon.spriteKey} label={copy.name} />
    ) : dragon.spriteKey ? (
      <PixelSprite name={dragon.spriteKey} fit label={copy.name} />
    ) : dragon.imageUrl ? (
      <img src={dragon.imageUrl} alt="" />
    ) : null)

  const picClass = [
    styles.pic,
    imageFailed ? styles.picFailed : styles.picEarth,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Card as="article" className={rootClass}>
      <CardPic
        className={picClass}
        tile={imageFailed ? undefined : dragon.tileToken}
      >
        {picContent}
      </CardPic>
      <CardBody className={styles.body}>
        <h3 className={styles.name}>{nameContent}</h3>
        {copy.tags.length ? (
          <Tags className={styles.tags} aria-label={t('catalog.tagsLabel')}>
            {copy.tags.map((tag) => (
              <Tag key={`${tag.key ?? ''}:${tag.label}`} tagKey={tag.key}>
                {tag.label}
              </Tag>
            ))}
          </Tags>
        ) : null}
        <p className={styles.about}>{copy.shortDescription}</p>
        {copy.fit ? (
          <p className={styles.fit}>{t('catalog.fit', { fit: copy.fit })}</p>
        ) : null}
        <div className={styles.foot}>
          <p className={styles.price}>
            <b className={styles.priceStrong}>
              {dragon.hourlyRate}&nbsp;
              {dragon.currency === 'RUB' ? '₽' : dragon.currency}
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
