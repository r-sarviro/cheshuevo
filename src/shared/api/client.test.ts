import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  registerCustomerTokenGetter,
  registerUnauthorizedHandler,
} from './authBridge'
import { ApiError, apiRequest } from './client'

describe('apiRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    registerCustomerTokenGetter(() => null)
    registerUnauthorizedHandler(() => undefined)
  })

  it('returns JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ locale: 'ru' }),
      }),
    )

    await expect(apiRequest<{ locale: string }>('/locale')).resolves.toEqual({
      locale: 'ru',
    })
  })

  it('parses error details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () =>
          JSON.stringify({
            error: {
              code: 'OTP_INVALID',
              message: 'bad',
              details: { attempts_left: 3 },
            },
          }),
      }),
    )

    await expect(apiRequest('/x')).rejects.toMatchObject({
      code: 'OTP_INVALID',
      details: { attempts_left: 3 },
    } satisfies Partial<ApiError>)
  })

  it('handles 204 without JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => '',
      }),
    )

    await expect(apiRequest<null>('/customer/logout')).resolves.toBeNull()
  })

  it('rejects invalid JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html>nope</html>',
      }),
    )

    await expect(apiRequest('/x')).rejects.toMatchObject({
      code: 'INVALID_JSON',
    })
  })

  it('sends Bearer for customer auth', async () => {
    registerCustomerTokenGetter(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({ customer: { name: 'A', email: 'a@b.c' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/customer/me', { auth: 'customer' })

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer tok-1')
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('fails fast when customer auth has no token', async () => {
    registerCustomerTokenGetter(() => null)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiRequest('/customer/me', { auth: 'customer' }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('notifies unauthorized on customer 401', async () => {
    const onUnauthorized = vi.fn()
    registerUnauthorizedHandler(onUnauthorized)
    registerCustomerTokenGetter(() => 'tok-1')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({
            error: { code: 'SESSION_EXPIRED', message: 'expired' },
          }),
      }),
    )

    await expect(
      apiRequest('/customer/me', { auth: 'customer' }),
    ).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledWith('SESSION_EXPIRED')
  })

  it('aborts with TIMEOUT when request exceeds timeoutMs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              const reason = init.signal?.reason
              if (reason instanceof Error) {
                reject(reason)
                return
              }
              reject(new DOMException('The operation was aborted.', 'AbortError'))
            })
          }),
      ),
    )

    await expect(apiRequest('/x', { timeoutMs: 20 })).rejects.toMatchObject({
      code: expect.stringMatching(/^(TIMEOUT|ABORTED)$/),
    })
  })
})
