import type { HTMLAttributes } from 'react'

import styles from './Divider.module.css'

export type IDividerProps = HTMLAttributes<HTMLHRElement>

/** Thin accent rule for separating page blocks. */
const Divider = (props: IDividerProps) => {
  const { className, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return <hr className={rootClass} {...rest} />
}

export default Divider
