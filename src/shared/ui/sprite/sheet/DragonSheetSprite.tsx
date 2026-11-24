import { useEffect, useRef } from 'react'

import styles from './DragonSheetSprite.module.css'
import { getDragonSheetSpec } from './sheetCatalog'
import {
  createSheetLive,
  drawSheetLive,
  sizeSheetLive,
  type ISheetLiveState,
} from './sheetEngine'

export interface IDragonSheetSpriteProps {
  name: string
  className?: string
  label?: string
}

/** Canvas dragon from PNG sheet catalog (idle / blink / breath / special). */
const DragonSheetSprite = (props: IDragonSheetSpriteProps) => {
  const { name, className, label } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const spec = getDragonSheetSpec(name)
    if (!canvas || !spec) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state: ISheetLiveState = createSheetLive(canvas, spec)
    sizeSheetLive(state)
    drawSheetLive(state, 0)

    const resizeObserver = new ResizeObserver(() => {
      sizeSheetLive(state)
      drawSheetLive(state, performance.now() / 1000)
    })
    resizeObserver.observe(canvas)

    let frameId = 0
    let last = 0
    if (!reduce) {
      const loop = (ts: number) => {
        frameId = window.requestAnimationFrame(loop)
        if (ts - last < 100) return
        last = ts
        drawSheetLive(state, ts / 1000, true)
      }
      frameId = window.requestAnimationFrame(loop)
    }

    return () => {
      resizeObserver.disconnect()
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [name])

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <canvas
      ref={canvasRef}
      className={rootClass}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}

export default DragonSheetSprite
