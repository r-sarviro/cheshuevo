import { create } from 'zustand'

import type { ICabinetSession } from './types'

const STORAGE_KEY = 'drakonsk.cabinet.session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export type TCabinetSessionState = {
  email: string | null
  name: string | null
  phone: string
  authedAt: number | null
  signIn: (payload: {
    email: string
    name?: string | null
    phone?: string
  }) => void
  setProfile: (payload: { name?: string | null; phone?: string }) => void
  signOut: () => void
  isAuthenticated: () => boolean
  hydrate: () => void
}

function readStored(): ICabinetSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ICabinetSession
    if (!parsed?.email || !parsed?.authedAt) return null
    if (Date.now() - parsed.authedAt > SESSION_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStored(session: ICabinetSession | null) {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

const initial = readStored()

export const useCabinetSessionStore = create<TCabinetSessionState>(
  (set, get) => ({
    email: initial?.email ?? null,
    name: initial?.name ?? null,
    phone: initial?.phone ?? '',
    authedAt: initial?.authedAt ?? null,
    signIn: ({ email, name = null, phone = '' }) => {
      const next: ICabinetSession = {
        email: email.trim().toLowerCase(),
        name,
        phone,
        authedAt: Date.now(),
      }
      writeStored(next)
      set({
        email: next.email,
        name: next.name,
        phone: next.phone,
        authedAt: next.authedAt,
      })
    },
    setProfile: ({ name, phone }) => {
      const state = get()
      if (!state.email || !state.authedAt) return
      const next: ICabinetSession = {
        email: state.email,
        name: name !== undefined ? name : state.name,
        phone: phone !== undefined ? phone : state.phone,
        authedAt: state.authedAt,
      }
      writeStored(next)
      set({ name: next.name, phone: next.phone })
    },
    signOut: () => {
      writeStored(null)
      set({ email: null, name: null, phone: '', authedAt: null })
    },
    isAuthenticated: () => {
      const { email, authedAt } = get()
      if (!email || !authedAt) return false
      if (Date.now() - authedAt > SESSION_TTL_MS) {
        get().signOut()
        return false
      }
      return true
    },
    hydrate: () => {
      const stored = readStored()
      if (!stored) {
        set({ email: null, name: null, phone: '', authedAt: null })
        return
      }
      set({
        email: stored.email,
        name: stored.name,
        phone: stored.phone,
        authedAt: stored.authedAt,
      })
    },
  }),
)

export { SESSION_TTL_MS, STORAGE_KEY }
