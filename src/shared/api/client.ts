import { env } from '@/shared/config'

export type ApiErrorBody = {
  error: {
    code: string
    message: string
  }
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  idempotencyKey?: string
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

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, idempotencyKey, headers, ...rest } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (idempotencyKey) {
    requestHeaders.set('Idempotency-Key', idempotencyKey)
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const data: unknown = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (isApiErrorBody(data)) {
      throw new ApiError(response.status, data.error.code, data.error.message)
    }

    throw new ApiError(
      response.status,
      'UNKNOWN_ERROR',
      `Request failed with status ${response.status}`,
    )
  }

  return data as T
}
