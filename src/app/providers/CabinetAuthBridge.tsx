import { useEffect, type ReactNode } from 'react'

import { useCabinetSessionStore } from '@/entities/customer'
import {
  queryClient,
  registerCustomerTokenGetter,
  registerUnauthorizedHandler,
} from '@/shared/api'

interface ICabinetAuthBridgeProps {
  children: ReactNode
}

registerCustomerTokenGetter(() => {
  const state = useCabinetSessionStore.getState()
  if (!state.isAuthenticated()) return null
  return state.token
})

/** Wires cabinet session token into shared HTTP client. */
const CabinetAuthBridge = (props: ICabinetAuthBridgeProps) => {
  const { children } = props

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      useCabinetSessionStore.getState().signOut()
      queryClient.clear()
    })
  }, [])

  return children
}

export default CabinetAuthBridge
