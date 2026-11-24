import type { AnchorHTMLAttributes, ReactNode } from 'react'
import {
  Link as RouterLink,
  type LinkProps as TRouterLinkProps,
} from 'react-router-dom'

import styles from './Link.module.css'

export interface ILinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: TRouterLinkProps['to']
  children: ReactNode
}

/** Accent underline link from the design-system foundation. */
const Link = (props: ILinkProps) => {
  const { to, children, className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  if (to !== undefined) {
    return (
      <RouterLink className={rootClass} to={to} {...rest}>
        {children}
      </RouterLink>
    )
  }

  return (
    <a className={rootClass} {...rest}>
      {children}
    </a>
  )
}

export default Link
