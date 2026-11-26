export type { components, operations, paths } from './generated'
export type {
  TAvailabilitySchema,
  TBookingStatus,
  TConfirmEmailCodeRequest,
  TCustomerBookingRequest,
  TCustomerBookingResource,
  TCustomerMeSchema,
  TCustomerSessionSchema,
  TDragonResource,
  TDragonResourceWire,
  TEmailVerificationConfirmed,
  TEmailVerificationCreated,
  TPaymentMethod,
  TPaymentStatus,
  TPublicBookingCreated,
  TPublicBookingRequest,
  TRequestEmailCodeRequest,
} from './generated'
export {
  ApiError,
  apiRequest,
  createIdempotencyKey,
  type ApiErrorBody,
} from './client'
export {
  notifyUnauthorized,
  readCustomerToken,
  registerCustomerTokenGetter,
  registerUnauthorizedHandler,
} from './authBridge'
export { queryClient } from './queryClient'
export {
  mapCustomerSession,
  type ICabinetApiSession,
} from './mapCustomerSession'
export {
  parseWire,
  availabilitySchema,
  customerBookingDetailSchema,
  customerBookingResourceSchema,
  customerBookingsListSchema,
  customerMeSchema,
  dragonDetailSchema,
  dragonResourceSchema,
  dragonsListSchema,
  emailVerificationConfirmedSchema,
  emailVerificationCreatedSchema,
  publicBookingCreatedSchema,
} from './wire'
export {
  confirmEmailCode,
  requestEmailCode,
  useConfirmEmailCodeMutation,
  useRequestEmailCodeMutation,
  type IConfirmEmailCodePayload,
  type IConfirmEmailCodeResult,
  type IRequestEmailCodePayload,
  type IRequestEmailCodeResult,
  type TEmailVerificationPurpose,
} from './email-verification'
