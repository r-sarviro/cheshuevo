import { describe, expect, it, vi } from 'vitest'

import {
  STUB_CONFLICT_TOKEN_PREFIX,
  STUB_OTP_CODE,
  STUB_OTP_CONFLICT_CODE,
} from '@/shared/api'

import {
  confirmEmailCodeStub,
  requestEmailCodeStub,
} from './emailVerificationStub'

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    stubDelay: () => Promise.resolve(),
  }
})

async function startSession(email = 'test@example.com') {
  return requestEmailCodeStub({ email })
}

describe('requestEmailCodeStub', () => {
  it('rejects invalid email', async () => {
    await expect(
      requestEmailCodeStub({ email: 'not-an-email' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_EMAIL',
    })
    await expect(
      requestEmailCodeStub({ email: 'trailing@' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_EMAIL',
    })
  })

  it('returns verification id and resend timer', async () => {
    const result = await startSession('ok@example.com')

    expect(result.verificationId).toMatch(/^ver-\d+$/)
    expect(result.resendAfterSeconds).toBe(42)
    expect(Date.parse(result.expiresAt)).toBeGreaterThan(Date.now())
  })
})

describe('confirmEmailCodeStub', () => {
  it('returns 404 for unknown verification id', async () => {
    await expect(
      confirmEmailCodeStub({
        verificationId: 'ver-missing',
        email: 'test@example.com',
        code: STUB_OTP_CODE,
      }),
    ).rejects.toMatchObject({
      status: 404,
      code: 'VERIFICATION_NOT_FOUND',
    })
  })

  it('returns 400 on email mismatch', async () => {
    const session = await startSession('owner@example.com')

    await expect(
      confirmEmailCodeStub({
        verificationId: session.verificationId,
        email: 'other@example.com',
        code: STUB_OTP_CODE,
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'EMAIL_MISMATCH',
    })
  })

  it('decrements attempts and exhausts after five wrong codes', async () => {
    const session = await startSession('attempts@example.com')
    const email = 'attempts@example.com'

    for (let left = 4; left >= 1; left -= 1) {
      await expect(
        confirmEmailCodeStub({
          verificationId: session.verificationId,
          email,
          code: '000000',
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: 'OTP_INVALID',
        message: `Invalid code. Attempts left: ${left}`,
      })
    }

    await expect(
      confirmEmailCodeStub({
        verificationId: session.verificationId,
        email,
        code: '000000',
      }),
    ).rejects.toMatchObject({
      status: 429,
      code: 'OTP_EXHAUSTED',
    })

    await expect(
      confirmEmailCodeStub({
        verificationId: session.verificationId,
        email,
        code: STUB_OTP_CODE,
      }),
    ).rejects.toMatchObject({
      status: 429,
      code: 'OTP_EXHAUSTED',
    })
  })

  it('returns a normal token for success OTP', async () => {
    const session = await startSession('success@example.com')

    const result = await confirmEmailCodeStub({
      verificationId: session.verificationId,
      email: 'success@example.com',
      code: STUB_OTP_CODE,
    })

    expect(result.verificationToken).toBe(`tok-${session.verificationId}`)
  })

  it('returns a conflict token for conflict OTP', async () => {
    const session = await startSession('conflict@example.com')

    const result = await confirmEmailCodeStub({
      verificationId: session.verificationId,
      email: 'conflict@example.com',
      code: STUB_OTP_CONFLICT_CODE,
    })

    expect(result.verificationToken).toBe(
      `${STUB_CONFLICT_TOKEN_PREFIX}${session.verificationId}`,
    )
  })
})
