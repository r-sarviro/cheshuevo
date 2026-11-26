import { apiRequest } from '../client'
import type {
  TConfirmEmailCodeRequest,
  TRequestEmailCodeRequest,
} from '../generated/wire'
import {
  mapCustomerSession,
  type ICabinetApiSession,
} from '../mapCustomerSession'
import {
  emailVerificationConfirmedSchema,
  emailVerificationCreatedSchema,
  parseWire,
} from '../wire'

export type TEmailVerificationPurpose = 'booking' | 'login'

export interface IRequestEmailCodePayload {
  email: string
  purpose?: TEmailVerificationPurpose
}

export interface IRequestEmailCodeResult {
  verificationId: string
  expiresAt: string
  resendAfterSeconds: number
}

export interface IConfirmEmailCodePayload {
  verificationId: string
  email: string
  code: string
}

export interface IConfirmEmailCodeResult {
  verificationToken: string
  expiresAt: string
  session: ICabinetApiSession | null
}

/** POST /api/v1/public/email-verifications */
export async function requestEmailCode(
  payload: IRequestEmailCodePayload,
): Promise<IRequestEmailCodeResult> {
  const body: TRequestEmailCodeRequest = {
    email: payload.email,
    ...(payload.purpose ? { purpose: payload.purpose } : {}),
  }
  const raw = await apiRequest<unknown>('/public/email-verifications', {
    method: 'POST',
    body,
  })
  const wire = parseWire(emailVerificationCreatedSchema, raw)
  return {
    verificationId: wire.verification_id,
    expiresAt: wire.expires_at,
    resendAfterSeconds: wire.resend_after_seconds,
  }
}

/** POST /api/v1/public/email-verifications/confirm */
export async function confirmEmailCode(
  payload: IConfirmEmailCodePayload,
): Promise<IConfirmEmailCodeResult> {
  const body: TConfirmEmailCodeRequest = {
    verification_id: payload.verificationId,
    email: payload.email,
    code: payload.code,
  }
  const raw = await apiRequest<unknown>('/public/email-verifications/confirm', {
    method: 'POST',
    body,
  })
  const wire = parseWire(emailVerificationConfirmedSchema, raw)
  return {
    verificationToken: wire.verification_token,
    expiresAt: wire.expires_at,
    session: mapCustomerSession(wire.session),
  }
}
