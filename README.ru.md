# Чешуёво — клиентское SPA

**Язык:** [EN](README.md) · [RU](README.ru.md)

Публичный клиент проката драконов (MVP): лендинг, «О прокате», бронь, личный кабинет и мини-игра test-flight.

Стек: React 19, TypeScript, Vite, Feature-Sliced Design. Данные идут через живой HTTP API (`openapi.json` → сгенерированные типы). Формы — React Hook Form + Zod.

## Быстрый старт

```bash
cp .env.example .env
# укажите VITE_API_BASE_URL на запущенный API
yarn
yarn dev
```

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
| `yarn format`       | Prettier write                                             |
| `yarn format:check` | Prettier check                                             |
| `yarn typecheck`    | Проверка TypeScript                                        |
| `yarn api:types`    | Генерация типов API из `openapi.json`                      |
| `yarn check`        | lint + lint:fsd + typecheck                                |
| `yarn test`         | Unit-тесты (Vitest)                                        |
| `yarn test:watch`   | Unit-тесты в watch                                         |
| `yarn test:e2e`     | E2E (Playwright)                                           |
| `yarn test:e2e:ui`  | Playwright UI                                              |

## Окружение

Скопируйте `.env.example` в `.env` и при необходимости задайте переменные:

| Переменная          | Назначение                                             |
| ------------------- | ------------------------------------------------------ |
| `VITE_API_BASE_URL` | Базовый URL API (по умолчанию `localhost:8000/api/v1`) |
| `VITE_SITE_URL`     | Абсолютный origin сайта без trailing slash             |

Для продакшена задайте реальный `VITE_SITE_URL` в окружении сборки/CI (в `.env.example` сейчас `https://drakonsk.ru`). От него зависят `canonical` / `og:url` и генерация `public/robots.txt` + `public/sitemap.xml` при `yarn build`.

После изменений в `openapi.json` перегенерируйте типы клиента: `yarn api:types`.

## Маршруты

| Путь                               | Назначение                                      |
| ---------------------------------- | ----------------------------------------------- |
| `/`                                | Лендинг (hero, каталог, инфо-блоки)             |
| `/about`                           | О прокате / как это работает / место / контакты |
| `/dragons/:dragonId`               | Страница дракона + мастер бронирования          |
| `/cabinet/login`                   | Вход в кабинет (email OTP)                      |
| `/cabinet/bookings`                | Брони клиента                                   |
| `/cabinet/bookings/:bookingNumber` | Детали брони                                    |
| `/cabinet/profile`                 | Профиль                                         |
| `/test-flight`                     | Мини-игра                                       |
| `/404`                             | Страница 404                                    |

## Структура (FSD)

```text
src/
  app/        # entry, providers, routes, global styles
  pages/      # home, about, dragon-booking, cabinet, play, not-found
  widgets/    # hero, catalog, booking-wizard, cabinet-*, landing-info, chrome
  features/   # select-period, booking-contacts, verify-email, cabinet-auth, …
  entities/   # dragon, booking, customer
  shared/     # api (OpenAPI-клиент), config/i18n, model, ui-kit
```

## Лицензия

MIT
