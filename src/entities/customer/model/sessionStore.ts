import { create } from 'zustand'

import type { ICabinetSession, ICabinetSessionToken } from './types'

export const STORAGE_KEY = 'drakonsk.cabinet.session.v2'

export type TCabinetSessionState = {
  token: string | null
  tokenType: string | null
  expiresAt: string | null
  email: string | null
  name: string | null
  signIn: (
    session: ICabinetSessionToken & {
      email?: string | null
      name?: string | null
    },
  ) => void
  setProfile: (payload: { email?: string | null; name?: string | null }) => void
  signOut: () => void
  isAuthenticated: () => boolean
  hydrate: () => void
}

function isExpired(expiresAt: string): boolean {
  const ms = Date.parse(expiresAt)
  if (Number.isNaN(ms)) return true
  return ms <= Date.now()
}

function readStored(): ICabinetSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ICabinetSession
    if (!parsed?.token || !parsed?.expiresAt) return null
    if (isExpired(parsed.expiresAt)) {
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
    token: initial?.token ?? null,
    tokenType: initial?.tokenType ?? null,
    expiresAt: initial?.expiresAt ?? null,
    email: initial?.email ?? null,
    name: initial?.name ?? null,
    signIn: ({ token, tokenType, expiresAt, email = null, name = null }) => {
      const next: ICabinetSession = {
        token,
        tokenType,
        expiresAt,
        email: email ? email.trim().toLowerCase() : null,
        name,
      }
      writeStored(next)
      set({
        token: next.token,
        tokenType: next.tokenType,
        expiresAt: next.expiresAt,
        email: next.email,
        name: next.name,
      })
    },
    setProfile: ({ email, name }) => {
      const state = get()
      if (!state.token || !state.expiresAt) return
      const next: ICabinetSession = {
        token: state.token,
        tokenType: state.tokenType ?? 'Bearer',
        expiresAt: state.expiresAt,
        email:
          email !== undefined
            ? email
              ? email.trim().toLowerCase()
              : null
            : state.email,
        name: name !== undefined ? name : state.name,
      }
      writeStored(next)
      set({ email: next.email, name: next.name })
    },
    signOut: () => {
      writeStored(null)
      set({
        token: null,
        tokenType: null,
        expiresAt: null,
        email: null,
        name: null,
      })
    },
    isAuthenticated: () => {
      const { token, expiresAt } = get()
      if (!token || !expiresAt) return false
      if (isExpired(expiresAt)) {
        get().signOut()
        return false
      }
      return true
    },
    hydrate: () => {
      const stored = readStored()
      if (!stored) {
        set({
          token: null,
          tokenType: null,
          expiresAt: null,
          email: null,
          name: null,
        })
        return
      }
      set({
        token: stored.token,
        tokenType: stored.tokenType,
        expiresAt: stored.expiresAt,
        email: stored.email,
        name: stored.name,
      })
    },
  }),
)
