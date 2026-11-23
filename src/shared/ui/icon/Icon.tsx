import type { HTMLAttributes } from 'react'

import { ICON_GLYPHS, type TIconName } from './glyphs'
import styles from './Icon.module.css'

export interface IIconProps extends HTMLAttributes<HTMLSpanElement> {
  name: TIconName
  xl?: boolean
}

function buildRects(name: TIconName) {
  const rows = ICON_GLYPHS[name]
  const rects: { x: number; y: number; width: number }[] = []

  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] !== '#') {
        x += 1
        continue
      }

      let width = 1
      while (row[x + width] === '#') {
        width += 1
      }

      rects.push({ x, y, width })
      x += width
    }
  })

  return { size: rows.length, rects }
}

/** Pixel icon 16×16 (or 32×32) from the design-system glyph set. */
const Icon = (props: IIconProps) => {
  const { name, xl = false, className, ...rest } = props
  const { size, rects } = buildRects(name)
  const rootClass = [styles.root, xl ? styles.xl : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={rootClass} {...rest}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        focusable="false"
      >
        {rects.map((rect) => (
          <rect
            key={`${rect.x}-${rect.y}-${rect.width}`}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={1}
          />
        ))}
      </svg>
    </span>
  )
}

export default Icon
