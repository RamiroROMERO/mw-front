# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Multiwork 2.0 is a multi-tenant/white-label ERP frontend (React 19 + Vite) covering Billing, Accounting, Tax, Banks, HR, Fixed Assets, Inventory, Hospital, and Hotel modules. It's built per-brand (`demo`, `provasa`, `hiper`, `muna`, `arkitek`, `cum`), each pointing at a different backend via `VITE_URL_API` in `.env.<mode>`.

## Commands

- `npm run dev` — start the Vite dev server (port 3000, polling enabled for file watching). Use the base `.env` (demo mode) unless told otherwise.
- `npm run lint` — runs via `eslint.config.js` (flat config, migrated from the old `.eslintrc.cjs`). It currently reports ~7000 pre-existing findings (mostly unused `import React` statements left over from the old JSX transform, now unnecessary since `react/jsx-runtime` is enabled) — this is a known backlog, not something introduced by your changes. Don't try to fix it in bulk unless asked; focus lint attention on files you actually touch.
- `npm run build[:brand]` — **do not run locally**. Every build script pipes into `node post-build.js <brand>`, and both `post-build.js` and `vps.config.json` are gitignored and absent from the working tree (deploy tooling supplied out-of-band). Stick to `npm run dev` / `vite preview` for local verification.
- `npm test` — runs Vitest once (`npm run test:watch` for watch mode). Config lives inline in `vite.config.js`'s `test` key (environment: `jsdom`, since some helpers read `window` at module scope). Test coverage is minimal so far (`DateHelper`, `Utils` pure functions) — see `TECH_DEBT.md`.
- No CI (no `.github/workflows`) and no formatter (no Prettier/Biome) configured.

## Code conventions

- Source is **plain JavaScript with JSX inside `.js` files**, not `.jsx` — this is intentional (Vite is configured with a custom esbuild loader for it). `src/App.js` is the real app root; `src/App.jsx` is dead scaffold code from `create-vite` and is not imported anywhere — don't edit it thinking it's live.
- Entry point is `src/main.js` (loaded directly by `index.html`), not `main.jsx`.
- State management is classic Redux (not Redux Toolkit) with `redux-thunk` and `redux-saga`. Sagas live in `src/redux/sagas.js`.
- Routing is `react-router-dom` v7 via `HashRouter`, with route trees split by business domain under `src/router/` (e.g. `BillingRoutes.js`, `HRRoutes.js`).
- Path aliases (`@/*`, `@Components/*`, `@Constants/*`, `@Containers/*`, `@Helpers/*`, `@Hooks/*`, `@Layouts/*`, `@Redux/*`, `@Router/*`, `@Views/*`) are defined in **both** `jsconfig.json` and `vite.config.js`'s `resolve.alias` — if you add or change an alias, update both files or the IDE and build will diverge.
- Both `dayjs` and `moment` are in use — check which one a given file already imports before adding date logic, don't mix them in the same module.
- `src/redux/contants.js` is a real, existing filename (typo for "constants") — distinct from the top-level `src/constants/` folder and the `@Constants` alias. Don't "fix" the typo without checking all imports.

## Git workflow

- Use feature branches + PRs (not direct commits to `main`), even though recent history shows small commits landing straight on `main`.
