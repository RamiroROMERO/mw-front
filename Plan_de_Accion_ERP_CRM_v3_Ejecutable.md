# Plan de Acción Ejecutable — Multiwork 2.0 (v3, condensado)

**Fecha:** 28 Sep 2026
**Reemplaza:** la secuenciación de `Plan_de_Accion_ERP_CRM_v2.md` (Fases 0–14 + Tracks A/B/C + Prioridades P0–P4). El v2 se mantiene como catálogo de referencia de capacidades a largo plazo; este documento es el que se ejecuta.

---

## 0. Decisiones de alcance (respuestas del 28 Sep 2026)

| # | Decisión | Respuesta |
|---|---|---|
| 1 | Modelo comercial/técnico | Instalaciones separadas por marca (actual). **Sin SaaS multi-tenant.** |
| 2 | Producción | Vertical secundario, no core. Sin inversión en MRP/demand planning. |
| 3 | Hotel | En pausa. No se toca hasta nueva decisión. |
| 4 | Hospital | Vertical propio, con roadmap y prioridades independientes del ERP core. |
| 5 | Facturación electrónica SAR | **Prioridad inmediata.** |
| 6 | Configuración sin código | Mínimo. No se invierte en plataforma de extensibilidad. |
| 7 | Consolidación de grupo | No se necesita. Instalaciones independientes entre sí. |
| 8 | Motor de aprobaciones/workflow | Prioridad media. No es bloqueante hoy. |
| 9 | Almacenamiento documental | Google Drive / servicio de terceros (no DMS propio). |
| 10 | Backups / RPO-RTO | No existe hoy. Se define desde cero. |
| 11 | WhatsApp Business API | Deseable, no urgente. |
| 12 | Centros de costo / proyectos | Se necesitan en **todas las marcas**. |
| 13 | Bancos a integrar primero | Ficohsa, BAC, Atlántida. |
| 14 | Pasarela de pagos | Ninguna empresa la usa hoy. **Fuera de alcance.** |
| 15 | Roles estándar | RBAC con roles base + activación granular de funcionalidades por usuario específico (formalizar lo que ya existe vía `adminModules`/`adminUserModules`, no rediseñar desde cero). |
| 16 | Procesos con doble aprobación | Aún no identificados. No construir motor de aprobación multinivel complejo todavía. |

---

## 1. Por qué una sola secuencia (y no Fases + Tracks + Prioridades)

El v2 tenía tres esquemas de orden de ejecución sin mapeo entre sí (Fases 0–14, Tracks A/B/C, Prioridades P0–P4). Este documento define **una sola lista de etapas**, cada una con entregable y compuerta de salida (gate) explícitos. No se avanza a la etapa N+1 sin cerrar el gate de la etapa N, salvo excepción justificada por escrito.

---

## 2. Etapa 0 — Blindar lo que ya existe (nueva; no estaba en el v2 como etapa explícita)

**Por qué esta etapa es primero:** según `ANALISIS_FUNCIONALIDADES.md`, varios módulos declarados "completos" y clasificados como Nivel A (nunca romper) nunca se verificaron en navegador real ni tienen tests automatizados: Banks, Fixed Assets, y todo RRHH (motor de nómina real y sustancial, 0 archivos en `modules/`, sin tests). Construir CRM, compliance fiscal y automatización encima de eso sin verificarlo primero es el riesgo más alto del plan.

**Entregables:**
- Verificación en navegador real de Banks (11 pantallas de Proceso + Reportes) y Fixed Assets (Register/Depreciation/Assign/Reports).
- Fix de los 2 bugs puntuales ya identificados en RRHH: `defaultValues` (placeholder sin persistencia) y `biweeklys` (`fnDisableDocument` apunta al endpoint equivocado).
- Tests unitarios/integración para el motor de nómina de RRHH (`calculatePayments`, `calculateDetailIncomes`, `calculateDeductions`, `calculateDetailPayroll`), facturación (CAI/kardex/CxC), contabilidad (fórmula CxC/CxP) e impuestos — hoy la cobertura de tests son solo helpers puros (`DateHelper`, `Utils`, `core`, `locales`).
- Definir y documentar política de backups: RPO/RTO, retención, backup off-site, cifrado, calendario de restore test. No existe nada de esto hoy — es deuda real, no un "nice to have" de la sección 15.2 del v2.
- Decisión pendiente sobre las 7 pantallas ocultas de RRHH (dailyReport, dailyPayroll, seventhDay, attendanceControl, vacationPayroll, biweeklyPayroll, deductionBiweekly): reactivar en menú o retirar del código.

**Gate de salida:** Nivel A completo (nómina, facturación, contabilidad, impuestos, inventario, caja, bancos, CxC/CxP) verificado en browser + con tests que cubran el cálculo crítico, y política de backup documentada y probada al menos una vez (restore test real).

---

## 3. Etapa 1 — Fundaciones transversales mínimas (recorte del Fase 0 del v2)

Se toma del v2 solo lo que las decisiones de alcance justifican ahora; se deja fuera MDM completo, workflow engine complejo y numeración avanzada (contingencia, reimpresiones) hasta que haya un caso de uso real.

**Entregables:**
- **RBAC formalizado** (decisión #15): UI y backend para definir roles con funcionalidades base + activación granular por usuario específico, sobre las tablas ya existentes (`adminUsers`, `adminModules`, `adminUserModules`, `adminCompanyModules`). No es un rediseño — es exponer y ordenar lo que ya está.
- **Centros de costo y proyectos activados para todas las marcas** (decisión #12): esto era "diferido a fin de migración" en el análisis funcional; con el core financiero ya cerrado, es el momento.
- Auditoría empresarial básica: timeline de entidad, antes/después, usuario, documento relacionado — sobre lo que ya existe en `audit_log`, sin sobre-construir.
- Periodos y cierres: extender el control existente (contable/fiscal) a inventario y caja donde falte. Validación de período abierto/cerrado sigue **fuera de alcance** (ya era una decisión explícita previa, confirmada en memoria del proyecto).

**Gate de salida:** roles configurables end-to-end probados con al menos 2 usuarios reales de distinto perfil; centros de costo operativos en Accounting para las 6 marcas.

---

## 4. Etapa 2 — Facturación electrónica SAR (prioridad inmediata, decisión #5)

Esta etapa se adelanta respecto al v2 (que la trataba como un ítem más de compliance en la Fase 12) porque la respuesta de negocio fue "prioridad inmediata".

**Entregables:**
- Integración real con SAR: generación, firma/validación y envío de documentos fiscales electrónicos.
- Adaptar el ciclo de vida documental existente (CAI, numeración) al nuevo requisito electrónico sin duplicar lógica entre el documento físico/actual y el electrónico.
- Revisar en esta misma etapa el estado de **Guía de Remisión fiscal** (memoria del proyecto: no existe como documento fiscal real en ningún lugar del sistema) — ya que "la migración completa" es prácticamente el estado actual, este es el momento de decidir si entra aquí o se descarta.

**Gate de salida:** al menos un documento fiscal electrónico real (o en sandbox de SAR si aún no hay ambiente productivo) generado, firmado y validado end-to-end, con trazabilidad completa.

---

## 5. Etapa 3 — Cerrar el ERP financiero core

Retoma trabajo específico que ya estaba en pausa según memoria del proyecto, ahora que sus bloqueantes (Contabilidad, Bancos) están resueltos.

**Entregables:**
- Compras (Inventory): retomar Admin / Condiciones de Pago / Distribución de Anticipos — estaban diferidos exactamente porque necesitaban Contabilidad y Bancos, que ya están cerrados.
- Tesorería: conciliación bancaria real con **Ficohsa, BAC, Atlántida** (decisión #13) — sin generalizar a un framework de "cualquier banco" todavía, solo estos tres.
- Multi-moneda: confirmado en el análisis como gap de sistema completo, no de una pantalla — evaluar aquí si algún proceso de esta etapa lo requiere de forma bloqueante; si no, se deja para más adelante.

**Gate de salida:** conciliación bancaria funcionando con los 3 bancos reales, ciclo de compras completo sin pasos manuales pendientes.

---

## 6. Etapa 4 — CRM 360 básico (recorte fuerte del v2)

Del catálogo amplio de CRM del v2 (Fase 2 completa: leads, CPQ, contratos, portales, marketing con WhatsApp/journeys) se toma solo lo que tiene valor inmediato sin las piezas que las decisiones descartaron.

**Entregables:**
- Vista 360 de cliente (quick win ya identificado en el v2, sección 27).
- Pipeline de ventas básico (etapas, probabilidad, forecast simple).
- Cobranza asistida sobre CxC ya existente (alertas de vencimiento, no un motor de reglas completo).

**Explícitamente fuera de esta etapa:**
- CPQ/pricing avanzado, portales de cliente/proveedor, marketing/journeys — no hay caso de uso identificado (no hay pasarela de pagos, no hay canal WhatsApp activo todavía).

**Gate de salida:** un ciclo CRM→factura completo (oportunidad → cotización → factura → cobro) trazable de punta a punta para al menos un cliente real.

---

## 7. Etapa 5 — RRHH: migración arquitectónica a `modules/`

Se hace **después** de la Etapa 0 (que ya le dio tests) precisamente para migrar con red de seguridad. RRHH es el dominio grande más grande en patrón legacy puro (63 controllers, ~100 rutas, 0 archivos en `modules/`).

**Entregables:**
- Migrar el motor de nómina (`rrhhProcessWeeklyPayrolls.js` y las 4 funciones de `controller/functions/`) a `modules/hr/payroll/` con Service/DTO, corriendo en paralelo con el legacy hasta validar resultados idénticos (paralelo legacy/nuevo, como ya se hizo en otros módulos).
- Corregir los typos de rutas conocidos (`adminitionDocumentTypes`, `faulTypes`/`faulClassifications`, `/rrhh/proccess/attendanceControl`, etc.) como parte de la migración, no antes (cambiarlos sueltos rompería frontend/backend que hoy coinciden en el error).

**Gate de salida:** nómina corriendo en `modules/` con resultados idénticos al legacy en al menos un ciclo de planilla real, sin regresión en las 26 pantallas activas + 7 ocultas.

---

## 8. Etapa 6 — Aprobaciones básicas (no motor BPM completo)

Dado que el workflow engine es "prioridad media" (#8) y los procesos con doble aprobación "aún no están identificados" (#16), se descarta expresamente el Rule Engine declarativo con versionado/simulación del v2 (sección 11.3) por sobre-ingeniería frente a la necesidad real actual.

**Entregables:**
- Mecanismo simple y reutilizable de aprobación (trigger + condición + aprobador + estado), aplicable a compras y otros documentos según se identifiquen casos reales durante esta etapa.
- No se construye escalamiento, delegación, ni simulación de reglas todavía.

**Gate de salida:** al menos un proceso real usando aprobación configurable (probablemente compras, dado que ya tiene ciclo completo desde la Etapa 3).

---

## 9. Etapa 7 — Integraciones puntuales (recorte del v2, sección 12)

Se descarta el framework genérico de integraciones/webhooks/marketplace del v2 y se hace solo lo que las decisiones de negocio justifican:

- **Documentos:** integración con Google Drive para adjuntos (decisión #9) — no un DMS propio con versionado/metadata/expiración/firma como planteaba el v2 (3.7).
- **WhatsApp Business API:** baja prioridad, oportunista — se aprovecha que `whatsapp-web.js` ya es dependencia del backend, pero no se prioriza sprint dedicado.
- **Pasarela de pagos, e-commerce, biométricos, marketplaces:** fuera de alcance (decisión #14 y sin caso de uso para el resto).

---

## 10. Fuera de alcance explícito (para no reabrir la discusión)

Estos ítems del v2 quedan descartados o pospuestos sin fecha, por decisión de negocio ya tomada:

- **SaaS multi-tenant runtime** (v2 Fase 13) — se mantiene el modelo de instalaciones separadas.
- **MRP / demand planning / manufacturing profundo** (v2 Fase 4, secciones 7.3–7.6) — Producción sigue como vertical secundario.
- **Hotel** (v2 sección 10.4) — en pausa.
- **Plataforma de extensibilidad / no-code / marketplace interno / developer platform / SDK** (v2 Fase 14 completa) — nivel mínimo, no se construye.
- **Consolidación de grupo** (v2 sección 6.1) — no aplica, instalaciones independientes.
- **CPQ, portales de cliente/proveedor, marketing/journeys** (v2 Fase 2, secciones 5.4–5.9) — sin caso de uso hoy.
- **Copilot/IA empresarial y predicción** (v2 Fase 11) — pospuesto explícitamente hasta cerrar Etapas 0–3 (datos, auditoría y permisos confiables primero es un principio del propio v2, sección 14 intro, que aquí se respeta literalmente).
- **Motor de reglas declarativo con versionado/simulación** (v2 sección 11.3) — reemplazado por el mecanismo simple de la Etapa 6.
- **Multiempresa/grupo, ABAC granular por sucursal/centro de costo/vendedor** (v2 sección 3.2) — el RBAC de la Etapa 1 cubre la necesidad real identificada (#15); ABAC queda para si aparece un caso de uso concreto.

---

## 11. Definition of Done por nivel de criticidad

El v2 exigía el mismo checklist de 21 puntos a cualquier funcionalidad, lo cual contradice su propia matriz de criticidad (sección 25). Aquí se ata el checklist al nivel:

### Nivel A — nómina, facturación, contabilidad, impuestos, inventario, caja, bancos, CxC/CxP
Checklist completo: backend en `modules/`, DTO, validación backend, permisos, auditoría, máquina de estados, eventos, manejo de errores, transacción DB, idempotencia, integración contable/inventario/impuestos según aplique, test unitario, test integración, **test E2E obligatorio**, verificación con datos reales, migración de DB, rollback documentado.

### Nivel B — CRM, compras, RRHH (una vez migrado), activos, tickets
Backend en `modules/`, DTO, validación, permisos, auditoría, manejo de errores, test unitario o integración (al menos uno de los dos), verificación con datos reales. **Sin exigir test E2E** salvo que el proceso toque dinero o inventario directamente.

### Nivel C — dashboards, reportes auxiliares, configuraciones, Producción, Hotel, Hospital (mientras sea vertical con roadmap propio)
Backend en `modules/`, permisos. Sin exigir integración contable/tributaria, sin exigir test E2E, sin exigir máquina de estados salvo que el dominio ya la tenga.

---

## 12. Riesgos específicos de este alcance recortado

| Riesgo | Mitigación |
|---|---|
| Etapa 0 se alarga y bloquea todo lo demás | Tiene alcance acotado (2 módulos + RRHH + backups), no es un rediseño; time-box explícito si se estanca |
| SAR (Etapa 2) depende de documentación/API externa fuera de control del equipo | Empezar con ambiente sandbox de SAR en paralelo a cerrar Etapa 0, no esperar a que Etapa 0 cierre 100% |
| RBAC "granular por usuario" (decisión #15) se vuelve tan complejo como ABAC completo si no se acota | Definir desde el inicio qué significa "funcionalidad" como unidad de permiso (ya existe el concepto vía `adminModulesDetail`) y no inventar una segunda capa de granularidad |
| Descartar CPQ/portales/marketing dejando gaps si el negocio cambia de idea | Quedan documentados en v2 como catálogo de referencia, no se pierde el trabajo de diseño si se retoman |
| Migración de RRHH (Etapa 5) sin paralelo real por falta de ambiente de prueba con datos reales de planilla | Usar el mismo patrón ya validado en otros módulos (paralelo legacy/nuevo con snapshot comparativo), no saltarlo por presión de tiempo |

---

## 13. Próximos pasos inmediatos

1. Empezar Etapa 0 en paralelo: (a) verificación browser de Banks/Fixed Assets, (b) fix de los 2 bugs de RRHH, (c) primer test unitario del motor de nómina.
2. Averiguar en paralelo si SAR tiene ambiente sandbox disponible ya, para no bloquear la Etapa 2 detrás de la Etapa 0 completa.
3. Definir la política de backups (RPO/RTO) como documento corto, no como proyecto — es una decisión, no una construcción larga.
