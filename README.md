# Cheshuevo — client landing

**Language:** [EN](README.md) · [RU](README.ru.md)

Client landing for a dragon rental MVP: React, TypeScript, Vite, Feature-Sliced Design.

Manual stub check: see [DEMO.md](DEMO.md).

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
| `yarn format`       | Prettier                                            |
| `yarn typecheck`    | TypeScript check                                    |
| `yarn check`        | lint + lint:fsd + typecheck                         |
| `yarn test`         | Unit tests (Vitest)                                 |
| `yarn test:watch`   | Unit tests in watch mode                            |
| `yarn test:e2e`     | E2E (Playwright)                                    |
| `yarn test:e2e:ui`  | Playwright UI                                       |

## Environment

Copy `.env.example` to `.env` and set variables as needed:

| Variable            | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL` | API base URL (default localhost:8080)       |
| `VITE_SITE_URL`     | Absolute site origin without trailing slash |

For production set a real `VITE_SITE_URL` in `.env` (`.env.example` currently has `https://drakonsk.ru`). It drives `canonical` / `og:url` and generation of `public/robots.txt` + `public/sitemap.xml`.

## Project structure

```text
src/
  app/        # entry, providers, routes, global styles
  pages/      # home (landing), dragon-booking, not-found
  widgets/    # hero, site-header/footer, catalog, booking-wizard
  features/   # select-period, booking-contacts, verify-email
  entities/   # dragon, booking (+ stubs)
  shared/     # api, config/i18n, model, ui-kit
```

## License

MIT
