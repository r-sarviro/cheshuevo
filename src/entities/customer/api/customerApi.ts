import {
  apiRequest,
  customerMeSchema,
  parseWire,
} from '@/shared/api'

import type { ICustomerProfile } from '../model/types'

/** GET /api/v1/customer/me */
export async function getCustomerMe(
  signal?: AbortSignal,
): Promise<ICustomerProfile> {
  const raw = await apiRequest<unknown>('/customer/me', {
    auth: 'customer',
    signal,
  })
  const wire = parseWire(customerMeSchema, raw)
  return {
    email: wire.customer.email,
    name: wire.customer.name,
  }
}

/** POST /api/v1/customer/logout → 204 */
export async function logoutCustomer(
  signal?: AbortSignal,
): Promise<void> {
  await apiRequest<null>('/customer/logout', {
    method: 'POST',
    auth: 'customer',
    signal,
  })
}
