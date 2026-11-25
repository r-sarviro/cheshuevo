import type {
  IDragonSheetSpec,
  ISheetFxEmitter,
  ISheetRigPart,
} from './sheetCatalog'

export const SHEET_FPS = 12
export const SHEET_PIC_HEIGHT = 240
export const SHEET_GROUND_PAD = 27

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
  pose: HTMLCanvasElement | null
  scale: number
  ox: number
  oy: number
  phase: number
  fx: ISheetParticle[]
  ready: boolean
  reduce: boolean
}

const BREATH = [0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 2, 1, 0] as const
const NOTE = [
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
] as const

const rnd = (range: [number, number]) =>
  range[0] + Math.random() * (range[1] - range[0])

/** Special-move frame index, or -1 while idle/breathing. */
export function sheetSpecial(spec: IDragonSheetSpec, t: number): number {
  const seq = spec.seq
  const tot = seq.reduce((sum, item) => sum + item[1], 0)
  if (!tot) return -1
  let u = spec.loop ? t % tot : (t % spec.every) - (spec.every - tot)
  if (u < 0) return -1
  for (const [key, duration] of seq) {
    if (u < duration) return key
    u -= duration
  }
  return -1
}

function sheetBreath(t: number): number {
  return BREATH[Math.floor(((t % 1.6) / 1.6) * BREATH.length)] ?? 0
}

function rigApply(
  poseCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  sx: number,
  rig: ISheetRigPart[],
  t: number,
) {
  for (const part of rig) {
    const [x0, y0, x1, y1] = part.box
    const w = x1 - x0
    const h = y1 - y0
    const period = part.period || 2.4
    const amp = part.amp || 1
    const phase = part.phase || 0
    const wave = part.wave ?? 1.2

    if (part.type === 'rows') {
      for (let y = y0; y < y1; y += 1) {
        const r =
          (part.root === 'top' ? y - y0 : y1 - 1 - y) / Math.max(1, h - 1)
        const dd = Math.round(
          amp * r * Math.sin((t * 6.283) / period - wave * r * 3 + phase),
        )
        if (!dd) continue
        poseCtx.clearRect(x0, y, w, 1)
        poseCtx.drawImage(img, sx + x0, y, w, 1, x0 + dd, y, w, 1)
      }
    } else {
      for (let x = x0; x < x1; x += 1) {
        const r =
          (part.root === 'left' ? x - x0 : x1 - 1 - x) / Math.max(1, w - 1)
        const dd = Math.round(
          amp * r * Math.sin((t * 6.283) / period - wave * r * 3 + phase),
        )
        if (!dd) continue
        poseCtx.clearRect(x, y0, 1, h)
        poseCtx.drawImage(img, sx + x, y0, 1, h, x, y0 + dd, 1, h)
      }
    }
  }
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

function drawParticles(state: ISheetLiveState) {
  const { ctx, ox, oy } = state
  for (const particle of state.fx) {
    ctx.globalAlpha = Math.max(0, 1 - particle.life / particle.max)
    const x = ox + Math.round(particle.x)
    const y = oy + Math.round(particle.y)
    if (particle.s === 'note') {
      for (const [a, b] of NOTE) {
        ctx.fillStyle = particle.c
        ctx.fillRect(x + a, y + b, 1, 1)
      }
    } else if (particle.w) {
      ctx.fillStyle = particle.c
      ctx.fillRect(x, y, particle.w, 1)
    } else {
      ctx.fillStyle = particle.c
      ctx.fillRect(x, y, 2, 1)
      ctx.fillRect(x + 1, y + 1, 1, 1)
    }
  }
  ctx.globalAlpha = 1
}

/** Fit canvas into 240px tile: integer scale, dragon on ground strip. */
export function sizeSheetLive(state: ISheetLiveState) {
  const parent = state.canvas.parentElement
  const width =
    parent?.clientWidth ?? state.canvas.getBoundingClientRect().width
  if (!width) return

  const fw = state.spec.fw
  const fh = state.spec.fh
  const scale = Math.max(
    1,
    Math.min(Math.floor(width / fw), Math.floor(SHEET_PIC_HEIGHT / fh)),
  )
  const logicalW = Math.ceil(width / scale)
  const logicalH = Math.round(SHEET_PIC_HEIGHT / scale)

  state.scale = scale
  state.ox = Math.floor((logicalW - fw) / 2)
  state.oy = Math.max(0, logicalH - fh - Math.round(SHEET_GROUND_PAD / scale))

  if (state.canvas.width === logicalW && state.canvas.height === logicalH) {
    return
  }

  state.canvas.width = logicalW
  state.canvas.height = logicalH
  state.canvas.style.width = `${logicalW * scale}px`
  state.canvas.style.height = `${SHEET_PIC_HEIGHT}px`
  state.ctx.imageSmoothingEnabled = false
  state.fx = []
}

/** Draw one animation tick; pass step=true to spawn FX and age particles. */
export function drawSheetLive(
  state: ISheetLiveState,
  t0: number,
  step = false,
) {
  const { ctx, canvas, img, spec, reduce } = state
  const fw = spec.fw
  const fh = spec.fh
  const base = Math.round((fh * 58) / 60)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (!state.ready || !img.complete || !img.naturalWidth) return

  const t = t0 + state.phase
  const special = reduce ? -1 : sheetSpecial(spec, t)
  const blink = !reduce && t % 3.4 < 0.17 && special <= 0
  let frame = special >= 0 ? special : 0
  let lift = 0
  let oy = state.oy

  if (spec.hover && !reduce) {
    const up = Math.round(Math.sin(t * 2.6) + 1)
    oy -= up
    const cx = state.ox + fw / 2
    const cy = state.oy + base + 1
    const rx = Math.round(fw * (0.24 - up * 0.03))
    ctx.fillStyle = 'rgba(67,54,92,.16)'
    ctx.fillRect(cx - rx, cy, rx * 2, 1)
    ctx.fillRect(cx - rx + 3, cy - 1, rx * 2 - 6, 1)
    ctx.fillRect(cx - rx + 3, cy + 1, rx * 2 - 6, 1)
  }

  const idle = special < 0
  if (idle) frame = blink ? 1 : 0
  if (idle && !reduce) {
    const breathStep = sheetBreath(t)
    if (breathStep) {
      if (spec.breath) {
        lift = Math.round(
          spec.breath[0] + ((spec.breath[1] - spec.breath[0]) * breathStep) / 3,
        )
      } else if (breathStep === 3 && !blink) {
        frame = 2
      }
    }
  }

  let source: CanvasImageSource = img
  let sx = frame * fw
  if (state.pose && idle && !reduce && spec.rig?.length) {
    const poseCtx = state.pose.getContext('2d')
    if (poseCtx) {
      poseCtx.clearRect(0, 0, fw, fh)
      poseCtx.drawImage(img, sx, 0, fw, fh, 0, 0, fw, fh)
      rigApply(poseCtx, img, sx, spec.rig, t)
      source = state.pose
      sx = 0
    }
  }

  if (lift) {
    ctx.drawImage(source, sx, 1, fw, lift, state.ox, oy, fw, lift)
    ctx.drawImage(
      source,
      sx,
      lift,
      fw,
      fh - lift,
      state.ox,
      oy + lift,
      fw,
      fh - lift,
    )
  } else {
    ctx.drawImage(source, sx, 0, fw, fh, state.ox, oy, fw, fh)
  }

  if (reduce) return

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

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pose =
    spec.rig && spec.rig.length ? document.createElement('canvas') : null
  if (pose) {
    pose.width = spec.fw
    pose.height = spec.fh
  }

  const img = new Image()
  const state: ISheetLiveState = {
    spec,
    canvas,
    ctx,
    img,
    pose,
    scale: 2,
    ox: 0,
    oy: 0,
    phase,
    fx: [],
    ready: false,
    reduce,
  }

  img.onload = () => {
    state.ready = true
    sizeSheetLive(state)
    drawSheetLive(state, 0)
  }
  img.src = spec.src
  return state
}
