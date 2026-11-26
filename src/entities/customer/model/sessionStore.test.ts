import { beforeEach, describe, expect, it } from 'vitest'

import { STORAGE_KEY, useCabinetSessionStore } from './sessionStore'

describe('useCabinetSessionStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useCabinetSessionStore.getState().signOut()
  })

  it('persists token session and reports authenticated', () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString()
    useCabinetSessionStore.getState().signIn({
      token: 'abc',
      tokenType: 'Bearer',
      expiresAt,
      email: 'anna@example.com',
      name: 'Анна',
    })

    expect(useCabinetSessionStore.getState().isAuthenticated()).toBe(true)
    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).toContain('"token":"abc"')
  })

  it('rejects expired tokens', () => {
    const expiresAt = new Date(Date.now() - 60_000).toISOString()
    useCabinetSessionStore.getState().signIn({
      token: 'abc',
      tokenType: 'Bearer',
      expiresAt,
      email: 'anna@example.com',
    })

    expect(useCabinetSessionStore.getState().isAuthenticated()).toBe(false)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
