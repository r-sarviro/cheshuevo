export { default as VerifyEmail } from './ui/VerifyEmail'
export type { IVerifyEmailProps } from './ui/VerifyEmail'
export {
  confirmEmailCode,
  requestEmailCode,
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
  type IConfirmEmailCodePayload,
  type IConfirmEmailCodeResult,
  type IRequestEmailCodePayload,
  type IRequestEmailCodeResult,
} from '@/shared/api'
