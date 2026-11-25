export interface ICustomerProfile {
  email: string
  name: string | null
  phone: string
}

export interface ICabinetSession {
  email: string
  name: string | null
  phone: string
  authedAt: number
}
