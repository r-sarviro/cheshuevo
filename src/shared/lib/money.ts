/** Map API currency codes to a display symbol for the landing UI. */
export function displayCurrency(currency: string): string {
  if (currency === 'RUB') return '₽'
  return currency
}

export function formatMoney(amount: number, currency: string): string {
  return `${amount}\u00a0${displayCurrency(currency)}`
}
