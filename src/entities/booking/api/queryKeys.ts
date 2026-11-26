export const bookingQueryKeys = {
  all: ['bookings'] as const,
  availability: (dragonId: number, startsAt: string, endsAt: string) =>
    [
      ...bookingQueryKeys.all,
      'availability',
      dragonId,
      startsAt,
      endsAt,
    ] as const,
  customer: (email: string) =>
    [...bookingQueryKeys.all, 'customer', email] as const,
  customerDetail: (email: string, bookingNumber: string) =>
    [...bookingQueryKeys.customer(email), bookingNumber] as const,
}
