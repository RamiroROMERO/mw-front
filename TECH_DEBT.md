# Deuda técnica y plan de mejora — mw-front

Checklist accionable generado a partir de una auditoría completa del proyecto (dependencias, arquitectura, seguridad, rendimiento, accesibilidad/i18n). Ordenado por prioridad. Marcar `[x]` a medida que se resuelve cada punto.

## 🔴 Crítico

- [x] **Purgar archivos de usuarios reales versionados en `public/assets/`** (`users/ramiroromero.png`, `pictures/file_*-<timestamp>.png/pdf`) — se sirven sin login en cada build y están en el historial de git. *(Resuelto con `git rm` simple: quedan fuera de commits futuros. No se reescribió el historial pasado — sigue visible en commits viejos si alguien lo busca; evaluar `git filter-repo` más adelante si se necesita cerrarlo del todo. De paso se verificó que `users/user.png`, `users/usuario.png`, `pictures/usuario.png` y `pictures/profiles/362c...png` son el mismo placeholder genérico byte-a-byte — esos quedan, no son datos reales.)*
- [x] **Destrackear `.env.hiper`, `.env.provasa`, `.env.test`** — están en git pese a que `.gitignore` los excluye desde antes. *(Resuelto con `git rm --cached`; los archivos siguen en disco para los builds locales por marca, mismo cuidado sobre historial pasado que el punto anterior.)*
- [x] **Arreglar bug de logout en `src/helpers/core.js`** — `logoutUser()` se llama sin `dispatch`, no hace nada al store. Al expirar el token, el usuario queda "logueado" en Redux viendo errores repetidos en vez de ser redirigido a `/login`. *(Resuelto: se agregó `getStore()` en `src/redux/stores.js` para poder despachar fuera de React, y `core.js` ahora despacha `logoutUser` con un navigate normalizado a `window.location.hash`. Verificado en navegador: con token expirado, redirige a `#/login` y limpia `localStorage`.)*
- [x] **Agregar Error Boundary global** en `src/main.js`/`src/App.js` — hoy cualquier excepción de render deja la pantalla en blanco sin aviso. *(Resuelto: nuevo `src/components/ErrorBoundary/ErrorBoundary.jsx` envolviendo `<Provider><App/></Provider>` en `main.js`. Verificado forzando una excepción de render: muestra pantalla de fallback con botón "Recargar" en vez de blanco.)*
- [x] **Introducir framework de tests** (Vitest, ya usan Vite) — 0 tests hoy en un ERP que calcula nómina/impuestos/contabilidad. Empezar por helpers de cálculo críticos. *(Resuelto: Vitest configurado en `vite.config.js` (`test.environment: 'jsdom'`, reutiliza los alias `@Helpers`/etc.), scripts `npm test`/`npm run test:watch`. Primeros 21 tests en `src/helpers/DateHelper.test.js` y `src/helpers/Utils.test.js`, todos pasando. Queda como base — falta cobertura de los helpers de nómina/impuestos y de `core.js`.)*
- [x] **Aislar o reemplazar `xlsx`** (vulnerabilidad "high" sin fix, prototype pollution/ReDoS) — usada en `src/helpers/Utils.js`, importada de forma estática (también infla el bundle, ver más abajo). *(Parcial: se aisló con `import()` dinámico en `getExcelData` — ya no viaja en el chunk de entrada (bajó de 1058 KB a 723 KB, gzip 310→197 KB), ahora es su propio chunk de 429 KB que solo carga al usar la importación de asistencia. La vulnerabilidad en sí sigue sin fix upstream; reemplazar la librería queda pendiente si se necesita cerrar el hallazgo por completo.)*

## 🟠 Medio

**Redux / estado**
- [x] Borrar código Redux muerto: `src/redux/actions/`, `src/redux/reducers/` (duplicados sin uso), `src/redux/auth/mwReducer.js`, y `src/AppProvider.js`/`src/AppContext.js`/`src/AppRenderer.js` (implementación de auth paralela, rota, sin uso). *(Resuelto: verificado con grep que nada los importaba por ruta explícita, borrados, y confirmado con `vite build` + `npm test` + chequeo en navegador que la app sigue funcionando igual.)*
- [ ] Evaluar migrar el estado restante a Redux Toolkit (`createSlice`/`createAsyncThunk`) y eliminar `redux-saga` (hoy se usa para un solo saga de auth).

**Cliente HTTP (`src/helpers/core.js`)**
- [ ] Revisar `response.ok`/status HTTP en cada método (GET/POST/PUT/DELETE).
- [ ] Agregar timeout/cancelación (`AbortController`).
- [ ] Invocar `fnFinally` realmente (hoy se recibe pero nunca se llama; cada hook duplica el apagado de `loading`).
- [ ] Centralizar construcción de query strings con `URLSearchParams`/`encodeURIComponent` (hoy concatenación manual en ~156 archivos).
- [x] Decidir sobre `src/helpers/coreOld.js` (versión mejor pero sin uso) — terminar la migración o borrarlo. *(Resuelto: borrado, confirmado 0 imports por grep. Las mejoras reales que tenía — `response.ok`, timeout, `fnFinally` — quedan pendientes como refactor de `core.js` en sí, ver el ítem de "Cliente HTTP" más abajo.)*

**Duplicación de patrones de UI**
- [ ] Extraer `useTableConf` repetido en `settings/*` a un hook compartido `buildTableConfig(...)`.
- [ ] Extraer `fnExportToXLSX` (17 implementaciones) a un hook `useExportExcel`.
- [ ] Unificar contrato de "select" (`{value,label}` vs `{id,name}`) entre `SearchSelect` y `SimpleSelect`.
- [ ] Evaluar consolidar duplicidades de librería: tablas (`XReactTable` / `ReactTableEdit` / `SimpleTable`), calendarios (`react-big-calendar` + FullCalendar), datepickers (`react-datepicker` + `react-datetime`), dropzone (`react-dropzone` + `react-dropzone-component`).
- [ ] Refactorizar hooks monolíticos de pantalla (`useEmployees.js` 962 líneas, `usePurchases.js` 420 líneas) separando formulario/validación/llamadas API.

**Infra / build**
- [ ] Migrar el pipeline de build multi-marca (hoy depende de `post-build.js`/`vps.config.json` fuera del repo) a CI/CD versionado (ej. GitHub Actions, matrix build por marca).
- [ ] Resolver inconsistencia de Bootstrap: `reactstrap@9` (Bootstrap 5) pero se carga CSS de Bootstrap 4.6.2 en runtime; eliminar 4 hojas de Bootstrap vendored sin usar (784 KB).

**i18n**
- [x] Sincronizar claves entre `en_US.js` y `es_ES.js`. *(Resuelto: se agregaron las 28 claves que faltaban en inglés, 1 que faltaba en español (`button.send`), y se corrigió un typo (`commin.price` → `common.price`) que hacía que ambos locales tuvieran esa clave con nombres distintos. Ambos locales quedan con 2901 claves idénticas. Se agregó `src/lang/locales/locales.test.js` (vía Vitest, ya que no hay CI) para que no vuelva a desincronizarse sin que falle `npm test`.)*
- [ ] Migrar strings hardcodeados a `IntlMessages`/`FormattedMessage` en módulo Hotel y componentes de upload genéricos.

## 🟡 Bajo

- [ ] Borrar código muerto: `src/App.jsx` (scaffold de create-vite), `src/AppRouter.js`, `firebaseConfig` sin uso en `defaultValues.js`, dependencia `motion` (0 imports), paquete npm `bootstrap-icons` (se usa copia vendored de 7.5 MB en su lugar).
- [ ] Migrar los 27 archivos que usan `moment` directo a `DateHelper` (que ya envuelve `dayjs`) y sacar `moment` del bundle.
- [ ] Migrar los 3 componentes de clase restantes (`Sidebar.jsx`, `NotificationContainer.js`, `dropzone/index.js`) a hooks.
- [ ] Reactivar `React.StrictMode` en `src/main.js` (está comentado).
- [ ] Limpiar imports `import React` innecesarios (428 archivos) — correr `eslint --fix` (57 auto-fixables) y continuar gradualmente.
- [ ] Mejorar accesibilidad: ampliar `aria-*` en modales/tablas (casi inexistente hoy); agregar `role="button"`/`tabIndex`/manejo de teclado en `src/components/uploadFile/Content.jsx` (`<div onClick>` no accesible).
- [ ] Agregar `sandbox` al `<iframe>` de `src/components/ViewPDF/ViewPdf.jsx`.
- [ ] Optimizar imagen de fondo del login (`src/assets/img/login/back-auth.jpg`, 1.4 MB) — comprimir/convertir a WebP.
- [ ] Fijar y documentar una convención de alias de import (`@Helpers` vs `@/helpers`, hoy mezclados) y de extensión de archivo (`.js` vs `.jsx` para componentes con JSX).
- [ ] Corregir typos en nombres de archivo: `useChashBoxes.js` → `useCashBoxes.js`, `redux/contants.js` → `redux/constants.js`.
- [ ] Plan de actualización incremental de dependencias desactualizadas (Vite 6→8, react-intl 7→10, sass, etc.), con testing manual dado que no hay tests automatizados todavía.

---

*Generado el 2026-07-17 a partir de una auditoría de dependencias, arquitectura y seguridad/rendimiento/accesibilidad del proyecto.*
