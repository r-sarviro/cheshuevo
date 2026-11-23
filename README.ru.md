# Чешуёво — клиентский лендинг

**Язык:** [EN](README.md) · [RU](README.ru.md)

Клиентский лендинг проката драконов (MVP): React, TypeScript, Vite, Feature-Sliced Design.

## Стек

- React + TypeScript + Vite
- Feature-Sliced Design
- Vitest, Playwright

## Требования

- Node.js 20+
- Yarn

## Быстрый старт

```bash
cp .env.example .env
# при необходимости укажите VITE_API_BASE_URL
yarn
yarn dev
```

## Скрипты

| Команда            | Назначение                       |
| ------------------ | -------------------------------- |
| `yarn dev`         | Dev-сервер                       |
| `yarn build`       | Production-сборка                |
| `yarn preview`     | Превью сборки                    |
| `yarn lint`        | ESLint                           |
| `yarn lint:fix`    | ESLint с автофиксом              |
| `yarn lint:fsd`    | Steiger (Feature-Sliced Design)  |
| `yarn format`      | Prettier                         |
| `yarn typecheck`   | Проверка TypeScript              |
| `yarn check`       | lint + lint:fsd + typecheck      |
| `yarn test`        | Unit-тесты (Vitest)              |
| `yarn test:watch`  | Unit-тесты в watch               |
| `yarn test:e2e`    | E2E (Playwright)                 |
| `yarn test:e2e:ui` | Playwright UI                    |

## Окружение

Скопируйте `.env.example` в `.env` и при необходимости укажите `VITE_API_BASE_URL`.

## Структура проекта

```text
src/
  app/        # entry, providers, routes, global styles
  pages/      # страницы (home)
  shared/     # api, config/i18n, model
```

## Лицензия

MIT
