export interface IBirdState {
  x: number
  y: number
  vy: number
  radius: number
}

export interface IRockColumn {
  x: number
  width: number
  gapY: number
  gapH: number
  scored: boolean
}

export interface IFlightWorld {
  width: number
  height: number
  bird: IBirdState
  rocks: IRockColumn[]
  scrollSpeed: number
  spawnAccumulator: number
  frameTime: number
}

export interface IFlightTuning {
  gravity: number
  flap: number
  maxFall: number
  scroll: number
  spawnEvery: number
  gapRatio: number
  rockWidthRatio: number
  birdXRatio: number
  birdRadiusRatio: number
}
