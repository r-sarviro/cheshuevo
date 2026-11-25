import { stubDelay } from '@/shared/api'

/** Stub: POST /api/v1/customer/logout */
export async function logoutStub(): Promise<void> {
  await stubDelay(200)
}
