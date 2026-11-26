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
  customer: () => [...bookingQueryKeys.all, 'customer'] as const,
  customerDetail: (bookingNumber: string) =>
    [...bookingQueryKeys.customer(), bookingNumber] as const,
}
