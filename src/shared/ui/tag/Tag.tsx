import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Tag.module.css'

export interface ITagProps extends HTMLAttributes<HTMLLIElement> {
  /** Property name before the value, e.g. «Стихия». */
  tagKey?: string
  children: ReactNode
}

/** Clip-path catalog tag (no semantic tone/icon — unlike Badge). */
const Tag = (props: ITagProps) => {
  const { tagKey, className, children, ...rest } = props
  const rootClass = [styles.tag, className].filter(Boolean).join(' ')

  return (
    <li className={rootClass} {...rest}>
      {tagKey ? <span className={styles.key}>{tagKey}</span> : null}
      {children}
    </li>
  )
}

export interface ITagsProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode
}

/** Flex wrap list for Tag chips. */
const Tags = (props: ITagsProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <ul className={rootClass} {...rest}>
      {children}
    </ul>
  )
}

export { Tags }
export default Tag
