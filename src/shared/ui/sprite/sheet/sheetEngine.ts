import type { IDragonSheetSpec, ISheetFxEmitter } from './sheetCatalog'

export const SHEET_FRAME_W = 80
export const SHEET_FRAME_H = 60

interface ISheetParticle {
  x: number
  y: number
  vx: number
  vy: number
  g: number
  life: number
  max: number
  c: string
  w: number
  s?: string
}

export interface ISheetLiveState {
  spec: IDragonSheetSpec
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  img: HTMLImageElement
  scale: number
  ox: number
  oy: number
  phase: number
  fx: ISheetParticle[]
  ready: boolean
}

const rnd = (range: [number, number]) =>
  range[0] + Math.random() * (range[1] - range[0])

/** Choose frame index for sheet timeline (idle/blink/breath/special). */
export function sheetFrameAt(
  spec: IDragonSheetSpec,
  t: number,
  phase: number,
): number {
  const tt = t + phase
  const seq = spec.seq
  const tot = seq.reduce((sum, item) => sum + item[1], 0)
  let frame = Math.floor(tt / 0.8) % 2 ? 2 : 0
  let u = spec.loop ? tt % tot : (tt % spec.every) - (spec.every - tot)
  if (u >= 0) {
    for (const [key, duration] of seq) {
      if (u < duration) {
        frame = key
        break
      }
      u -= duration
    }
  }
  if (tt % 3.4 < 0.17 && (frame === 0 || frame === 2)) {
    return 1
  }
  return frame
}

function emitFx(
  state: ISheetLiveState,
  frame: number,
  emitters: ISheetFxEmitter[] | undefined,
) {
  if (!emitters?.length) return
  for (const emitter of emitters) {
    if (emitter.when !== 'always' && !emitter.when.includes(frame)) continue
    if (Math.random() > emitter.p) continue
    for (let i = 0; i < emitter.n; i += 1) {
      state.fx.push({
        x: rnd(emitter.x),
        y: rnd(emitter.y),
        vx: rnd(emitter.vx),
        vy: rnd(emitter.vy),
        g: emitter.g,
        life: 0,
        max: emitter.max,
        c: emitter.c[Math.floor(Math.random() * emitter.c.length)] ?? '#fff',
        w: emitter.w,
        s: emitter.s,
      })
    }
  }
}

/** Fit integer pixel scale and bottom-align sprite in the canvas. */
export function sizeSheetLive(state: ISheetLiveState) {
  const rect = state.canvas.getBoundingClientRect()
  const scale = Math.max(
    2,
    Math.floor(
      Math.min(
        rect.width / (SHEET_FRAME_W + 6),
        (rect.height * 0.84) / (SHEET_FRAME_H + 2),
      ),
    ),
  )
  state.scale = scale
  state.canvas.width = Math.floor(rect.width)
  state.canvas.height = Math.floor(rect.height)
  state.ox = Math.floor((state.canvas.width - SHEET_FRAME_W * scale) / 2)
  state.oy = Math.floor(
    state.canvas.height * 0.84 - (SHEET_FRAME_H - 1) * scale,
  )
  state.ctx.imageSmoothingEnabled = false
}

function drawParticles(state: ISheetLiveState) {
  const { ctx, scale: S, ox, oy } = state
  for (const particle of state.fx) {
    ctx.globalAlpha = Math.max(0, 1 - particle.life / particle.max)
    ctx.fillStyle = particle.c
    const x = ox + Math.round(particle.x) * S
    const y = oy + Math.round(particle.y) * S
    if (particle.s === 'note') {
      for (const [a, b] of [
        [2, 0],
        [3, 0],
        [2, 1],
        [4, 1],
        [2, 2],
        [2, 3],
        [0, 4],
        [1, 4],
        [2, 4],
        [0, 5],
        [1, 5],
      ]) {
        ctx.fillRect(x + a * S, y + b * S, S, S)
      }
    } else if (particle.w) {
      ctx.fillRect(x, y, particle.w * S, S)
    } else {
      ctx.fillRect(x, y, 2 * S, S)
      ctx.fillRect(x + S, y + S, S, S)
    }
  }
  ctx.globalAlpha = 1
}

/** Draw one animation tick; pass step=true to spawn FX and age particles. */
export function drawSheetLive(state: ISheetLiveState, t: number, step = false) {
  const { ctx, canvas, img, scale, ox, oy, spec } = state
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (!state.ready || !img.complete) return

  const frame = sheetFrameAt(spec, t, state.phase)
  ctx.drawImage(
    img,
    frame * SHEET_FRAME_W,
    0,
    SHEET_FRAME_W,
    SHEET_FRAME_H,
    ox,
    oy,
    SHEET_FRAME_W * scale,
    SHEET_FRAME_H * scale,
  )

  if (step) {
    emitFx(state, frame, spec.fx)
    for (const particle of state.fx) {
      particle.x += particle.vx
      particle.vy += particle.g
      particle.y += particle.vy
      particle.life += 1
    }
    state.fx = state.fx.filter((particle) => particle.life < particle.max)
  }

  drawParticles(state)
}

/** Create live sheet state bound to a canvas. */
export function createSheetLive(
  canvas: HTMLCanvasElement,
  spec: IDragonSheetSpec,
  phase = Math.random() * 10,
): ISheetLiveState {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2D canvas context unavailable')
  }
  const img = new Image()
  const state: ISheetLiveState = {
    spec,
    canvas,
    ctx,
    img,
    scale: 2,
    ox: 0,
    oy: 0,
    phase,
    fx: [],
    ready: false,
  }
  img.onload = () => {
    state.ready = true
    sizeSheetLive(state)
    drawSheetLive(state, 0)
  }
  img.src = spec.src
  return state
}
