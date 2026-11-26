import type { components } from './schema'

export type TDragonResource = components['schemas']['DragonResource']
export type TAvailabilitySchema = components['schemas']['AvailabilitySchema']
export type TPublicBookingCreated =
  components['schemas']['PublicBookingCreatedSchema']
export type TCustomerBookingResource =
  components['schemas']['CustomerBookingResource']
export type TCustomerMeSchema = components['schemas']['CustomerMeSchema']
export type TCustomerSessionSchema =
  components['schemas']['CustomerSessionSchema']
export type TEmailVerificationCreated =
  components['schemas']['EmailVerificationCreatedSchema']
export type TEmailVerificationConfirmed =
  components['schemas']['EmailVerificationConfirmedSchema']
export type TPublicBookingRequest =
  components['schemas']['PublicBookingRequest']
export type TCustomerBookingRequest =
  components['schemas']['CustomerBookingRequest']
export type TRequestEmailCodeRequest =
  components['schemas']['RequestEmailCodeRequest']
export type TConfirmEmailCodeRequest =
  components['schemas']['ConfirmEmailCodeRequest']
export type TBookingStatus = components['schemas']['BookingStatus']
export type TPaymentStatus = components['schemas']['PaymentStatus']
export type TPaymentMethod = components['schemas']['PaymentMethod']

/** OpenAPI DragonResource plus fields not yet published in the schema. */
export type TDragonResourceWire = TDragonResource & {
  // TODO(api): add tags / fit / best_for to OpenAPI DragonResource when backend exposes them.
  tags?: Array<{ key?: string | null; label?: string | null }> | null
  fit?: string | null
  best_for?: string | null
}
