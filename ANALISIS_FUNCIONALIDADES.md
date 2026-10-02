# Análisis de Funcionalidades — Multiwork 2.0

> Generado el 2026-09-28. Cubre `mw-front` (React 19 + Vite) y `mw-back` (Express 5 + Sequelize 6 + MySQL). Es un inventario de **qué existe, qué tan completo está y qué patrón arquitectónico usa** cada módulo del ERP, no un changelog. Los niveles de completitud reflejan lo verificado por lectura de código y, cuando se indica, pruebas reales contra base de datos o navegador — cuando no se dice "verificado en browser", asumir que no se probó visualmente end-to-end.

## Resumen ejecutivo

Multiwork 2.0 es un ERP/CRM multi-tenant white-label (marcas: `demo`, `provasa`, `hiper`, `muna`, `arkitek`, `cum`, cada una con su propio build y backend/DB independiente — no es multi-tenant en runtime, son instalaciones separadas). La migración desde el sistema legacy (`.sc2`, FoxPro/VFP a juzgar por convenciones) está **prácticamente terminada en superficie de negocio**: los 12 módulos del menú principal tienen pantallas reales conectadas a API, no mockups. Lo que queda pendiente es sobre todo:

1. **Migración arquitectónica interna** del backend al patrón nuevo `modules/<dominio>/<entidad>/` (Controller+Service+Routes+DTO) — ~45% de los archivos backend ya están ahí (447 de ~990), pero muy desigual por dominio. RRHH, Producción, Hotel y buena parte de Admin/Hospital siguen 100% en el patrón legado (archivos sueltos en `routes/`, `controller/`, `services/`).
2. **Verificación real** — varios módulos grandes (Banks, Fixed Assets, buena parte de RRHH) nunca se probaron contra un navegador real, solo contra base de datos o por lectura de código.
3. **Deuda de limpieza puntual**: pantallas comentadas/ocultas del menú que en realidad SÍ funcionan (ver sección RRHH), typos consistentes en rutas backend, algún endpoint copy-pasteado mal.

| Módulo | Estado general | Migrado a `modules/` | Verificado en browser |
|---|---|---|---|
| Billing (Facturación) | Completo, con features nuevas (email-send, multi-doc) | Sí (98 archivos) | Sí, extensamente |
| Inventory | ~15/25 procesos migrados, resto legacy pero funcional | Parcial (157 archivos) | Sí, mayoría |
| Accounting | Completo salvo Centros de Costo (deferred) | Sí (88 archivos) | Sí, mayoría |
| Tax | Completo salvo ND Proveedores (tabla fuente vacía) | Parcial (13 archivos) | Sí |
| Banks | Completo (Proceso+Reportes) | Sí (70 archivos) | **No** |
| Little Cash (Caja Chica) | Completo (3 pantallas) | Parte de Banks | Parcial (síntetico) |
| Fixed Assets | Completo (Register/Depreciation/Assign/Reports) | Parcial (14 archivos) | **No** |
| Hospital | Completo salvo privilegios (gap global) | Apenas iniciado (3 archivos) | Parcial |
| **Human Resources (RRHH)** | **Más completo de lo asumido** — ver detalle abajo | **No** (0 archivos, 100% legacy) | **No** |
| Production | Completo (revivido desde estado huérfano) | No (legacy) | No |
| Dashboards | Completo (2 pantallas) | N/A (solo lectura) | No |
| Hotel Management | Completo en frontend; backend expone más de lo que el menú usa | No (legacy) | No |
| Settings (segundo menú) | Completo | Parcial (Admin: 4 archivos) | Sí, mayoría |

---

## 1. Billing (Facturación)

Módulo núcleo del sistema, el más trabajado y verificado con datos reales.

**Settings**: Áreas de facturación, Cajas, Métodos de pago, Descuentos — 5/5 gaps de fidelidad encontrados y corregidos (código de privilegio incorrecto, campo faltante, validaciones sobre-estrictas, regla de unicidad faltante).

**Process**:
- **Cotizaciones (Quotes)** — ya existía en v2, se cerraron brechas de fidelidad; estableció el patrón `exportPDFExternal` vs `exportPDFInternal` reutilizado luego por todo documento imprimible nuevo del sistema.
- **Órdenes de Compra (billing)** — migrada junto con envío de PDF por correo (reutilizado también en Cotizaciones).
- **Facturación (Invoicing)** — el análisis de brechas más profundo del sistema: CAI/kardex/CxC al estilo CheckoutService, impresión en USD, manejo de lotes, validación de stock, privilegio dedicado, carga desde PO, Proforma, Cambio de Producto con reversión real de kardex, edición de info, envío por correo. Se corrigió además un bug de subtotal-siempre-0 en el detalle de factura.
- **Punto de Venta (POS)** — ~90-92% completo; la fórmula de conciliación de Cierre de Caja está implementada y validada contra datos reales.
- **Notas de Crédito / Débito a clientes** — ambas 100% completas y verificadas con datos reales (tablas reales son `fac_credit_notes*`/`fac_debit_notes*`, no `fac_ncredito*`/`fac_ndebito*` como sugería el nombre legacy). Notas de Débito usa signos GL opuestos a Crédito y tiene modo dual de ajuste precio/cantidad.
- **Guía de Remisión fiscal**: no existe como documento fiscal real en ningún lugar del sistema todavía — pendiente, se revisará solo cuando la migración completa del ERP esté cerrada (no por-pantalla).

**Reports**: 19 variantes de "Otros Reportes" completas (10 simples + 4 pivote — cifra correcta incluye variantes adicionales verificadas). Se encontraron y corrigieron: bug de `cell: undefined` en columnas dinámicas de ReactTable (ver Infraestructura), una clave de locale inventada, y un bug real de fan-out por LEFT JOIN (inflaba resultados 8x con `vend_code` vacío).

---

## 2. Inventory

**Settings**: Almacenes y Productos con bugs corregidos; las 13 características de "Ajustes de Inventario" migradas a `modules/` con DTOs. Catálogo: Códigos y Precios Asegurados diferidos a fin de migración.

**Process**: Providers (6+ bugs reales corregidos, incluyendo un mismatch `providerType`/`providerTypeId` que rompía el guardado del tipo por completo; Actualizar Cuentas y Exportar Excel construidos; Transferir inter-compañía y formulario "Productor" — vertical café — quedan stub). Purchase Orders, Compras (Compras principal en pausa: fases 1-5 + Facturas Complementarias listas, Admin/Condiciones de Pago/Distribución de Anticipos diferidos hasta que existan los módulos de Contabilidad/Bancos que necesitan), Otras Compras, Compras de Combustible (con Contabilizar/Anular, corrigió un desbalance real de partida contable), Compra por Ticket (construida desde cero, sin backend previo), Notas de Crédito a Proveedores (fusiona también la variante "mixed"), familia completa de movimientos de inventario (Traslados/Requisiciones/Ajustes/Reintegro/Ajuste de Costo).

**Reports**: Stocks y reportes 100% migrados a `modules/` (tocó ~20 archivos compartidos de kardex); reportes de compra "Otros Reportes" (4 construidos, con bug real de filtro `isBonus`); reportes de Kardex (4 construidos totalmente desde cero, sin scaffold previo — no confundir con la familia de `inventoryReport`).

**Estado de migración arquitectónica**: 15 de 25 procesos de `/inventory/*` ya están en `modules/`; quedan 10 de Procesos/Reportes en patrón legacy, planificados para después.

---

## 3. Accounting (Contabilidad)

Módulo completo. Partidas Diarias (Daily Items) fue la primera pantalla migrada y estableció el patrón; luego se cerró **todo** el menú `Contabilidad` legacy: Estado de Resultado, Balance General, Balanza de Comprobación, Presupuesto Ejecutado, Histórico de Pagos a Proveedores. Único ítem diferido: **Centros de Costo**, movido a "fin de toda la migración ERP" por decisión explícita.

Pantallas satélite de CxC: 6/9 construidas; 3/9 descartadas por no tener uso real (`cont_cxcdeta02`, `cont_cxcnuevacartera`, `cont_cxcuc`). Pantallas satélite de CxP: todas cerradas salvo 2 diferidas deliberadamente (`cont_cxphistory_residue`, `cont_cxp_advances`); se confirmó que las satélite de CxP difieren estructuralmente de sus homólogas de CxC (p. ej. `cxpPaymentHistory` es una unión a 3 vías que incluye Retenciones, a diferencia de la unión a 2 vías de CxC).

La fórmula de saldo en tiempo real de CxC/CxP replica exactamente las consultas legacy (`getCurrentCxC`/`getCurrentCxP`) — se corrigió un bug real de doble conteo de pagos (`newPay`) que afectaba ~92% de los documentos del sistema completo, con el fix centralizado en la fórmula compartida (sin necesidad de reconstruir pantalla por pantalla).

---

## 4. Tax (Impuestos)

Notas de Crédito a Proveedores se plegaron dentro de `purchaseReport` (verificado a nivel de servicio). Notas de Débito a Proveedores quedaron diferidas: la tabla fuente legacy está vacía y no existe ninguna pantalla de proceso que las genere — no hay nada que migrar todavía. Se corrigió un llamado erróneo anterior sobre `percentSAR` en la auditoría de Configuración General. La técnica de "verificar conteos de filas de tablas legacy antes de portar" identificó 3 features completamente muertas solo dentro del módulo Tax.

---

## 5. Banks (Bancos) + Little Cash

**Banks**: módulo entero cerrado — 11 pantallas de Proceso (solicitud de cheques, cheques, transferencias, transferencias entre cuentas/afiliadas, depósitos de clientes/varios, retiro de efectivo, depósitos de afiliados, notas débito/crédito) más Reportes (Libro de Bancos, Conciliación Bancaria, Pagos). `bankReports` (una pantalla que existía como scaffold) se eliminó porque nunca existió en el sistema legacy. **Nunca verificado contra navegador real** — solo contra base de datos de prueba (`fc_hiperlimpieza`, desechable).

**Little Cash (Caja Chica)** — construido como módulo separado, últimas 3 pantallas del ERP en cerrarse (Fondos, Recibo, Liquidación). Se corrigieron 2 bugs reales heredados del legacy: un botón "Cerrar" muerto que ahora implementa reembolso real, y un bug de vinculación de comprobantes por rango de fechas. Verificado a nivel de servicio con datos sintéticos, no en browser.

---

## 6. Fixed Assets (Activos Fijos)

Módulo completo: Registro, Depreciación, Asignación, Reportes — reconstruido prácticamente desde cero porque el sistema legacy también lo tenía casi vacío. **Nunca verificado en navegador.** El módulo de **Préstamos** (Loans), que en algún momento estuvo en el menú de Fixed Assets, se sacó definitivamente de alcance por decisión del usuario: se había construido originalmente para un prospecto que nunca cerró el contrato y nadie lo usa — no es un diferido, es descarte permanente.

---

## 7. Hospital Management

Settings (especialidades, especialistas, áreas de ingreso, motivos de admisión, habitaciones), Process (expedientes de pacientes, eventos, hospitalizaciones, citas programadas) y el reporte de Honorarios (primera pantalla del módulo construida ya bajo el patrón `modules/`, con prefijo de privilegio `13` asignado). UI de proveedores-por-servicio construida. `Ajustes Generales` se descartó por estar muerto también en el sistema legacy. **Gap preexistente y no resuelto todavía**: el módulo entero de Hospital no tiene privilegios configurados en ninguna pantalla (cualquier usuario autenticado puede operarlo). Hubo un bug real de vistas cross-schema corregido (10 vistas de `cum_clinic` leían por error de las tablas de `mw_arkitek`) — vale la pena revisar si otras bases de datos de marcas clonadas tienen el mismo problema.

---

## 8. Human Resources (RRHH)

Investigado a fondo por primera vez para este análisis (nunca se había tocado en sesiones previas). **Resultado contrario a la hipótesis inicial de "módulo menos tocado" en cuanto a volumen de funcionalidad**: es uno de los módulos con más código del sistema (317+ archivos de vistas frontend, 221 archivos backend con prefijo `rrhh`), con CRUD real y validaciones en prácticamente todas las pantallas y un motor de cálculo de nómina genuino, no un CRUD disfrazado. Lo que sí está claramente rezagado es la migración arquitectónica y la limpieza de deuda técnica puntual — no ha pasado por el mismo proceso de auditoría que Banks, Fixed Assets o Accounting.

### Settings

| Ítem | Estado | Notas |
|---|---|---|
| Puestos, Horarios, Cálculo de impuesto, Impuesto vecinal, Horas extra, Vacaciones, Tipos de falta, Tipos de deducción, Deducciones por defecto, Tipos de día | Completo | CRUD real en las 10 pantallas activas del menú |
| Áreas | Reutiliza `billing/settings/billingAreas` | No es vista propia |
| **Valores por defecto** (`defaultValues`, oculto del menú) | **Placeholder genuino** | Única pantalla de todo el módulo (de 45+ inventariadas) sin persistencia real: `fnSave` solo hace `setSendForm(true)`, nunca llama a la API |
| **Quincenas** (`biweeklys`, oculto del menú) | Completo pero con bug | CRUD real contra `rrhh/process/byweeklies`; `fnDisableDocument` llama por error al endpoint de `overtimes` (copy-paste), el botón de deshabilitar probablemente falla o afecta el registro equivocado |

### Process

Las 19 pantallas activas del menú (empleados, carné, permisos, ausencias, vacaciones, accidentes, incapacidades, amonestaciones, actas de reunión, constancias de trabajo, proyectos, ingresos, deducciones, planes de pago, resumen de planilla, aguinaldo/décimo tercer mes, décimo cuarto mes, impuesto vecinal sobre planilla, cálculo de prestaciones, pago de prestaciones) están **completas**, con CRUD real. `employees` es la pantalla más elaborada del sistema completo: ~20 archivos, 10 modales (historial, documentos, dependientes, deducciones/bonificaciones, beneficios, proyectos, cambio de salario, cambio de estado, permisos, vacaciones, incapacidades).

Las **7 pantallas ocultas del menú están también completas y funcionales**, no son código muerto:

| Ítem oculto | Estado real |
|---|---|
| Reporte diario (`dailyReport`) | Completo, CRUD real |
| Planilla diaria (`dailyPayroll`) | Completo, CRUD real |
| Séptimo día (`seventhDay`) | Completo, CRUD real |
| Control de asistencia (`attendanceControl`) | Completo, incluye importación desde Excel |
| Planilla de vacaciones (`vacationPayroll`) | Completo, reutiliza el motor unificado de nómina |
| Planilla quincenal (`biweeklyPayroll`) | Completo, con exportación a Excel |
| Deducción quincenal (`deductionBiweekly`) | Completo, CRUD real |

Las 7 tienen ruta React registrada, componente funcional, traducción en `es_ES.js`/`en_US.js` y ruta backend registrada — son accesibles navegando directo a la URL aunque no aparezcan en el sidebar. La lectura más probable: `dailyReport`/`dailyPayroll`/`seventhDay`/`attendanceControl`/`biweeklyPayroll`/`deductionBiweekly` son una **generación anterior** del sistema de nómina, cada una autocontenida; el equipo migró después a un modelo más genérico de "planilla por proyecto con rango de fechas" compartido vía el hook unificado `useResumePayroll.jsx` (parametrizado por `typePayroll` 1-4, usado por resumePayroll/13°/14°/vacationPayroll) y dejó las pantallas antiguas ocultas sin borrarlas — mismo patrón ya documentado para `production`/`start` en `TECH_DEBT.md`.

### Reports

Las 16 pantallas de reportes están completas (entradas/salidas, empleados por cliente, salarios, control de vacaciones/permisos/ausencias/incapacidades, pagos pendientes, altas/bajas de personal, traslados de proyecto, ingresos quincenales, historial de pagos, prestaciones pendientes, cumpleaños del mes). Patrón consistente: un hook define columnas, otro hace el fetch al pulsar "Filtrar".

### Arquitectura backend

100% patrón legacy — **RRHH es el único dominio grande de `mw-back` sin ninguna carpeta en `modules/`**. 63 controllers + ~100 archivos de rutas + ~50 modelos, y solo **1 archivo** en `services/` (`rrhhDeductionDefaultsService.js`) — casi toda la lógica de negocio vive directo en los controllers. Prefijo de rutas `/rrhh/settings|process/...` con 3 excepciones sin prefijo (`/rrhhEmployeeFPs`, `/rrhhEmployeeIO`, `/rrhhSchedules`) y varios typos consistentes entre frontend/backend que funcionan solo porque ambos lados coinciden en el error (`/rrhh/proccess/attendanceControl`, `adminitionDocumentTypes`, `faulTypes`/`faulClassifications`, `setetNeighborhoodTax`).

El cálculo de nómina **sí es real y sustancial**: `controller/rrhhProcessWeeklyPayrolls.js` es el motor central (usado por resumePayroll/13°/14°/vacationPayroll), con 4 funciones de negocio dedicadas en `controller/functions/` (`calculatePayments`, `calculateDetailIncomes`, `calculateDeductions`, `calculateDetailPayroll`): calcula días trabajados, feriados, excluye lunes en diferencias de fecha, actualiza estado de cuotas de préstamos al generar planilla, y genera snapshots de detalle por tipo de ingreso/deducción con su cuenta contable asociada.

No usa Redux — todo el estado vive en hooks locales por pantalla, igual que el resto del sistema.

### Hallazgos puntuales sin corregir (reportados, no arreglados)

- Ruta `/seventhDay` declarada dos veces en `HRProcessRoutes.jsx` (inofensivo).
- Código muerto: rama `typePayroll===1` de `fnGeneratePayroll` en `useResumePayroll.jsx` completamente comentada (reemplazada por `usePrePayroll.js`), no afecta usuarios pero confunde a quien edite el archivo.

---

## 9. Production (Producción)

Revivido desde un estado huérfano (sin ruta activa, imports colgantes a librerías ya removidas) documentado en `TECH_DEBT.md`. **Estado actual: completo y activo**, no un remanente muerto. Settings (clientes — reutiliza el de billing —, encargados, tipos de orden, tipos de producto, destinos, materia prima) y Process (proyectos/órdenes de trabajo con `ModalInvoice`, cargos) tienen vistas reales con hooks propios y modales (`ModalNew`, `ModalStatus`, `ModalAddMaterial`, `ModalViewDetail`). Backend: 10 módulos reales registrados en `AppRoutes.js` bajo prefijo `prod*` (`prodDestinations`, `prodOrderImages`, `prodOrderPayments`, `prodOrderProducts`, `prodOrderTypes`, `prodProducts`, `prodProductTypes`, `prodOrders`, `prodResponsibles`, `prodRMStocks`, `prodSteps`) — 100% patrón legacy, no migrado a `modules/`.

## 10. Dashboards

2 pantallas, ambas implementadas de verdad (no placeholders): **Ventas** (`billingSales`) con hook propio (`useSales.js`, 7 llamadas a API), gráficos Bar/Doughnut/Line/Pie, tarjetas de totales y filtros de fecha; **Catálogo de productos** (`productCatalog`) con modal de detalle. No tienen backend propio — consultan endpoints ya existentes de Billing/Reportes.

## 11. Hotel Management

Frontend completo en las 3 secciones del menú (Settings con 13 sub-pantallas, cada una con su propio hook; Process: reservas, cotizaciones, órdenes de restaurante). Único ítem algo más débil: `restaurantOrders` no tiene hook ni modales dedicados, a diferencia del resto del módulo. **Backend más rico que lo que el frontend expone**: 18 rutas registradas (`HotelBookingChargeRoutes`, `HotelBookingPaymentRoutes`, `HotelQuoteDetailRoutes`, `HotelCalendarBookingRoutes`, `HotelDashboardRoutes`, servicios de habitación, fotos de habitación) — hay un dashboard propio de hotel y un calendario de reservas ya construidos en backend que el menú actual no explota. 100% patrón legacy, no migrado a `modules/`.

## 12. Settings (segundo menú / configuración general)

Completo: Documentos Fiscales, Documentos Internos, Información de la Empresa (con configuración de correo — botón "Correo de Prueba" y fix de seguridad TLS/STARTTLS ya aplicado), Moneda, Tipos de Proveedor, Tipos de Cliente, Intercompañías, Cuentas de Usuario (usuarios + módulos/privilegios). Todas siguen el mismo patrón `Content.jsx` + `Detail.jsx` + hook `useDetailTable.jsx`. Hallazgos menores: una ruta extra `/format` no declarada en `menu.js` (acceso directo sin entrada visible) y una carpeta huérfana `settings/test/` sin ruta registrada (resto de pruebas, inofensivo).

---

# Infraestructura de código

## Frontend (mw-front)

- **Stack**: React 19.1, Vite 8.1.5, Vitest 4.1.10, Redux Toolkit 2.12 + redux-saga (solo para login/logout), `react-router-dom` 7.6.2 (`HashRouter`), `@tanstack/react-table` 8.9.3, `dayjs` 1.11.19, Bootstrap 5.3.8, `formik`, `reactstrap` 9.2.1, `@fullcalendar/*` 6.1.x, `chart.js` 4.5, `xlsx` 0.18.5 (vulnerabilidad conocida sin fix disponible, aislada en un módulo dedicado según `TECH_DEBT.md`).
- **Build multi-marca**: un script npm por marca (`build`, `build:provasa`, `build:hiper`, `build:muna`, `build:arkitek`, `build:cum`), cada uno `vite build --mode <brand> && node post-build.js <brand>`. `post-build.js` y `vps.config.json` están fuera del repo (gitignored, tooling de deploy suministrado aparte) — **no se puede ni se debe compilar localmente**, solo `npm run dev` / `vite preview`.
- **`vite.config.js`**: puerto 3000 con `watch.usePolling` (para filesystems sin inotify), `base: './'` (assets relativos para deploy en subcarpetas), nombres de bundle con hash, los 9 alias con nombre (`@Components`, `@Constants`, `@Containers`, `@Helpers`, `@Hooks`, `@Layouts`, `@Redux`, `@Router`, `@Views`) más el alias genérico `@`→`./src` (sin uso actual), y la config de Vitest inline (`environment: 'jsdom'`, incluye `src/**/*.test.{js,jsx}`).
- Solo `.env` vive en el working tree apuntando a `http://localhost:2001/` (puerto real del backend, no 3001). Los `.env.<brand>` existen en disco local para cada build pero fueron destrackeados de git (antes estaban commiteados pese al `.gitignore`).
- **Testing**: 4 archivos de test reales (`core.test.js`, `DateHelper.test.js`, `Utils.test.js`, `locales.test.js` — este último verifica que `en_US.js`/`es_ES.js` tengan las mismas 2901 claves, evitando desincronización de i18n). Cobertura sigue acotada a helpers puros; no hay tests de componentes, hooks de pantalla, ni de lógica de nómina/impuestos/contabilidad pese a ser un ERP.
- **CI**: único workflow `.github/workflows/ci.yml`, dispara en push/PR a `main`: checkout → Node 20 con cache npm → `npm ci` → `npx vite build` (build simple sin `post-build.js`, que no está en el repo) → `npm test` → `npm run lint` (`continue-on-error: true`, informativo por el backlog de ~7000 hallazgos). Sin deploy automatizado — ese pipeline vive fuera del repo.
- **Redux**: solo 4 dominios globales con `createSlice` (`auth` — el único con saga real, para login/logout —, `menu`, `settings`, `generalData`); los `extraReducers` escuchan los mismos action-type strings de `constants.js` que el saga y las actions viejas usan, por retrocompatibilidad. Todo lo demás (CRUD de pantalla, formularios, listados) vive en hooks locales `useXxx.js`/`useXxx.jsx`.
- **i18n**: `react-intl` 10.1.18, `en_US.js`/`es_ES.js` sincronizados y verificados por test.
- `TECH_DEBT.md` (154 líneas) es prácticamente un log histórico ya resuelto: logout bug, Error Boundary global, introducción de Vitest, aislamiento de `xlsx`, migración Redux Toolkit, refactor de `core.js`, consolidación de librerías duplicadas, refactor de hooks monolíticos, migración Bootstrap 4→5, limpieza de imports `React` no usados (683 archivos), CI básico — casi todo `[x]`.

## Backend (mw-back)

- **Stack**: Node CommonJS (sin ES modules), Express 5.1, Sequelize 6.37 + `mysql2` 3.9, `jsonwebtoken` 9.0.2, `helmet` 8.1, `dayjs` 1.11.13, `pdfmake` 0.2.10 (pinneado deliberadamente — genera facturas y recibos de nómina en producción, el salto a 0.3.x requiere pruebas dedicadas), `exceljs` 4.4, `nodemailer` 10.0.1, `whatsapp-web.js` 1.34.1, `revalidator` 0.3.1 (validación legacy que convive con el `BaseDTO` nuevo), `lodash`.
- **Scripts**: `dev`/`start` ambos `nodemon app.js` (sin diferencia real dev/prod); `test` es un placeholder sin runner real configurado.
- **Pipeline de middlewares en `Server.js`** (orden exacto): `cors()` → `helmet()` → `express.json()` → `express.urlencoded({extended:true})` → `express-fileupload` (50MB, `createParentPath`, `preserveExtension`) → registro de `global.RESPONSES`/`global.messages` (getter sobre `AsyncLocalStorage`, aísla mensajes por request concurrente) → `middleware.messagesContext` → `middleware.validRoute` → `middleware.validQuery` → `compression()` → `AppRoutes` → catch-all `pathNotFound` (sintaxis Express 5 `"/{*splat}"`). HTTPS solo si `SSL_KEY`+`SSL_CERT` están seteados (el `.env` real de este entorno usa por error `SSL_KEY2`/`SSL_CERT2`, así que nunca levanta HTTPS aquí).
- **Migración arquitectónica al patrón `modules/<dominio>/<entidad>/`** (Controller+Service+Routes+DTO) — conteo real de archivos: Inventory 157, Billing 98, Accounting 88, Banks 70, Fixed Assets 14, Tax 13, Admin 4, Hospital 3 → **447 archivos totales**. Patrón legacy suelto: `routes/` 232, `controller/` 240, `services/` 71 (~543 en primer nivel, sin subcarpetas). Es decir, aproximadamente **45% del backend** ya está en el patrón nuevo, pero muy desparejo: Inventory/Billing/Accounting/Banks casi completos, Tax/Fixed Assets parciales, **Admin (usuarios/privilegios) y Hospital apenas arrancados (3-4 archivos)**, y **RRHH sin ninguna carpeta en `modules/`** (0 archivos, 100% legacy pese a ser uno de los dominios más grandes del sistema).
- **Validación de módulos nuevos**: `dtos/BaseDTO.js`, no Zod. `validations/*.js` (a nivel de atributo Sequelize) es patrón legacy exclusivo de los 8 archivos `hosp*` que ya lo usan.
- **Convenciones Sequelize propias**: PK estándar `codigo` (INTEGER autoincrement), no `id`; timestamps en español `create_at`/`update_at` con `underscored: true`.
- **Auth**: JWT firmado en `middlewares/generateToken.js` (`expiresIn: '12h'`) y validado en `middlewares/authentication.js`. Sesión expira a las 12 horas (coincide con el bug conocido de "token expirado → página en blanco sin error"). Privilegios/roles tabla-driven vía Sequelize (`adminUsers`, `adminUsersTypes`, `adminModules`, `adminModulesDetail`, `adminUserModules`, `adminCompanyModules`) — decenas de pantallas de negocio consultan códigos de privilegio tipo `"01.03.010"` contra esas tablas, pero la gestión de usuarios/privilegios en sí sigue mayormente en patrón legacy (`modules/admin/` solo tiene 4 archivos).
- **Multi-tenant real**: no hay selección dinámica de esquema en el código — cada marca es un deploy físicamente separado, con su propio `.env` de conexión (`DB_HOST`/`DB_NAME`/etc.) a una base de datos MySQL distinta (`fc_hiperlimpieza`, `cum_clinic`, `mw_arkitek`, etc., confirmado por memoria de sesiones previas).
- **Patrón de adapters**: `adapters/date.js` envuelve `dayjs` con API mutable estilo moment (`.add()`/`.subtract()` modifican la instancia, usar `.clone()` para copia independiente — reemplaza a `moment`, ya no es dependencia). `adapters/pdf.js` centraliza creación de `PdfPrinter`, resolución de logo y guardado a disco (antes cada archivo duplicaba esta lógica con estado mutable a nivel de módulo compartido entre requests concurrentes — bug de concurrencia ya corregido).
- **i18n backend**: `mw-back/lang/` (`en.js`/`es.js`) alimenta `global.messages` (`MessageCodes()`) para mensajes de error/respuesta, no contenido de negocio.

---

# Deuda técnica y huecos conocidos (consolidado)

1. **RRHH sin migrar a `modules/`** — el dominio más grande del sistema en patrón legacy puro. Candidato natural para la próxima ronda de migración arquitectónica, con la ventaja de que la funcionalidad de negocio ya existe y solo falta reestructurar.
2. **Banks y Fixed Assets nunca verificados en navegador real** — solo contra base de datos/servicio. Antes de darlos por "cerrados" en producción conviene una pasada de verificación visual.
3. **RRHH: 7 pantallas completas pero ocultas del menú** (dailyReport, dailyPayroll, seventhDay, attendanceControl, vacationPayroll, biweeklyPayroll, deductionBiweekly) — decisión pendiente: ¿reactivarlas en el menú, o confirmar que quedaron obsoletas por el motor unificado y limpiarlas del código?
4. **RRHH: `defaultValues` es un placeholder sin persistencia** y **`biweeklys` tiene un endpoint copy-pasteado mal** (`fnDisableDocument` apunta a `overtimes` en vez de `byweeklies`).
5. **Hospital sin privilegios en ninguna pantalla** — gap de seguridad, no de funcionalidad.
6. **Guía de Remisión fiscal** no existe como documento real todavía en ningún módulo.
7. **Compras (Inventory) en pausa**: Admin/Condiciones de Pago/Distribución de Anticipos esperan a que existan los módulos de Contabilidad/Bancos que necesitan (ya existen ambos — vale la pena retomar).
8. **Centros de Costo (Accounting)** diferido a "fin de toda la migración ERP" — con el resto de módulos ya cerrados, este podría ser el próximo candidato natural.
9. **Multi-moneda** confirmado como gap a nivel de sistema completo, no específico de ninguna pantalla.
10. **Validación de período abierto/cerrado** — feature futura, explícitamente sin restricción todavía en ningún módulo de documentos.
11. **Backend de Hotel expone más de lo que el frontend usa** (dashboard propio, calendario de reservas, fotos/servicios de habitación) — oportunidad de exponer feature ya construida sin trabajo de backend adicional.
12. **Cobertura de tests** limitada a helpers puros — nada de lógica de nómina, impuestos o contabilidad tiene test automatizado pese a ser el corazón del ERP.
13. **`npm run lint`** con ~7000 hallazgos pre-existentes en frontend (mayormente imports `React` residuales), no bloqueante en CI.
