type TTokenGetter = () => string | null
type TUnauthorizedHandler = (code: string) => void

let customerTokenGetter: TTokenGetter | null = null
let unauthorizedHandler: TUnauthorizedHandler | null = null

/** Register how the HTTP client reads the cabinet Bearer token (from app/entities). */
export function registerCustomerTokenGetter(getter: TTokenGetter) {
  customerTokenGetter = getter
}

/** Register reaction to 401 on customer routes (clear session / redirect). */
export function registerUnauthorizedHandler(handler: TUnauthorizedHandler) {
  unauthorizedHandler = handler
}

export function readCustomerToken(): string | null {
  return customerTokenGetter?.() ?? null
}

export function notifyUnauthorized(code: string) {
  unauthorizedHandler?.(code)
}
