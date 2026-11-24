import { FLIGHT_TUNING } from './tuning'
import type { IBirdState, IFlightWorld, IRockColumn } from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function rockMetrics(height: number, width: number) {
  const gapH = clamp(height * FLIGHT_TUNING.gapRatio, 120, height * 0.4)
  const rockWidth = clamp(width * FLIGHT_TUNING.rockWidthRatio, 56, 120)
  const margin = height * 0.08
  const gapY = margin + Math.random() * Math.max(1, height - gapH - margin * 2)
  return { gapH, rockWidth, gapY }
}

export function createBird(width: number, height: number): IBirdState {
  const radius = clamp(height * FLIGHT_TUNING.birdRadiusRatio, 18, 36)
  return {
    x: width * FLIGHT_TUNING.birdXRatio,
    y: height * 0.45,
    vy: 0,
    radius,
  }
}

export function createWorld(width: number, height: number): IFlightWorld {
  const world: IFlightWorld = {
    width,
    height,
    bird: createBird(width, height),
    rocks: [],
    scrollSpeed: Math.max(160, width * 0.18),
    spawnAccumulator: 0,
    frameTime: 0,
  }
  // Preview column on the right so ready/play both show rock obstacles.
  const first = spawnRock(world)
  first.x = width * 0.72
  world.rocks.push(first)
  return world
}

export function resizeWorld(world: IFlightWorld, width: number, height: number) {
  const scaleX = width / Math.max(1, world.width)
  const scaleY = height / Math.max(1, world.height)

  world.width = width
  world.height = height
  world.scrollSpeed = Math.max(160, width * 0.18)
  world.bird.x = width * FLIGHT_TUNING.birdXRatio
  world.bird.y = clamp(world.bird.y * scaleY, world.bird.radius, height - world.bird.radius)
  world.bird.radius = clamp(height * FLIGHT_TUNING.birdRadiusRatio, 18, 36)
  world.bird.vy *= scaleY

  world.rocks = world.rocks.map((rock) => {
    const metrics = rockMetrics(height, width)
    return {
      x: rock.x * scaleX,
      width: metrics.rockWidth,
      gapY: clamp(rock.gapY * scaleY, height * 0.08, height - metrics.gapH - height * 0.08),
      gapH: metrics.gapH,
      scored: rock.scored,
    }
  })
}

export function spawnRock(world: IFlightWorld): IRockColumn {
  const { gapH, rockWidth, gapY } = rockMetrics(world.height, world.width)
  return {
    x: world.width + rockWidth,
    width: rockWidth,
    gapY,
    gapH,
    scored: false,
  }
}

export function flapBird(bird: IBirdState) {
  bird.vy = FLIGHT_TUNING.flap
}

export function stepWorld(
  world: IFlightWorld,
  dt: number,
  onScore: () => void,
): boolean {
  const bird = world.bird
  bird.vy = Math.min(FLIGHT_TUNING.maxFall, bird.vy + FLIGHT_TUNING.gravity * dt)
  bird.y += bird.vy * dt
  world.frameTime += dt

  world.spawnAccumulator += dt
  if (world.spawnAccumulator >= FLIGHT_TUNING.spawnEvery) {
    world.spawnAccumulator = 0
    world.rocks.push(spawnRock(world))
  }

  const speed = world.scrollSpeed
  for (const rock of world.rocks) {
    rock.x -= speed * dt
    if (!rock.scored && rock.x + rock.width < bird.x - bird.radius) {
      rock.scored = true
      onScore()
    }
  }

  world.rocks = world.rocks.filter((rock) => rock.x + rock.width > -40)

  if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= world.height) {
    return true
  }

  for (const rock of world.rocks) {
    if (hitsRock(bird, rock)) {
      return true
    }
  }

  return false
}

function hitsRock(bird: IBirdState, rock: IRockColumn): boolean {
  const left = rock.x
  const right = rock.x + rock.width
  const cx = bird.x
  const cy = bird.y
  const r = bird.radius * 0.78

  if (cx + r < left || cx - r > right) {
    return false
  }

  const topBottom = rock.gapY
  const gapBottom = rock.gapY + rock.gapH

  if (cy - r < topBottom) {
    return true
  }
  if (cy + r > gapBottom) {
    return true
  }
  return false
}
