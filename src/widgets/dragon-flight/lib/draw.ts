import type { IFlightWorld } from './types'

const ROCK_SRC = 48
const ROCK_SRC_X = 8
const ROCK_SRC_Y = 8

export interface IFlightAssets {
  dragonFrames: HTMLImageElement[]
  rocks: HTMLImageElement
  ready: boolean
}

export interface IFlightSkyLayers {
  sky: HTMLCanvasElement | null
  mid: HTMLCanvasElement | null
}

export function createEmptyAssets(): IFlightAssets {
  return { dragonFrames: [], rocks: new Image(), ready: false }
}

export async function loadFlightAssets(): Promise<IFlightAssets> {
  const frameUrls = [
    '/game/dragon-1.png',
    '/game/dragon-2.png',
    '/game/dragon-3.png',
    '/game/dragon-4.png',
  ]

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load ${src}`))
      img.src = src
    })

  const [rocks, ...dragonFrames] = await Promise.all([
    loadImage('/game/rocks.png'),
    ...frameUrls.map(loadImage),
  ])

  return { dragonFrames, rocks, ready: true }
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: IFlightWorld,
  assets: IFlightAssets,
  skyLayers: IFlightSkyLayers,
) {
  const { width, height } = world
  drawSky(ctx, width, height, skyLayers)

  for (const rock of world.rocks) {
    drawRockColumn(ctx, assets.rocks, rock.x, 0, rock.width, rock.gapY)
    drawRockColumn(
      ctx,
      assets.rocks,
      rock.x,
      rock.gapY + rock.gapH,
      rock.width,
      height - (rock.gapY + rock.gapH),
    )
  }

  drawBird(ctx, world, assets)
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  skyLayers: IFlightSkyLayers,
) {
  const { sky, mid } = skyLayers
  const hasSky = sky !== null && sky.width > 0 && sky.height > 0

  if (!hasSky) {
    ctx.fillStyle = '#b7e1f0'
    ctx.fillRect(0, 0, width, height)
    return
  }

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(sky, 0, 0, width, height)

  if (mid !== null && mid.width > 0 && mid.height > 0) {
    ctx.drawImage(mid, 0, 0, width, height)
  }
}

function drawRockColumn(
  ctx: CanvasRenderingContext2D,
  rocks: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (height <= 0 || width <= 0) {
    return
  }

  const radius = Math.min(12, width * 0.14)

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.clip()

  // Cobble fill from the solid core of the CC0 tilesheet.
  ctx.fillStyle = '#5f5c63'
  ctx.fillRect(x, y, width, height)

  const tile = Math.max(28, Math.floor(width * 0.85))
  for (let py = y; py < y + height; py += tile) {
    for (let px = x; px < x + width; px += tile) {
      ctx.drawImage(
        rocks,
        ROCK_SRC_X,
        ROCK_SRC_Y,
        ROCK_SRC,
        ROCK_SRC,
        px,
        py,
        tile,
        tile,
      )
    }
  }

  ctx.restore()

  ctx.strokeStyle = 'rgba(20, 16, 12, 0.7)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(x + 1.5, y + 1.5, width - 3, height - 3, radius)
  ctx.stroke()
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  world: IFlightWorld,
  assets: IFlightAssets,
) {
  const { bird, frameTime } = world
  const frames = assets.dragonFrames
  if (!frames.length) {
    return
  }

  const frameIndex = Math.floor(frameTime * 10) % frames.length
  const frame = frames[frameIndex] ?? frames[0]
  if (!frame) {
    return
  }

  const drawW = bird.radius * 3.4
  const drawH = bird.radius * 2.45
  const angle = Math.atan2(bird.vy, 420)
  const clamped = Math.max(-0.55, Math.min(0.75, angle))

  ctx.save()
  ctx.translate(bird.x, bird.y)
  ctx.rotate(clamped)
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(frame, -drawW * 0.45, -drawH * 0.55, drawW, drawH)
  ctx.restore()
}
