import { useEffect, useRef } from 'react'

import { useUiStore } from '@/shared/model'

import styles from './DragonSprite.module.css'
import { mount, refresh } from './engine/pixelSprites.js'

const DEFAULT_SIZE: Record<string, { width: number; height: number }> = {
  mascot: { width: 136, height: 80 },
  pearl: { width: 48, height: 48 },
  loader: { width: 48, height: 48 },
  flame: { width: 56, height: 52 },
  clouds: { width: 180, height: 72 },
  'clouds-day': { width: 180, height: 72 },
  'clouds-sunset': { width: 180, height: 72 },
  'clouds-night': { width: 180, height: 72 },
}

export interface IDragonSpriteProps {
  name: string
  fit?: boolean
  /** Mascot display scale: default 2x; lg = 3x from 640px. */
  mascotSize?: 'md' | 'lg'
  width?: number
  height?: number
  className?: string
  label?: string
}

/** Canvas sprite from the vitrina PixelSprites generator. */
const DragonSprite = (props: IDragonSpriteProps) => {
  const {
    name,
    fit = false,
    mascotSize = 'md',
    width,
    height,
    className,
    label,
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useUiStore((state) => state.theme)

  const defaults = DEFAULT_SIZE[name] ?? { width: 80, height: 60 }
  const canvasWidth = width ?? defaults.width
  const canvasHeight = height ?? defaults.height

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    mount(canvas, name, { fit })
  }, [name, fit])

  useEffect(() => {
    refresh()
  }, [theme])

  const rootClass = [
    styles.root,
    name === 'mascot' ? styles.mascot : '',
    name === 'mascot' && mascotSize === 'lg' ? styles.mascotLg : '',
    name === 'loader' ? styles.loader : '',
    fit ? styles.fit : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <canvas
      ref={canvasRef}
      className={rootClass}
      width={canvasWidth}
      height={canvasHeight}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}

export default DragonSprite
