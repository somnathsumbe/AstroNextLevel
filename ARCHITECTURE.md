# Architecture

## Source Ownership

- `app/` is the root-level Next.js App Router and remains the route authority.
- `components/` contains reusable UI and domain presentation.
- `lib/` contains services, repositories, authentication, calculations, dates, and domain utilities.
- `data/` is the authoritative JSON source, including generated stock files.
- `src/lib/` and `src/types/` contain typed utilities and contracts still used by the typed market routes.
- `public/` contains installability and offline assets.
- `tests/` contains deterministic Vitest regression tests.

The project intentionally uses a root-level App Router rather than moving routes into `src/app/`. The remaining `src/` directory is a small typed boundary for the Sun/Jupiter market routes: its ISO-date helpers, CSV export helpers, data contracts, and `sun-jupiter-tracking.json` are active imports, not duplicate source roots. New shared code should prefer the root-level `lib/`, `components/`, and `data/` locations unless it belongs to that typed route boundary.

## Route Ownership

- Public: `/login`, `/register`, and `/` redirect handling.
- Authenticated application routes: dashboard, astrology, market, stock, calculator, report, profile, and settings pages.
- Dynamic/static support: `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, and the stock API routes.
- `AuthGate` remains the client-side route guard for the current development authentication model.

## Data Direction

```text
UI
 ↓
Service
 ↓
Repository
 ↓
JSON or filesystem
```

Repositories own data access. Services own application-level transformations and coordination. Components should not read JSON or filesystem data directly.

## Authentication

The current development authentication flow reads the local user dataset, validates credentials in the user service, and stores a safe user subset in localStorage. `AuthGate` protects client routes. This is intentionally temporary and does not provide server-verifiable authorization.

## PWA and Security

`public/sw.js` caches static assets and the offline fallback only. API responses and arbitrary JSON are excluded from Cache Storage. Next.js server deployments configure baseline security headers in `next.config.js`; static hosting must provide equivalent headers at the platform layer.

## Testing

Vitest covers deterministic date handling, Gann calculations, stock validation, and development authentication. The suite avoids current-time dependence and does not modify production JSON. Browser component and E2E tests remain a future layer when a browser test harness is justified.

`npm run lint` uses the ESLint 9 flat configuration in `eslint.config.mjs`. Existing browser-storage hydration effects are intentionally allowed by the configuration; they are preserved behavior, not unused effects.

## Future Java + Oracle Migration

```text
Current: UI -> service -> JSON repository -> JSON
Future:  UI -> service -> API repository -> Java REST API -> Oracle
```

The intended migration replaces repository implementations while preserving pages, components, most services, and business-facing types.