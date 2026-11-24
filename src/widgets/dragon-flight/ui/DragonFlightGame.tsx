import { useEffect, useEffectEvent, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { HOME_PATH } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { mountHero } from '@/shared/ui/sprite'
import { Typography } from '@/shared/ui/typography'

import {
  createEmptyAssets,
  drawWorld,
  loadFlightAssets,
  type IFlightAssets,
} from '../lib/draw'
import type { IFlightWorld } from '../lib/types'
import {
  createWorld,
  flapBird,
  resizeWorld,
  stepWorld,
} from '../lib/world'
import { useFlightStore } from '../model/flightStore'

import styles from './DragonFlightGame.module.css'

/** Full-viewport Flappy-style flight: canvas world + HUD overlays. */
const DragonFlightGame = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const status = useFlightStore((state) => state.status)
  const score = useFlightStore((state) => state.score)
  const bestScore = useFlightStore((state) => state.bestScore)
  const start = useFlightStore((state) => state.start)
  const addPoint = useFlightStore((state) => state.addPoint)
  const gameOver = useFlightStore((state) => state.gameOver)
  const restart = useFlightStore((state) => state.restart)

  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const skyLayerRef = useRef<HTMLCanvasElement>(null)
  const midLayerRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<IFlightWorld | null>(null)
  const assetsRef = useRef<IFlightAssets>(createEmptyAssets())
  const statusRef = useRef(status)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)

  statusRef.current = status

  const syncCanvasSize = useEffectEvent(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) {
      return
    }

    const cssW = root.clientWidth
    const cssH = root.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(cssW * dpr))
    canvas.height = Math.max(1, Math.floor(cssH * dpr))
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (!worldRef.current) {
      worldRef.current = createWorld(cssW, cssH)
    } else {
      resizeWorld(worldRef.current, cssW, cssH)
    }
  })

  const paint = useEffectEvent(() => {
    const canvas = canvasRef.current
    const world = worldRef.current
    if (!canvas || !world) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    drawWorld(ctx, world, assetsRef.current, {
      sky: skyLayerRef.current,
      mid: midLayerRef.current,
    })
  })

  const onFlap = useEffectEvent(() => {
    const world = worldRef.current
    if (!world) {
      return
    }

    if (statusRef.current === 'ready') {
      statusRef.current = 'playing'
      start()
      flapBird(world.bird)
      return
    }

    if (statusRef.current === 'playing') {
      flapBird(world.bird)
      return
    }

    if (statusRef.current === 'gameOver') {
      worldRef.current = createWorld(world.width, world.height)
      statusRef.current = 'ready'
      restart()
    }
  })

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) {
      return
    }
    // Singleton hero blit; Home remounts the hero on return.
    mountHero(hero)
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadFlightAssets()
      .then((assets) => {
        if (!cancelled) {
          assetsRef.current = assets
          paint()
        }
      })
      .catch(() => {
        // keep empty assets; sky still draws
      })
    return () => {
      cancelled = true
    }
  }, [paint])

  useEffect(() => {
    syncCanvasSize()
    const root = rootRef.current
    if (!root) {
      return
    }

    const observer = new ResizeObserver(() => {
      syncCanvasSize()
      paint()
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [paint, syncCanvasSize])

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastTsRef.current || ts
      const dt = Math.min(0.033, (ts - last) / 1000)
      lastTsRef.current = ts

      const world = worldRef.current
      if (world && statusRef.current === 'playing') {
        const hit = stepWorld(world, dt, addPoint)
        if (hit) {
          statusRef.current = 'gameOver'
          gameOver()
        }
      } else if (world && statusRef.current === 'ready') {
        world.frameTime += dt
        world.bird.y =
          world.height * 0.45 + Math.sin(world.frameTime * 2.2) * 10
      }

      paint()
      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafRef.current)
  }, [addPoint, gameOver, paint])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.code === 'Space' ||
        event.code === 'ArrowUp' ||
        event.code === 'Enter'
      ) {
        event.preventDefault()
        onFlap()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onFlap])

  return (
    <div ref={rootRef} className={styles.root}>
      <div
        ref={heroRef}
        className={styles.heroSource}
        data-sky="day"
        aria-hidden
      >
        <canvas
          ref={skyLayerRef}
          className={styles.heroLayer}
          data-layer="sky"
        />
        <canvas
          ref={midLayerRef}
          className={styles.heroLayer}
          data-layer="mid"
        />
        <canvas className={styles.heroLayer} data-layer="fly" />
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={(event) => {
          event.preventDefault()
          onFlap()
        }}
      />
      <div className={styles.hud}>
        <div className={styles.topBar}>
          <div className={styles.back}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.history.length > 1) {
                  void navigate(-1)
                  return
                }
                void navigate(HOME_PATH)
              }}
            >
              {t('play.back')}
            </Button>
          </div>
          <div className={styles.scoreBlock}>
            <div className={styles.score}>{score}</div>
            <div className={styles.best}>
              {t('play.best', { score: bestScore })}
            </div>
          </div>
        </div>

        <div className={styles.center}>
          {status === 'ready' && (
            <div className={styles.panel}>
              <Typography variant="h2">{t('play.title')}</Typography>
              <p className={styles.hint}>{t('play.tapToStart')}</p>
            </div>
          )}
          {status === 'gameOver' && (
            <div className={styles.panel}>
              <Typography variant="h2">{t('play.gameOver')}</Typography>
              <p className={styles.hint}>
                {t('play.score')}: {score}
              </p>
              <div className={styles.actions}>
                <Button
                  type="button"
                  onClick={() => {
                    const world = worldRef.current
                    if (world) {
                      worldRef.current = createWorld(world.width, world.height)
                    }
                    restart()
                  }}
                >
                  {t('play.restart')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DragonFlightGame
