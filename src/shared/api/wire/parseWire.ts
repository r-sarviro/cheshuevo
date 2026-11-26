import type { ZodType } from 'zod'

import { ApiError } from '../client'

/** Runtime-validate an API JSON body against a Zod schema. */
export function parseWire<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ApiError(
      0,
      'INVALID_RESPONSE',
      'Response does not match API contract',
    )
  }
  return result.data
}
