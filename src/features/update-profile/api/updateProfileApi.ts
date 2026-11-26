import { ApiError } from '@/shared/api'

export interface IUpdateProfilePayload {
  name: string
  phone: string
}

export interface IUpdateProfileResult {
  name: string
  phone: string
}

/** Placeholder until customer profile endpoint is wired. */
export async function updateProfile(
  payload: IUpdateProfilePayload,
): Promise<IUpdateProfileResult> {
  void payload
  throw new ApiError(
    501,
    'NOT_IMPLEMENTED',
    'Update profile API is not wired yet',
  )
}
