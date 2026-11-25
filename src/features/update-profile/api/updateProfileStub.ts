import { ApiError, stubDelay } from '@/shared/api'

export interface IUpdateProfilePayload {
  name: string
  phone: string
}

export interface IUpdateProfileResult {
  name: string
  phone: string
}

let failNext = false

/** Test helper: next updateProfileStub call fails once. */
export function setUpdateProfileStubFailNext(value: boolean) {
  failNext = value
}

/** Stub: PATCH /api/v1/customer/me */
export async function updateProfileStub(
  payload: IUpdateProfilePayload,
): Promise<IUpdateProfileResult> {
  await stubDelay(350)
  if (failNext) {
    failNext = false
    throw new ApiError(500, 'PROFILE_SAVE_FAILED', 'Failed to save profile')
  }
  const name = payload.name.trim()
  if (!name) {
    throw new ApiError(400, 'NAME_REQUIRED', 'Name required')
  }
  if (name.length > 50) {
    throw new ApiError(400, 'NAME_TOO_LONG', 'Name too long')
  }
  return {
    name,
    phone: payload.phone,
  }
}
