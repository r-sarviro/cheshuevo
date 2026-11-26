# Cheshuevo — client SPA

**Language:** [EN](README.md) · [RU](README.ru.md)

Public client for a dragon rental MVP: landing, about, booking, personal cabinet, and a small test-flight mini-game.

Stack: React 19, TypeScript, Vite, Feature-Sliced Design. Data goes through a live HTTP API (`openapi.json` → generated types). Forms use React Hook Form + Zod.

## Quick start

```bash
cp .env.example .env
# point VITE_API_BASE_URL at a running API
yarn
yarn dev
```

## Scripts

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `yarn dev`          | Dev server                                          |
| `yarn build`        | Production build (runs `prebuild` → `seo:generate`) |
| `yarn seo:generate` | `robots.txt` + `sitemap.xml` from `VITE_SITE_URL`   |
| `yarn preview`      | Preview production build                            |
| `yarn lint`         | ESLint                                              |
| `yarn lint:fix`     | ESLint with autofix                                 |
| `yarn lint:fsd`     | Steiger (FSD)                                       |
| `yarn format`       | Prettier write                                      |
| `yarn format:check` | Prettier check                                      |
| `yarn typecheck`    | TypeScript check                                    |
| `yarn api:types`    | Generate API types from `openapi.json`              |
| `yarn check`        | lint + lint:fsd + typecheck                         |
| `yarn test`         | Unit tests (Vitest)                                 |
| `yarn test:watch`   | Unit tests in watch mode                            |
| `yarn test:e2e`     | E2E (Playwright)                                    |
| `yarn test:e2e:ui`  | Playwright UI                                       |

## Environment

Copy `.env.example` to `.env` and set variables as needed:

| Variable            | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL` | API base URL (default `localhost:8000/api/v1`) |
| `VITE_SITE_URL`     | Absolute site origin without trailing slash |

For production set a real `VITE_SITE_URL` in the build/CI environment (`.env.example` currently has `https://drakonsk.ru`). It drives `canonical` / `og:url` and generation of `public/robots.txt` + `public/sitemap.xml` during `yarn build`.

After changing `openapi.json`, regenerate client types with `yarn api:types`.

## Routes

| Path | Purpose |
| ---- | ------- |
| `/` | Landing (hero, catalog, info blocks) |
| `/about` | About / how it works / place / contacts |
| `/dragons/:dragonId` | Dragon page + booking wizard |
| `/cabinet/login` | Cabinet login (email OTP) |
| `/cabinet/bookings` | Customer bookings |
| `/cabinet/bookings/:bookingNumber` | Booking detail |
| `/cabinet/profile` | Profile |
| `/test-flight` | Mini-game |
| `/404` | Not found |

## Project structure

```text
src/
  app/        # entry, providers, routes, global styles
  pages/      # home, about, dragon-booking, cabinet, play, not-found
  widgets/    # hero, catalog, booking-wizard, cabinet-*, landing-info, chrome
  features/   # select-period, booking-contacts, verify-email, cabinet-auth, …
  entities/   # dragon, booking, customer
  shared/     # api (OpenAPI client), config/i18n, model, ui-kit
```

## License

MIT
