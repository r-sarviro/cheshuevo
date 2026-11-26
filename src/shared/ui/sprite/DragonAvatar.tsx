import type { ImgHTMLAttributes } from 'react'

import styles from './DragonAvatar.module.css'
import { dragonAvatarUrl } from './dragonAvatarUrl'

export interface IDragonAvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  /** Catalog slug (`spriteKey`), maps to `/sprites/dragons/avatars/<slug>.png`. */
  name: string
  size?: number
}

/** Static 32×32 dragon head for lists / compact chrome (DRG-003). */
const DragonAvatar = (props: IDragonAvatarProps) => {
  const { name, size = 32, alt = '', className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <img
      className={rootClass}
      src={dragonAvatarUrl(name)}
      alt={alt}
      width={size}
      height={size}
      decoding="async"
      {...rest}
    />
  )
}

export default DragonAvatar
