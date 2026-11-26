export { default as VerifyEmail } from './ui/VerifyEmail'
export type { IVerifyEmailProps } from './ui/VerifyEmail'
export {
  confirmEmailCode,
  confirmEmailCodeStub,
  requestEmailCode,
  requestEmailCodeStub,
  STUB_OTP_CODE,
  STUB_OTP_CONFLICT_CODE,
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
  type IConfirmEmailCodePayload,
  type IConfirmEmailCodeResult,
  type IRequestEmailCodePayload,
  type IRequestEmailCodeResult,
} from '@/shared/api'
