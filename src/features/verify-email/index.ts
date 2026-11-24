export { default as VerifyEmail } from './ui/VerifyEmail'
export type { IVerifyEmailProps } from './ui/VerifyEmail'
export {
  confirmEmailCode,
  requestEmailCode,
  type IConfirmEmailCodePayload,
  type IConfirmEmailCodeResult,
  type IRequestEmailCodePayload,
  type IRequestEmailCodeResult,
} from './api/emailVerificationApi'
export {
  confirmEmailCodeStub,
  requestEmailCodeStub,
  STUB_OTP_CODE,
  STUB_OTP_CONFLICT_CODE,
} from './api/emailVerificationStub'
export {
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
} from './api/useEmailVerification'
