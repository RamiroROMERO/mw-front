# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Multiwork 2.0 is a multi-tenant/white-label ERP frontend (React 19 + Vite) covering Billing, Accounting, Tax, Banks, HR, Fixed Assets, Inventory, Hospital, and Hotel modules. It's built per-brand (`demo`, `provasa`, `hiper`, `muna`, `arkitek`, `cum`), each pointing at a different backend via `VITE_URL_API` in `.env.<mode>`.

## Commands

- `npm run dev` — start the Vite dev server (port 3000, polling enabled for file watching). Use the base `.env` (demo mode) unless told otherwise.
- `npm run lint` — runs via `eslint.config.js` (flat config, migrated from the old `.eslintrc.cjs`). It currently reports ~7000 pre-existing findings (mostly unused `import React` statements left over from the old JSX transform, now unnecessary since `react/jsx-runtime` is enabled) — this is a known backlog, not something introduced by your changes. Don't try to fix it in bulk unless asked; focus lint attention on files you actually touch.
- `npm run build[:brand]` — **do not run locally**. Every build script pipes into `node post-build.js <brand>`, and both `post-build.js` and `vps.config.json` are gitignored and absent from the working tree (deploy tooling supplied out-of-band). Stick to `npm run dev` / `vite preview` for local verification.
- `npm test` — runs Vitest once (`npm run test:watch` for watch mode). Config lives inline in `vite.config.js`'s `test` key (environment: `jsdom`, since some helpers read `window` at module scope). Test coverage is minimal so far (`DateHelper`, `Utils` pure functions) — see `TECH_DEBT.md`.
- CI (`.github/workflows/ci.yml`) runs `npx vite build` + `npm test` on every push/PR to `main`; `npm run lint` also runs there but as a non-blocking step (the ~7000-item backlog above would otherwise fail every run). No formatter (no Prettier/Biome) configured.

## Code conventions

- Source is **plain JavaScript with JSX inside `.js` files**, not `.jsx` — this is intentional (Vite is configured with a custom esbuild loader for it). `src/App.js` is the real app root; `src/App.jsx` is dead scaffold code from `create-vite` and is not imported anywhere — don't edit it thinking it's live.
- Entry point is `src/main.js` (loaded directly by `index.html`), not `main.jsx`.
- State management uses Redux Toolkit (`configureStore`/`createSlice` in `src/redux/stores.js` and the 4 reducer files) plus `redux-saga` (kept only for the auth login/logout flow, `src/redux/sagas.js`). The slices' `extraReducers` intentionally key off the same string action-type constants (`src/redux/contants.js`) the saga and existing action creators already use — don't switch a slice to its own auto-generated actions without checking whether the saga or another reducer still listens for the old type string.
- Routing is `react-router-dom` v7 via `HashRouter`, with route trees split by business domain under `src/router/` (e.g. `BillingRoutes.js`, `HRRoutes.js`).
- Path aliases (`@/*`, `@Components/*`, `@Constants/*`, `@Containers/*`, `@Helpers/*`, `@Hooks/*`, `@Layouts/*`, `@Redux/*`, `@Router/*`, `@Views/*`) are defined in **both** `jsconfig.json` and `vite.config.js`'s `resolve.alias` — if you add or change an alias, update both files or the IDE and build will diverge.
- Both `dayjs` and `moment` are in use — check which one a given file already imports before adding date logic, don't mix them in the same module.
- `src/redux/contants.js` is a real, existing filename (typo for "constants") — distinct from the top-level `src/constants/` folder and the `@Constants` alias. Don't "fix" the typo without checking all imports.
- Duplicate-library cleanup: `react-datepicker` (via `@Components/dateCalendar` and `@Components/dateTimeCalendar`) is the only date-picker library — `react-datetime` was removed. `react-dropzone` (via `UploadImages.jsx`) is the only dropzone library — `react-dropzone-component` was removed. FullCalendar is the only calendar library — `react-big-calendar` was removed. `@fortawesome/react-fontawesome` was removed (dead import). `src/views/app/production/**` and `src/views/app/start/**` are orphaned modules (no route, no live importers) left with dangling imports to the removed libraries — harmless since nothing imports them, but don't "fix" those imports without first checking whether the module is meant to be revived or deleted (see `TECH_DEBT.md`).
- Build request query strings with `buildUrl(path, params)` from `@Helpers/core` (uses `URLSearchParams` internally), not template-literal interpolation (`` `path?a=${a}` ``) — the latter doesn't encode special characters and was a real bug for free-text search fields.
- `SearchSelect` (react-select, `@Components/SearchSelect`) and `SimpleSelect` (native `<select>`, `@Components/simpleSelect`) default to `{value,label}` and `{id,name}` option shapes respectively, but both accept optional `getOptionValue`/`getOptionLabel` accessor props so new code can pass either component whatever shape is already on hand without remapping — don't reshape data just to fit the default contract.
- `request.getFile()` (`core.js`) never rejects — it catches internally and returns `undefined` on failure. None of its ~7 callers use try/catch (fire-and-forget `await` pattern), so don't remove that internal catch when touching `core.js` again.
- Large screen hooks (`useEmployees.js`, `usePurchases.js`) split reference-data loading and cohesive sub-flows into colocated sibling hooks (e.g. `useEmployeeReferenceData.js`, `usePurchaseFormLists.js`, `usePurchaseOrders.js`) rather than one big file — follow that pattern for other monolithic hooks. The actual save/update logic (`fnSaveEmployee`, `fnSavePurchase`) was deliberately left untouched during that refactor (no real backend available to verify a full save round-trip) — treat that as a higher-risk area needing extra care.

## Git workflow

- Use feature branches + PRs (not direct commits to `main`), even though recent history shows small commits landing straight on `main`.
