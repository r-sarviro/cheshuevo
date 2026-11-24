# Чешуёво — клиентский лендинг

Публичный лендинг проката драконов (MVP). Стек: React + TypeScript + Vite, архитектура Feature-Sliced Design.

Ручная проверка стабов: см. [DEMO.md](DEMO.md).

## Скрипты

| Команда             | Назначение                                                 |
| ------------------- | ---------------------------------------------------------- |
| `yarn dev`          | Dev-сервер                                                 |
| `yarn build`        | Production-сборка (перед этим `prebuild` → `seo:generate`) |
| `yarn seo:generate` | `robots.txt` + `sitemap.xml` по `VITE_SITE_URL`            |
| `yarn preview`      | Превью сборки                                              |
| `yarn lint`         | ESLint                                                     |
| `yarn lint:fix`     | ESLint с автофиксом                                        |
| `yarn lint:fsd`     | Steiger (FSD)                                              |
| `yarn format`       | Prettier                                                   |
| `yarn typecheck`    | Проверка TypeScript                                        |
| `yarn check`        | lint + lint:fsd + typecheck                                |
| `yarn test`         | Unit-тесты (Vitest)                                        |
| `yarn test:watch`   | Unit-тесты в watch                                         |
| `yarn test:e2e`     | E2E (Playwright)                                           |
| `yarn test:e2e:ui`  | Playwright UI                                              |

## Окружение

Скопируйте `.env.example` в `.env` и при необходимости задайте переменные:

| Переменная          | Назначение                                    |
| ------------------- | --------------------------------------------- |
| `VITE_API_BASE_URL` | Базовый URL API (по умолчанию localhost:8080) |
| `VITE_SITE_URL`     | Абсолютный origin сайта без trailing slash    |

Для продакшена задайте реальный `VITE_SITE_URL` в `.env` (сейчас в `.env.example`: `https://drakonsk.ru`). От него зависят `canonical` / `og:url` и генерация `public/robots.txt` + `public/sitemap.xml`.

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
