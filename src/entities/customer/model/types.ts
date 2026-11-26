export interface ICustomerProfile {
  email: string
  name: string | null
}

export interface ICabinetSessionToken {
  token: string
  tokenType: string
  expiresAt: string
}

export interface ICabinetSession {
  token: string
  tokenType: string
  expiresAt: string
  email: string | null
  name: string | null
}
