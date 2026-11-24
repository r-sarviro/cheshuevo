import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import styles from './Brand.module.css'

type TBrandAnchorProps = {
  to?: undefined
} & AnchorHTMLAttributes<HTMLAnchorElement>

type TBrandRouterProps = {
  to: LinkProps['to']
} & Omit<LinkProps, 'to'>

export type IBrandProps = {
  children: ReactNode
} & (TBrandAnchorProps | TBrandRouterProps)

/** Pixel signboard wordmark; colors do not follow theme. */
const Brand = (props: IBrandProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest
    return (
      <Link className={rootClass} to={to} {...linkRest}>
        {children}
      </Link>
    )
  }

  const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>
  return (
    <a className={rootClass} {...anchorRest}>
      {children}
    </a>
  )
}

export default Brand
