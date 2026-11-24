# Чешуёво — клиентский лендинг

Публичный лендинг проката драконов (MVP). Стек: React + TypeScript + Vite, архитектура Feature-Sliced Design.

Ручная проверка стабов: см. [DEMO.md](DEMO.md).

## Скрипты

| Команда            | Назначение                  |
| ------------------ | --------------------------- |
| `yarn dev`         | Dev-сервер                  |
| `yarn build`       | Production-сборка           |
| `yarn preview`     | Превью сборки               |
| `yarn lint`        | ESLint                      |
| `yarn lint:fix`    | ESLint с автофиксом         |
| `yarn lint:fsd`    | Steiger (FSD)               |
| `yarn format`      | Prettier                    |
| `yarn typecheck`   | Проверка TypeScript         |
| `yarn check`       | lint + lint:fsd + typecheck |
| `yarn test`        | Unit-тесты (Vitest)         |
| `yarn test:watch`  | Unit-тесты в watch          |
| `yarn test:e2e`    | E2E (Playwright)            |
| `yarn test:e2e:ui` | Playwright UI               |

## Окружение

Скопируйте `.env.example` в `.env` и при необходимости укажите `VITE_API_BASE_URL`.

## Структура (FSD)

```text
src/
  app/        # entry, providers, routes, global styles
  pages/      # home (лендинг), dragon-booking, not-found
  widgets/    # hero, site-header/footer, catalog, booking-wizard
  features/   # select-period, booking-contacts, verify-email
  entities/   # dragon, booking (+ stubs)
  shared/     # api, config/i18n, model, ui-kit
```
