import { env } from '@/shared/config'

import { notifyUnauthorized, readCustomerToken } from './authBridge'

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, unknown> | undefined

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type TApiAuth = false | 'customer'

const DEFAULT_TIMEOUT_MS = 30_000

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  idempotencyKey?: string
  auth?: TApiAuth
  /** Override default 30s request timeout. */
  timeoutMs?: number
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false
  }

  const error = (value as ApiErrorBody).error
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  )
}

function readDetails(
  error: ApiErrorBody['error'],
): Record<string, unknown> | undefined {
  if (
    error.details &&
    typeof error.details === 'object' &&
    !Array.isArray(error.details)
  ) {
    return error.details
  }
  return undefined
}

function mergeSignals(
  userSignal: AbortSignal | null | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void } {
  const timeoutSignal =
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? AbortSignal.timeout(timeoutMs)
      : (() => {
          const controller = new AbortController()
          const id = window.setTimeout(() => controller.abort(), timeoutMs)
          const signal = controller.signal
          ;(signal as AbortSignal & { __timeoutId?: number }).__timeoutId = id
          return signal
        })()

  if (!userSignal) {
    return {
      signal: timeoutSignal,
      cleanup: () => {
        const id = (timeoutSignal as AbortSignal & { __timeoutId?: number })
          .__timeoutId
        if (id != null) window.clearTimeout(id)
      },
    }
  }

  if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal) {
    return {
      signal: AbortSignal.any([userSignal, timeoutSignal]),
      cleanup: () => {
        const id = (timeoutSignal as AbortSignal & { __timeoutId?: number })
          .__timeoutId
        if (id != null) window.clearTimeout(id)
      },
    }
  }

  const controller = new AbortController()
  const onAbort = () => controller.abort()
  userSignal.addEventListener('abort', onAbort)
  timeoutSignal.addEventListener('abort', onAbort)
  if (userSignal.aborted || timeoutSignal.aborted) controller.abort()

  return {
    signal: controller.signal,
    cleanup: () => {
      userSignal.removeEventListener('abort', onAbort)
      timeoutSignal.removeEventListener('abort', onAbort)
      const id = (timeoutSignal as AbortSignal & { __timeoutId?: number })
        .__timeoutId
      if (id != null) window.clearTimeout(id)
    },
  }
}

function abortErrorCode(signal: AbortSignal | undefined): string {
  if (signal?.reason && typeof signal.reason === 'object') {
    const name = (signal.reason as { name?: string }).name
    if (name === 'TimeoutError') return 'TIMEOUT'
  }
  return 'ABORTED'
}

/** Low-level JSON fetch against VITE_API_BASE_URL. */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    body,
    idempotencyKey,
    headers,
    auth = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: userSignal,
    ...rest
  } = options
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (idempotencyKey) {
    requestHeaders.set('Idempotency-Key', idempotencyKey)
  }

  if (auth === 'customer') {
    const token = readCustomerToken()
    if (!token) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Нужно войти в систему.')
    }
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const { signal, cleanup } = mergeSignals(userSignal, timeoutMs)

  let response: Response
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...rest,
      signal,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    cleanup()
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, abortErrorCode(signal), 'Request was aborted')
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new ApiError(0, 'TIMEOUT', 'Request timed out')
    }
    throw error
  }
  cleanup()

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      throw new ApiError(
        response.status,
        'INVALID_JSON',
        'Response body is not valid JSON',
      )
    }
  }

  if (!response.ok) {
    if (isApiErrorBody(data)) {
      const details = readDetails(data.error)
      if (
        auth === 'customer' &&
        response.status === 401 &&
        (data.error.code === 'UNAUTHENTICATED' ||
          data.error.code === 'SESSION_EXPIRED')
      ) {
        notifyUnauthorized(data.error.code)
      }
      throw new ApiError(
        response.status,
        data.error.code,
        data.error.message,
        details,
      )
    }

    throw new ApiError(
      response.status,
      'UNKNOWN_ERROR',
      `Request failed with status ${response.status}`,
    )
  }

  return data as T
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
