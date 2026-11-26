import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

import { RequireCabinetAuth } from '@/features/cabinet-auth'
import {
  CabinetBookingDetailPage,
  CabinetBookingsPage,
  CabinetLoginPage,
  CabinetProfilePage,
  CabinetShellLayout,
} from '@/pages/cabinet'
import { AboutPage } from '@/pages/about'
import { DragonBookingPage } from '@/pages/dragon-booking'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'
import { PlayPage } from '@/pages/play'
import {
  ABOUT_PATH,
  CABINET_BOOKING_ROUTE,
  CABINET_BOOKINGS_PATH,
  CABINET_LOGIN_PATH,
  CABINET_PROFILE_PATH,
  DRAGON_ROUTE,
  HOME_PATH,
  NOT_FOUND_PATH,
  PLAY_PATH,
} from '@/shared/config'

import RootLayout from './RootLayout'

/** Data-router tree: ScrollRestoration lives on RootLayout. */
export const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path={HOME_PATH} element={<HomePage />} />
      <Route path={ABOUT_PATH} element={<AboutPage />} />
      <Route path={PLAY_PATH} element={<PlayPage />} />
      <Route path={DRAGON_ROUTE} element={<DragonBookingPage />} />
      <Route path={CABINET_LOGIN_PATH} element={<CabinetLoginPage />} />
      <Route element={<RequireCabinetAuth />}>
        <Route element={<CabinetShellLayout />}>
          <Route
            path="/cabinet"
            element={<Navigate to={CABINET_BOOKINGS_PATH} replace />}
          />
          <Route
            path={CABINET_BOOKINGS_PATH}
            element={<CabinetBookingsPage />}
          />
          <Route
            path={CABINET_BOOKING_ROUTE}
            element={<CabinetBookingDetailPage />}
          />
          <Route path={CABINET_PROFILE_PATH} element={<CabinetProfilePage />} />
        </Route>
      </Route>
      <Route path={NOT_FOUND_PATH} element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
)
