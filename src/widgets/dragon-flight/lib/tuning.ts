import type { IFlightTuning } from './types'

/** Base tuning; values are applied relative to viewport size. */
export const FLIGHT_TUNING: IFlightTuning = {
  gravity: 2200,
  flap: -620,
  maxFall: 1100,
  scroll: 220,
  spawnEvery: 1.55,
  gapRatio: 0.22,
  rockWidthRatio: 0.12,
  birdXRatio: 0.22,
  birdRadiusRatio: 0.035,
}
