import { Route, Routes } from 'react-router-dom'

import { DragonBookingPage } from '@/pages/dragon-booking'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dragons/:dragonId" element={<DragonBookingPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
