import {
  ApiError,
  STUB_CONFLICT_TOKEN_PREFIX,
  STUB_OTP_CODE,
  STUB_OTP_CONFLICT_CODE,
  stubDelay,
} from '@/shared/api'

import type {
  IConfirmEmailCodePayload,
  IConfirmEmailCodeResult,
  IRequestEmailCodePayload,
  IRequestEmailCodeResult,
} from './emailVerificationApi'

const MAX_ATTEMPTS = 5

type TSession = {
  email: string
  attemptsLeft: number
  exhausted: boolean
}

const sessions = new Map<string, TSession>()

let verificationSeq = 1

export { STUB_OTP_CODE, STUB_OTP_CONFLICT_CODE, STUB_CONFLICT_TOKEN_PREFIX }

/** Stub: start email verification. */
export async function requestEmailCodeStub(
  payload: IRequestEmailCodePayload,
): Promise<IRequestEmailCodeResult> {
  await stubDelay(400)
  const email = payload.email.trim().toLowerCase()
  if (!email.includes('@') || email.endsWith('@')) {
    throw new ApiError(400, 'INVALID_EMAIL', 'Invalid email')
  }

  const verificationId = `ver-${verificationSeq++}`
  sessions.set(verificationId, {
    email,
    attemptsLeft: MAX_ATTEMPTS,
    exhausted: false,
  })

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  return {
    verificationId,
    expiresAt,
    resendAfterSeconds: 42,
  }
}

/** Stub: confirm OTP; 480010 = success, 409409 = verify OK + later create conflict. */
export async function confirmEmailCodeStub(
  payload: IConfirmEmailCodePayload,
): Promise<IConfirmEmailCodeResult> {
  await stubDelay(350)
  const session = sessions.get(payload.verificationId)
  if (!session) {
    throw new ApiError(404, 'VERIFICATION_NOT_FOUND', 'Verification not found')
  }

  if (session.exhausted || session.attemptsLeft <= 0) {
    throw new ApiError(429, 'OTP_EXHAUSTED', 'Too many attempts')
  }

  const email = payload.email.trim().toLowerCase()
  if (email !== session.email) {
    throw new ApiError(400, 'EMAIL_MISMATCH', 'Email mismatch')
  }

  const isSuccess = payload.code === STUB_OTP_CODE
  const isConflict = payload.code === STUB_OTP_CONFLICT_CODE

  if (!isSuccess && !isConflict) {
    session.attemptsLeft -= 1
    if (session.attemptsLeft <= 0) {
      session.exhausted = true
      throw new ApiError(429, 'OTP_EXHAUSTED', 'Too many attempts')
    }
    throw new ApiError(
      400,
      'OTP_INVALID',
      `Invalid code. Attempts left: ${session.attemptsLeft}`,
    )
  }

  sessions.delete(payload.verificationId)
  const tokenPrefix = isConflict ? STUB_CONFLICT_TOKEN_PREFIX : 'tok-'
  return {
    verificationToken: `${tokenPrefix}${payload.verificationId}`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  }
}
