import { Outlet, ScrollRestoration } from 'react-router-dom'

/** App shell for the data router: page outlet + official scroll restore. */
const RootLayout = () => {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

export default RootLayout
