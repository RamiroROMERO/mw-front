# Plan de Acción — Multiwork 2.0 hacia ERP/CRM completo

Sep 28, 2026 · @Ramiro

## Punto de partida y principios

Multiwork 2.0 es hoy un sistema transaccional completo (12 módulos con CRUD real, \~45% del backend ya en `modules/`) sin capa de decisión: 2 dashboards de solo lectura, sin CRM, sin alertas, sin motor de reportes ni auditoría. Este plan lo lleva a ERP/CRM en 5 fases, cada una con un criterio de cierre verificable.

**Diagnóstico en tres líneas**

- Registro: sólido. Facturación, inventario, contabilidad, bancos y nómina calculan y persisten con lógica de negocio real.
- Análisis: casi nulo. Los reportes son listados exportables; nadie ve tendencias, márgenes, aging o rotación sin armarlo a mano en Excel.
- Relación con el cliente: no existe. El cliente es un maestro de facturación; no hay prospectos, pipeline, gestiones de cobro ni historial comercial.

**Principios rectores**

1. Arquitectura antes que funcionalidad: nada nuevo se escribe en el patrón legacy (`routes/`, `controller/`, `services/` sueltos). Todo módulo nuevo nace en `modules/<dominio>/<entidad>/` con Controller + Service + Routes + DTO.
2. Strangler, no big bang: se migra dominio por dominio manteniendo las rutas actuales funcionando; el frontend cambia solo cuando el backend ya está migrado.
3. Eventos de dominio como columna vertebral: `invoice.created`, `payment.received`, `employee.hired`, `stock.below_min`. Auditoría, notificaciones, analítica y CRM se alimentan de ellos, no de consultas cruzadas a tablas transaccionales.
4. Cada fase entrega algo visible para el usuario final, aunque la Fase 0 sea casi toda interna.
5. Nada se declara cerrado sin verificación en navegador con datos reales (lección de Banks y Fixed Assets).
6. Tests automatizados sobre todo lo que mueve dinero o calcula sueldos antes de tocarlo.

**Supuestos**

- El tamaño del equipo no está definido, así que el plan no lleva fechas: cada bloque tiene un peso relativo (S, M, L, XL) y dependencias explícitas.
- Contexto fiscal Honduras (SAR, CAI, ISV, retenciones ISR, IHSS/RAP) como referencia para Tax y RRHH.
- Las 6 marcas siguen como despliegues separados; el multi-tenant en runtime se decide en Fase 4, no antes.
- Stack actual se conserva (React 19 + Vite, Express 5 + Sequelize + MySQL); no hay reescritura.
- Producción y Hotel quedan fuera del alcance de este plan por ahora: se conservan como están (patrón legacy, sin cambios) y se retoman cuando se decida. El plan cubre los otros 10 módulos.

## Fase 0 — Fundaciones de arquitectura

Objetivo: un solo patrón en el 100% del backend y la infraestructura transversal (eventos, auditoría, periodos, permisos declarativos, multimoneda base) sobre la que se construyen las Fases 1 a 3. Sin funcionalidad nueva para el usuario, salvo correcciones de bugs conocidos. Criterio de cierre: 0 archivos sueltos, salvo Producción y Hotel que quedan fuera de alcance, en `routes/`, `controller/` y `services/`; CI verde con tests de negocio; Banks, Fixed Assets y Caja Chica verificados en navegador.

### 0.1 Cerrar la migración a `modules/`

Orden por riesgo y por lo que desbloquea después. Cada dominio migrado instrumenta sus eventos de dominio (0.2) en la misma pasada.

| Dominio | Pendiente | Peso | Notas |
| --- | --- | --- | --- |
| RRHH | 100%: 63 controllers, \~100 rutas, \~50 modelos, 1 service | XL | Extraer el motor de nómina (`rrhhProcessWeeklyPayrolls` + `controller/functions/*`) a services puros y testeables antes de mover rutas. Mantener alias de las rutas con typos (`proccess`, `faulTypes`, `setetNeighborhoodTax`) hasta que el front apunte a las nuevas. |
| Hospital | Casi todo (3 archivos migrados) | L | Asignar privilegios prefijo `13` a todas las pantallas en la misma pasada (gap de seguridad). Revisar vistas cross-schema en cada marca clonada. |
| Admin (usuarios/privilegios) | Casi todo (4 archivos) | M | Prerrequisito de los permisos declarativos de 0.2. |
| Inventory | 10 procesos de Procesos/Reportes | M | Patrón ya establecido; trabajo mecánico. |
| Tax y Fixed Assets | Parcial | S | Completar lo que falta. |

### 0.2 Núcleo transversal (nuevo, sobre `modules/`)

- **Bus de eventos de dominio**: `EventEmitter` interno con catálogo tipado de eventos (`invoice.created`, `payment.received`, `purchase.received`, `payroll.generated`, `employee.hired`, `stock.moved`). Todo service migrado emite; Fases 1 y 2 consumen. Se cambia a cola (BullMQ + Redis) en Fase 4 sin tocar productores.
- **Auditoría**: tabla `audit_log` (usuario, entidad, acción, antes/después, IP, fecha) alimentada por hooks de Sequelize y por eventos. Hoy no existe rastro de quién anuló una factura o cambió un salario.
- **Periodos contables**: tabla de periodos abiertos/cerrados y un middleware que bloquea crear, editar o anular documentos en periodo cerrado (gap #10 del análisis).
- **Permisos declarativos**: middleware `requirePrivilege('01.03.010')` en cada ruta, reemplazando las decenas de consultas ad hoc por pantalla. Prepara roles/perfiles (Fase 3, Admin).
- **Numeración centralizada**: un `SequenceService` para CAI y correlativos internos; hoy cada documento resuelve el suyo.
- **Multimoneda base**: tabla de tipos de cambio por fecha, campos `moneda` y `tipo_cambio` en cabeceras de documentos, importes en moneda local siempre persistidos. Solo el cimiento; la UI llega en Fase 3.
- **Validación única**: `BaseDTO` para todo; retirar `revalidator` y `validations/*.js` al migrar Hospital.

### 0.3 Seguridad y sesión

- Refresh token con renovación silenciosa e interceptor 401 en el frontend que redirige a login: elimina el bug de "token expirado → página en blanco".
- Rate limit en `/auth`, bloqueo por intentos fallidos, política de contraseñas, 2FA opcional por usuario.
- Corregir `SSL_KEY2`/`SSL_CERT2` en `.env`; separar `dev` (nodemon) de `start` (node + pm2); secretos solo por variables de entorno.

### 0.4 Calidad, CI y datos

- Runner de tests en backend (Vitest, para compartir tooling con el front) y primeros tests sobre: motor de nómina (`calculatePayments`, `calculateDeductions`), fórmula `getCurrentCxC`/`getCurrentCxP`, kardex y costo promedio, conciliación de cierre de caja POS, partidas contables balanceadas.
- Frontend: tests de hooks críticos (`useResumePayroll`, checkout, cierre de caja).
- Lint: codemod para los \~7000 hallazgos (imports `React` residuales) y volverlo bloqueante en CI.
- Migraciones de esquema versionadas (`umzug` o `sequelize-cli`): hoy las 6 bases de datos divergen y nadie sabe en qué versión está cada una (síntoma: vistas de `cum_clinic` apuntando a `mw_arkitek`).
- Verificación en navegador con datos reales de Banks (11 pantallas + reportes), Fixed Assets y Caja Chica.

### 0.5 Deuda puntual (checklist)

- [ ] `biweeklys`: `fnDisableDocument` apunta a `overtimes` en vez de `byweeklies`.
- [ ] `defaultValues` (RRHH): implementar persistencia o eliminar la pantalla.
- [ ] Decidir las 7 pantallas ocultas de RRHH: reactivar en el menú o borrar (recomendación: borrar las 6 de la generación anterior, conservar `attendanceControl` y su importación Excel).
- [ ] Ruta `/seventhDay` duplicada; código muerto `typePayroll===1` en `useResumePayroll.jsx`.
- [ ] Ruta `/format` sin entrada en `menu.js`; carpeta `settings/test/` huérfana.
- [ ] Actualizar `pdfmake` 0.2 → 0.3 con suite de pruebas de PDF (facturas, recibos de nómina).

## Fase 1 — Capa de análisis e inteligencia

Objetivo: convertir el registro en información. Cada módulo obtiene indicadores, un dashboard por rol, reportes parametrizables y alertas automáticas. Depende del bus de eventos y del modelo analítico; es la fase que responde directamente al diagnóstico de "sistema de registro". Criterio de cierre: cada módulo tiene al menos un dashboard alimentado por el modelo analítico, el dashboard ejecutivo consolida los 10 módulos en alcance, y las 5 alertas críticas están activas.

### 1.1 Modelo analítico (peso L)

- Esquema `analytics` separado con tablas de hechos: `ventas_diarias`, `margen_por_producto`, `cxc_aging`, `cxp_aging`, `movimientos_inventario`, `costo_nomina`, `flujo_caja`.
- Carga incremental por eventos de dominio más un job nocturno de reconciliación contra las tablas transaccionales.
- Regla: ningún dashboard consulta tablas transaccionales; evita que un reporte de 8x fan-out (como el corregido en Billing) tumbe el sistema en horario de ventas.

### 1.2 Motor de reportes (peso M)

- `ReportService` declarativo: fuente, filtros, agrupaciones, pivote, columnas, formato. Reutiliza el pivote de ReactTable y `exportPDFExternal`/`exportPDFInternal` ya existentes.
- Reportes guardados por usuario (filtros favoritos) y programados (envío por correo cada lunes, cada cierre de mes).
- Reemplaza gradualmente las 19 variantes de "Otros Reportes" y los 16 reportes de RRHH por definiciones declarativas, sin reescribir sus consultas.

### 1.3 Framework de dashboards en frontend (peso M)

- `DashboardPage` con widgets configurables por JSON: `KpiCard` (valor, variación vs periodo anterior, tendencia), `TrendChart`, `RankTable`, `AlertList`, `GaugeCard`.
- Configuración por rol: el dueño ve el ejecutivo, el jefe de bodega ve inventario, el vendedor ve su propio panel.
- `chart.js` ya está en el stack; no se agrega librería.

### 1.4 Indicadores por módulo

| Módulo | Indicadores |
| --- | --- |
| Billing | Ventas del día/mes vs periodo anterior, ticket promedio, margen bruto por producto/cliente/vendedor, top 10 productos y clientes, ventas por caja y área, cumplimiento de meta |
| Inventory | Rotación y días de inventario, productos bajo mínimo, productos sin movimiento en 90 días, valor del inventario por almacén, compras por proveedor, variación de precio de compra |
| Accounting | Estado de resultados mensual comparativo, presupuesto vs real por cuenta, aging de CxC y CxP, DSO y DPO |
| Tax | ISV por pagar del mes, retenciones acumuladas, calendario fiscal con próximas obligaciones |
| Banks y Caja Chica | Saldos consolidados por banco, cheques en circulación, flujo de caja proyectado a 30/60/90 días, gastos de caja chica por rubro |
| Fixed Assets | Valor neto en libros, depreciación del mes, activos por área y responsable, próximos mantenimientos |
| RRHH | Headcount, rotación, ausentismo, costo de planilla por proyecto, horas extra, vacaciones acumuladas, contratos y permisos por vencer |
| Hospital | Ocupación de camas, citas por especialista, honorarios del mes, estancia promedio |

### 1.5 Alertas y notificaciones (peso M)

- Motor de reglas: evento o umbral → notificación in-app, correo o WhatsApp (`nodemailer` y `whatsapp-web.js` ya existen).
- Centro de notificaciones en el header del sistema con historial y marcado como leído.
- Las 5 críticas para arrancar: stock bajo mínimo, factura de cliente vencida, cheque emitido por vencer, CAI por agotarse o vencer, presupuesto de cuenta excedido. Luego: contrato de empleado por vencer, cumpleaños, cita médica del día.

### 1.6 Dashboards a entregar

1. Ejecutivo (dueño/gerencia): ventas, margen, caja, CxC, CxP, planilla en una pantalla.
2. Uno por módulo con los indicadores de 1.4; reemplazan los 2 dashboards actuales.
3. "Mi día" por usuario: pendientes, alertas asignadas, aprobaciones (cuando exista el motor de workflows).

## Fase 2 — CRM

Objetivo: cubrir el ciclo comercial completo antes y después de la venta. Hoy el cliente entra al sistema cuando ya se le factura; el CRM se construye como dominio nuevo `modules/crm/` integrado con Cotizaciones, Facturas y CxC existentes, no como módulo aislado. Criterio de cierre: un vendedor gestiona su pipeline y un cobrador su cartera sin salir del sistema ni usar Excel.

### 2.1 Modelo de datos (peso M)

- `Contactos`: varios por cliente, con cargo, teléfono, correo, canal preferido.
- `Prospectos`: origen (referido, web, campaña, visita), estado, responsable; conversión a Cliente reutiliza el maestro de Billing.
- `Oportunidades`: etapa, monto estimado, probabilidad, fecha esperada de cierre, vendedor, motivo de pérdida.
- `Actividades`: llamada, reunión, tarea, nota, correo; vinculadas a prospecto, cliente u oportunidad; con recordatorio.
- `Campañas` y `Segmentos`: criterios guardados sobre el maestro de clientes (zona, tipo, volumen, antigüedad, morosidad).

### 2.2 Pipeline comercial (peso M)

- Tablero kanban por etapas configurables por empresa (Contacto → Calificado → Cotizado → Negociación → Ganado/Perdido).
- Oportunidad → Cotización (pantalla existente) → Factura, con trazabilidad en ambas direcciones y cierre automático de la oportunidad al facturar (evento `invoice.created`).
- Embudo de conversión y tiempo por etapa en el dashboard de ventas (Fase 1).

### 2.3 Vista 360 del cliente (peso M)

Una sola pantalla que reúne lo que ya existe disperso: datos generales, contactos, oportunidades abiertas, cotizaciones, facturas, pagos, saldo y aging, notas de crédito, tickets y actividades. Es la pantalla de mayor valor por menor esfuerzo de toda la fase: casi todo es lectura de tablas actuales.

### 2.4 Cobranza gestionada (peso M)

- Gestiones de cobro sobre cada documento de CxC: llamada, visita, promesa de pago con fecha, resultado.
- Recordatorios automáticos por correo y WhatsApp a N días antes y después del vencimiento, con plantillas por empresa.
- Estado de cuenta enviado por correo desde la pantalla, ranking de morosidad y cartera asignada por cobrador.

### 2.5 Post-venta (peso M)

- Tickets o casos de soporte con prioridad, responsable, SLA y estado; vinculados a factura o producto (garantías).
- Encuesta de satisfacción corta enviada tras la factura o el cierre del ticket.

### 2.6 Fuerza de ventas (peso S)

- Metas mensuales por vendedor y comisiones calculadas sobre facturación cobrada (el campo `vend_code` ya existe en documentos).
- Agenda del vendedor alimentada por actividades; versión móvil en Fase 4.

### 2.7 Marketing (peso S)

- Campañas de correo y WhatsApp masivo por segmento, con seguimiento de respuesta.
- Para volumen, evaluar la API oficial de WhatsApp Business: `whatsapp-web.js` sirve para notificaciones, no para envíos masivos sin riesgo de bloqueo.

## Fase 3 — Profundización por módulo

Objetivo: cerrar los diferidos conocidos y agregar lo que le falta a cada módulo para operar como ERP completo, no solo como registro. Los bloques de esta fase son independientes entre sí y pueden repartirse en paralelo con la Fase 2; el orden sugerido dentro de la fase prioriza lo que desbloquea a otros módulos (Centros de Costo, Compras, motor de aprobaciones). Criterio de cierre: cada módulo verificado en navegador con su checklist cerrado.

### 3.0 Transversal: motor de aprobaciones (peso M)

Flujo genérico solicitud → aprobador(es) → aprobado/rechazado con notificación, aplicable a: solicitud de cheque, orden de compra sobre monto, permiso o vacaciones de empleado, descuento fuera de política, ajuste de inventario. Se construye una vez y lo usan Banks, Inventory, RRHH y Billing; va primero en la fase porque varios bloques de abajo lo requieren.

### Billing

- Terminar el 8–10% restante de POS y verificar cierre de caja en varias cajas simultáneas.
- Guía de Remisión fiscal como documento real (gap #6), con numeración SAR y vínculo a factura o traslado.
- Multimoneda en pantalla: cotizar y facturar en USD con tipo de cambio del día (cimiento de Fase 0).
- Listas de precios por cliente o segmento, descuentos por volumen y promociones con vigencia.
- Facturación recurrente por contrato (mensualidades, alquileres, servicios) y anticipos o apartados de clientes.
- Link de pago y pasarela para tarjeta; preparación para facturación electrónica SAR cuando se exija.

### Inventory

- Retomar Compras: Admin, Condiciones de Pago y Distribución de Anticipos; sus dependencias (Contabilidad, Bancos) ya existen (gap #7).
- Mínimos y máximos por producto y almacén con sugerencia automática de reorden que genera la Orden de Compra.
- Lotes con fecha de vencimiento y alerta anticipada; códigos de barras (lectura en POS y bodega, impresión de etiquetas).
- Conteos físicos cíclicos con hoja de conteo y ajuste automático aprobado (usa 3.0).
- Cerrar stubs: Transferencia intercompañía y formulario Productor (café), o descartarlos explícitamente; Códigos y Precios Asegurados diferidos.
- Reporte de márgenes por producto y verificación del método de costeo (promedio ponderado vs PEPS) con test automatizado.

### Accounting

- Centros de Costo (gap #8): va primero en la fase porque RRHH (costo por proyecto), Producción (costo por orden) y presupuestos dependen de él.
- Cierre de periodo y cierre anual con asientos automáticos (resultado del ejercicio, reclasificaciones).
- Flujo de efectivo (método directo e indirecto) y presupuesto por centro de costo.
- Consolidación intercompañía entre marcas y conciliación automática de cuentas puente.
- Las 2 satélites de CxP diferidas (`cont_cxphistory_residue`, `cont_cxp_advances`).

### Tax

- Generación de declaraciones en formato SAR: ISV mensual, retenciones ISR, pagos a cuenta; con borrador revisable antes de exportar.
- Constancias de retención por proveedor y calendario fiscal con alertas (Fase 1).
- Notas de Débito a Proveedores solo cuando exista una pantalla de proceso que las genere.

### Banks y Caja Chica

- Conciliación automática: importar estado de cuenta (CSV/Excel del banco) y emparejar por monto, fecha y referencia; dejar solo las excepciones al usuario.
- Proyección de flujo de caja combinando CxC, CxP, planilla y cheques emitidos.
- Aprobación de solicitudes de cheque y transferencias vía 3.0; pagos masivos (planilla, proveedores) exportando el archivo que pide cada banco.
- Caja chica: límite por fondo, arqueo con diferencia registrada y responsable.

### Fixed Assets

- Verificación en navegador antes de cualquier feature nueva.
- Depreciación mensual automática como asiento contable (hoy es cálculo, no partida).
- Revaluación y deterioro, bajas y ventas con partida y efecto fiscal.
- Mantenimiento programado por activo e inventario físico con etiqueta QR.

### RRHH

- Después de la migración de Fase 0. Primero, verificar cálculos legales vigentes en Honduras (IHSS, RAP, ISR, vacaciones, décimo tercero y cuarto) con tests.
- Portal del empleado: boletas de pago, solicitud de vacaciones y permisos (usa 3.0), constancias de trabajo autoservicio.
- Asistencia por biométrico o API en lugar de importar Excel; integración directa a planilla.
- Reclutamiento como pipeline (misma mecánica que CRM: vacante → candidatos → etapas), evaluación de desempeño, capacitaciones y certificaciones con vencimiento, organigrama.
- Costo de planilla por centro de costo (requiere Accounting) y `defaultValues` real.

### Hospital

- Privilegios (Fase 0). Facturación de servicios, honorarios y farmacia integrada con Billing e Inventory en vez de circuitos propios.
- Historia clínica estructurada por evento, agenda por especialista con recordatorio al paciente (WhatsApp).
- Dashboard de ocupación y honorarios (Fase 1).

### Settings y Admin

- Roles o perfiles en vez de privilegios asignados usuario por usuario; herencia y copia de perfil.
- Pantalla de auditoría (quién hizo qué) sobre `audit_log` de Fase 0.
- Plantillas de documentos PDF editables por empresa (logo, textos legales, campos) sin tocar código.

## Fase 4 — Plataforma y escala

Objetivo: que el sistema salga de la pantalla (API, móvil, integraciones) y opere con confianza en producción (observabilidad, rendimiento, respaldos). Ningún bloque aquí bloquea a las fases anteriores; es donde el producto pasa de ERP interno a plataforma. Criterio de cierre: API pública documentada en uso por al menos una integración, app móvil en manos de vendedores, y monitoreo con alertas de error en producción.

| Bloque | Qué incluye | Peso | Depende de |
| --- | --- | --- | --- |
| API pública y webhooks | OpenAPI generado desde los DTOs de `modules/`; tokens por integración con alcance; webhooks emitidos desde el bus de eventos | M | Fase 0 (DTOs, eventos) |
| Cola de trabajos | BullMQ + Redis para PDFs masivos, correos, WhatsApp, carga analítica; reemplaza al `EventEmitter` interno sin tocar productores | S | Fase 0 |
| Integraciones externas | Estados de cuenta bancarios, SAR (facturación electrónica cuando se exija), pasarelas de pago, e-commerce (WooCommerce/Shopify) | L | API pública |
| App móvil (PWA primero) | Vendedores (pipeline, cotizar, cobrar), POS ligero, portal del empleado, aprobaciones desde el celular | L | Fases 2 y 3.0 |
| Observabilidad | Logs estructurados (`pino`), Sentry para errores front y back, métricas de latencia por endpoint, health checks, respaldos automáticos verificados con restauración de prueba | S | — |
| Rendimiento | Índices sobre consultas de kardex y saldos, paginación server-side en todos los listados, cache Redis para analítica, revisión de N+1 en Sequelize | M | Fase 1 |
| Multi-empresa | Decisión: mantener despliegues separados por marca pero con un esquema único versionado (migraciones de Fase 0); pasar a `company_id` en runtime solo si se vende como SaaS | XL si se hace | Fase 0 (migraciones) |

Sobre multi-empresa: hoy las 6 bases de datos divergen y eso ya produjo un bug real (vistas de `cum_clinic` leyendo `mw_arkitek`). El esquema único versionado resuelve el 80% del dolor sin el costo de un multi-tenant en runtime; la decisión de ir más allá es de negocio, no técnica.

## Secuencia recomendada, quick wins y riesgos

La secuencia es 0 → 1 → 2 → 3 → 4 con una compuerta de salida por fase. Las Fases 2 y 3 pueden correr en paralelo una vez que la Fase 1 tiene el modelo analítico, y la Fase 4 se solapa con el final de la 3.

&#91;embedded content: roadmap · 5 fases, 4 compuertas de salida\]

La Fase 0 es la única que no se negocia: cada bloque de las siguientes depende de eventos, auditoría, permisos declarativos o del código ya migrado. Las compuertas son criterios verificables, no fechas.

**Quick wins (para arrancar de inmediato, en patrón `modules/`)**

- Interceptor 401 y refresh token: elimina el bug de página en blanco a las 12 horas.
- Privilegios en Hospital y corrección de `biweeklys`, `SSL_KEY2` y `/seventhDay` duplicado.
- Exponer en el menú el dashboard y el calendario de Hotel que ya existen en backend.
- Vista 360 del cliente en modo lectura: solo reúne tablas existentes y es el adelanto más tangible del CRM.
- Alertas de stock mínimo y facturas vencidas por correo con un cron simple, antes del motor de reglas.
- Verificación en navegador de Banks y Fixed Assets.

**Riesgos y mitigación**

| Riesgo | Mitigación |
| --- | --- |
| La migración de RRHH rompe la nómina en producción | Tests del motor antes de mover nada; correr planilla vieja y nueva en paralelo un ciclo completo y comparar resultado por empleado |
| El modelo analítico diverge de lo transaccional | Job nocturno de reconciliación con alerta cuando la diferencia supere un umbral |
| La Fase 0 se eterniza sin valor visible | Compuerta con criterios numéricos y quick wins en paralelo desde la primera semana |
| Equipo pequeño repartido en 5 fases | Una fase activa a la vez (salvo 2 y 3); límite de trabajo en curso por persona |
| Bases de datos divergentes por marca | Migraciones versionadas antes de cualquier cambio de esquema; auditar vistas cross-schema en las 6 |
| WhatsApp masivo bloquea el número de la empresa | API oficial de WhatsApp Business para campañas; `whatsapp-web.js` solo para notificaciones |
| `pdfmake` 0.2 y `xlsx` 0.18 acumulan deuda de seguridad | Suite de regresión de PDFs y Excel en Fase 0; actualizar con esa red de seguridad |
