import type { TCustomerSessionSchema } from './generated/wire'

export interface ICabinetApiSession {
  token: string
  tokenType: string
  expiresAt: string
}

/** Maps OpenAPI CustomerSessionSchema → domain session (null if incomplete). */
export function mapCustomerSession(
  wire: TCustomerSessionSchema | null,
): ICabinetApiSession | null {
  if (!wire?.expires_at) return null
  return {
    token: wire.token,
    tokenType: wire.token_type,
    expiresAt: wire.expires_at,
  }
}
