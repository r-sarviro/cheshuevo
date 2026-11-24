import { create } from 'zustand'

const BEST_SCORE_KEY = 'drakonsk-flight-best'

export type TFlightStatus = 'ready' | 'playing' | 'gameOver'

export type TFlightState = {
  status: TFlightStatus
  score: number
  bestScore: number
  start: () => void
  addPoint: () => void
  gameOver: () => void
  restart: () => void
}

function readBestScore(): number {
  if (typeof localStorage === 'undefined') {
    return 0
  }

  try {
    const raw = localStorage.getItem(BEST_SCORE_KEY)
    const value = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function persistBestScore(score: number): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // ignore quota / private mode
  }
}

/** HUD + persistence for a single flight run. */
export const useFlightStore = create<TFlightState>((set, get) => ({
  status: 'ready',
  score: 0,
  bestScore: readBestScore(),
  start: () => set({ status: 'playing', score: 0 }),
  addPoint: () => set((state) => ({ score: state.score + 1 })),
  gameOver: () => {
    const { score, bestScore } = get()
    const nextBest = Math.max(score, bestScore)
    if (nextBest > bestScore) {
      persistBestScore(nextBest)
    }
    set({ status: 'gameOver', bestScore: nextBest })
  },
  restart: () => set({ status: 'ready', score: 0 }),
}))
