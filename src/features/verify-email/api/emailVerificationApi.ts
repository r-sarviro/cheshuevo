import { apiRequest } from '@/shared/api'

export interface IRequestEmailCodePayload {
  email: string
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
}

/** POST /api/v1/public/email-verifications */
export function requestEmailCode(payload: IRequestEmailCodePayload) {
  return apiRequest<IRequestEmailCodeResult>('/public/email-verifications', {
    method: 'POST',
    body: { email: payload.email },
  })
}

/** POST /api/v1/public/email-verifications/confirm */
export function confirmEmailCode(payload: IConfirmEmailCodePayload) {
  return apiRequest<IConfirmEmailCodeResult>(
    '/public/email-verifications/confirm',
    {
      method: 'POST',
      body: {
        verification_id: payload.verificationId,
        email: payload.email,
        code: payload.code,
      },
    },
  )
}
