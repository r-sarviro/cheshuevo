import { describe, expect, it, vi } from 'vitest'

import {
  setUpdateProfileStubFailNext,
  updateProfileStub,
} from './updateProfileStub'

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    stubDelay: () => Promise.resolve(),
  }
})

describe('updateProfileStub', () => {
  it('returns trimmed name and phone', async () => {
    const result = await updateProfileStub({
      name: '  Анна  ',
      phone: '+7 900 123-45-67',
    })
    expect(result).toEqual({
      name: 'Анна',
      phone: '+7 900 123-45-67',
    })
  })

  it('rejects empty name', async () => {
    await expect(
      updateProfileStub({ name: '   ', phone: '' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'NAME_REQUIRED',
    })
  })

  it('can fail on demand', async () => {
    setUpdateProfileStubFailNext(true)
    await expect(
      updateProfileStub({ name: 'Анна', phone: '' }),
    ).rejects.toMatchObject({
      status: 500,
      code: 'PROFILE_SAVE_FAILED',
    })
  })
})
