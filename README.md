# AstroNextLevel

AstroNextLevel is a Next.js App Router workspace for astrology, planetary-cycle, and NSE/BSE market research. It uses JSON as the current data source and keeps business-facing services separate from repositories so the data source can move to Java + Oracle later.

## Stack

- Next.js 16 and React 19
- Bootstrap 5.3 and Bootstrap Icons
- JavaScript, TypeScript, and JSON datasets
- Vitest for deterministic regression tests
- Service worker and web manifest for PWA support

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:watch
npm run test:coverage
npm audit
```

ESLint uses the flat configuration in `eslint.config.mjs` and excludes generated build, export, coverage, and dependency directories.

## Structure

```text
app/         App Router pages, layouts, metadata, and API routes
components/  Shared layout, UI, dashboard, astrology, stock, and report components
data/        Authoritative JSON datasets and generated stock files
lib/         Services, repositories, calculations, auth, dates, and domain utilities
src/lib/     Typed utilities used by the typed market routes
src/types/   Typed market data contracts
public/      PWA assets, offline page, icons, and service worker
tests/       Deterministic unit and regression tests
```

## Data Flow

```text
UI -> service -> repository -> JSON
```

Pages and components should use services for application operations. Repositories own JSON, filesystem, or browser-network access. JSON files remain data sources rather than business logic.

## Authentication and PWA

Authentication is currently development-oriented JSON/mock authentication with a safe user subset in browser localStorage. It is not production-grade authorization. The service worker caches static assets and the offline page, but does not cache API or arbitrary JSON responses.

## Future Backend

The planned migration keeps the UI and most services stable:

```text
Current: UI -> service -> JSON repository -> JSON
Future:  UI -> service -> API repository -> Java REST API -> Oracle
```

## Deployment

The GitHub Pages workflow builds a static export. Server API routes and response headers require a server deployment; static hosting should only be used for the supported static-export path.
