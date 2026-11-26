import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useCabinetSessionStore } from '@/entities/customer'
import { CABINET_LOGIN_PATH } from '@/shared/config'

/** Layout guard: no flash of protected content (RR Outlet + Navigate). */
const RequireCabinetAuth = () => {
  const location = useLocation()
  const isAuthenticated = useCabinetSessionStore((s) => s.isAuthenticated)

  if (!isAuthenticated()) {
    return (
      <Navigate to={CABINET_LOGIN_PATH} replace state={{ from: location }} />
    )
  }

  return <Outlet />
}

export default RequireCabinetAuth
