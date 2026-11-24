import { billableHours } from '@/entities/booking'

export function formatMoney(amount: number, currency: string): string {
  return `${amount}\u00a0${currency}`
}

export function formatQuoteDetail(
  hours: number,
  rate: number,
  currency: string,
): string {
  return `${hours} × ${formatMoney(rate, currency)}`
}

export function formatPeriodLabel(
  startsAt: string,
  endsAt: string,
  locale: string,
): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
  })
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateFmt.format(start)}, ${timeFmt.format(start)}–${timeFmt.format(end)}`
}

export function formatTotalLabel(
  startsAt: string,
  endsAt: string,
  total: number,
  currency: string,
): string {
  const hours = billableHours(startsAt, endsAt)
  return `${formatMoney(total, currency)} · ${hours}`
}
