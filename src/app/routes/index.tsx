import { Route, Routes } from 'react-router-dom'

import { DragonBookingPage } from '@/pages/dragon-booking'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'
import { PlayPage } from '@/pages/play'
import {
  DRAGON_ROUTE,
  HOME_PATH,
  NOT_FOUND_PATH,
  PLAY_PATH,
} from '@/shared/config'

export function AppRouter() {
  return (
    <Routes>
      <Route path={HOME_PATH} element={<HomePage />} />
      <Route path={PLAY_PATH} element={<PlayPage />} />
      <Route path={DRAGON_ROUTE} element={<DragonBookingPage />} />
      <Route path={NOT_FOUND_PATH} element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
