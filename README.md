# Cheshuevo — client landing

**Language:** [EN](README.md) · [RU](README.ru.md)

Client landing for a dragon rental MVP: React, TypeScript, Vite, Feature-Sliced Design.

## Stack

- React + TypeScript + Vite
- Feature-Sliced Design
- Vitest, Playwright

## Requirements

- Node.js 20+
- Yarn

## Quick start

```bash
cp .env.example .env
# optionally set VITE_API_BASE_URL
yarn
yarn dev
```

## Scripts

| Command            | Purpose                     |
| ------------------ | --------------------------- |
| `yarn dev`         | Dev server                  |
| `yarn build`       | Production build            |
| `yarn preview`     | Preview production build    |
| `yarn lint`        | ESLint                      |
| `yarn lint:fix`    | ESLint with autofix         |
| `yarn lint:fsd`    | Steiger (Feature-Sliced Design) |
| `yarn format`      | Prettier                    |
| `yarn typecheck`   | TypeScript check            |
| `yarn check`       | lint + lint:fsd + typecheck |
| `yarn test`        | Unit tests (Vitest)         |
| `yarn test:watch`  | Unit tests in watch mode    |
| `yarn test:e2e`    | E2E (Playwright)            |
| `yarn test:e2e:ui` | Playwright UI               |

## Environment

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if needed.

## Project structure

```text
src/
  app/        # entry, providers, routes, global styles
  pages/      # pages (home)
  shared/     # api, config/i18n, model
```

## License

MIT
