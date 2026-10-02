# Plan de Acción — Multiwork 2.0 hacia ERP/CRM empresarial completo

**Versión:** 2.0  
**Fecha:** 28 Sep 2026  
**Objetivo:** evolucionar Multiwork 2.0 desde un sistema transaccional de registro hacia una plataforma ERP/CRM empresarial integrada, inteligente, automatizada, auditable, escalable y extensible.

---

# 0. Propósito y definición de “ERP/CRM completo”

## 0.1 Punto de partida

Multiwork 2.0 ya posee una base funcional considerable: los 12 módulos principales tienen pantallas reales conectadas a API; Billing, Inventory, Accounting, Tax, Banks, Fixed Assets, RRHH, Hospital, Production, Hotel y Settings contienen una cantidad importante de lógica de negocio real. El problema principal ya no es “construir el ERP desde cero”, sino convertir esa superficie transaccional en una **plataforma empresarial integrada**.

El análisis funcional confirma tres grandes realidades:

1. La superficie de negocio está avanzada, pero la arquitectura backend todavía está dividida entre `modules/<dominio>/<entidad>/` y el patrón legacy.
2. Existen funciones críticas sin verificación end-to-end, especialmente Banks, Fixed Assets y RRHH.
3. El sistema todavía carece de varias capacidades que diferencian un sistema de registro de un ERP/CRM empresarial: planificación, workflows, automatización, gobierno de datos, CRM completo, servicio, portales, integración, analítica avanzada, seguridad empresarial y capacidades predictivas.

El análisis actual reporta aproximadamente 45% del backend en el patrón nuevo y 100% legacy en RRHH, además de gaps como Centros de Costo, multimoneda, períodos contables, Guía de Remisión, privilegios de Hospital y pruebas automatizadas de lógica crítica.

## 0.2 Nueva definición de objetivo

“ERP/CRM completo” no significa implementar infinitas funcionalidades de cualquier industria. Significa que Multiwork debe cubrir de forma coherente los principales ciclos empresariales:

- **Lead-to-Cash:** prospecto → oportunidad → cotización → pedido → entrega → factura → cobro → postventa.
- **Procure-to-Pay:** necesidad → solicitud → aprobación → cotización proveedor → orden de compra → recepción → factura → pago → evaluación proveedor.
- **Record-to-Report:** operación → contabilización → conciliación → cierre → estados financieros → análisis.
- **Plan-to-Produce:** demanda → planificación → materiales → orden de producción → consumo → producción → calidad → costo.
- **Hire-to-Retire:** reclutamiento → contratación → onboarding → asistencia → nómina → desempeño → capacitación → salida.
- **Project-to-Profit:** oportunidad → presupuesto → recursos → ejecución → horas/gastos → facturación → margen → cierre.
- **Service-to-Retention:** cliente → caso/ticket → SLA → atención → resolución → satisfacción → renovación.
- **Asset-to-Retirement:** adquisición → capitalización → asignación → depreciación → mantenimiento → revaluación/deterioro → baja.
- **Treasury-to-Cash:** cuentas → pagos/cobros → conciliación → liquidez → forecast → financiamiento.
- **Tax-to-Compliance:** transacción fiscal → validación → declaración → retención → conciliación → evidencia.
- **Data-to-Decision:** datos transaccionales → modelo analítico → KPI → alerta → recomendación → acción.

La arquitectura debe permitir que estos ciclos compartan maestros, eventos, documentos, aprobaciones, auditoría y datos analíticos.

## 0.3 Principio rector nuevo

El producto debe evolucionar de:

> **Registrar lo que ocurrió**

a:

> **Entender qué está ocurriendo → anticipar qué ocurrirá → recomendar qué hacer → automatizar lo repetitivo → mantener al humano en control de las decisiones relevantes.**

Las suites empresariales actuales integran ventas, servicio, finanzas, supply chain, operaciones, proyectos y RRHH sobre una base común, y cada vez incorporan analítica, automatización y agentes de IA. Multiwork debe adoptar esa dirección como arquitectura de producto, sin convertir IA en sustituto de controles empresariales. 

---

# 1. Mapa maestro de capacidades objetivo

El siguiente mapa se convierte en el **Definition of Scope** del producto.

| Dominio | Estado actual | Objetivo |
|---|---|---|
| Finanzas y Contabilidad | Alto | ERP financiero completo |
| CxC / CxP | Alto | Gestión integral de cartera y pagos |
| Tesorería | Medio/alto | Cash management + forecasting + conciliación |
| Compras | Medio | Procure-to-Pay completo |
| Inventario | Alto | Supply chain con planificación |
| Ventas | Medio/alto | Order-to-Cash integrado |
| CRM | Bajo | CRM completo |
| Servicio al cliente | Bajo | Customer Service + SLA |
| Marketing | Bajo | Segmentación + campañas + journeys |
| RRHH | Alto funcional / bajo arquitectura | HCM completo |
| Activos Fijos | Alto | Asset lifecycle + mantenimiento |
| Producción | Alto funcional / legacy | Manufacturing + planificación |
| Proyectos | Medio/bajo | Project Operations |
| Hospital | Vertical | ERP/CRM sanitario integrado |
| Hotel | Vertical | PMS/Hotel integrado |
| BI / Analytics | Bajo | BI operativo + ejecutivo + predictivo |
| Workflows / aprobaciones | Bajo | Motor transversal |
| Documentos | Medio | DMS empresarial |
| Integraciones | Bajo/medio | API + webhooks + conectores |
| Portales | Bajo | Cliente / proveedor / empleado |
| Mobile | Bajo | PWA + capacidades móviles |
| Seguridad | Medio | Seguridad empresarial |
| Auditoría / Compliance | Bajo | Gobierno y trazabilidad completa |
| Automatización | Bajo | BPM + reglas + jobs |
| IA | Bajo | Copilot empresarial + predicción |
| Multiempresa | Instalaciones separadas | Arquitectura preparada para grupo/SaaS |
| Localización Honduras | Medio | Cumplimiento fiscal y laboral completo |
| Escalabilidad | Medio/bajo | Plataforma productiva observable y resiliente |

---

# 2. Principios arquitectónicos y de producto

Los principios originales se mantienen y se amplían.

## 2.1 Arquitectura

1. Todo módulo nuevo nace en `modules/<dominio>/<entidad>/`.
2. Controller → Service → Repository/Model → DTO, evitando lógica de negocio en controllers.
3. Strangler pattern para migrar legacy.
4. Eventos de dominio como columna vertebral.
5. APIs internas y externas versionadas.
6. Ningún dashboard debe depender directamente de consultas complejas sobre tablas transaccionales.
7. Toda operación financiera o de inventario debe ser idempotente cuando pueda ejecutarse más de una vez.
8. Todas las transacciones críticas deben tener trazabilidad y usuario responsable.
9. Las reglas de negocio importantes deben existir en backend, no únicamente en frontend.
10. Los maestros críticos deben tener identificadores estables y reglas de deduplicación.

## 2.2 Producto

1. Configurable antes que hard-coded.
2. Automatizar antes que pedir al usuario repetir información.
3. Una sola fuente de verdad por maestro.
4. Todo documento debe tener ciclo de vida.
5. Todo proceso importante debe tener estado.
6. Todo estado importante debe tener historial.
7. Toda aprobación debe ser auditable.
8. Toda métrica ejecutiva debe poder navegar hasta el documento origen.
9. Todo cálculo crítico debe ser reproducible.
10. Las decisiones automatizadas deben mostrar explicación y evidencia cuando sea relevante.

---

# 3. Fase 0 — Fundaciones técnicas, seguridad y gobierno de datos

**Objetivo:** eliminar deuda estructural y crear la plataforma transversal.

El plan original de Fase 0 se conserva íntegramente y se amplía con los siguientes bloques.

## 3.1 Migración arquitectónica

Mantener:

- RRHH.
- Hospital.
- Admin.
- Inventory restante.
- Tax.
- Fixed Assets.
- Producción.
- Hotel, cuando entre nuevamente en alcance.

### Criterio de cierre

- 0 dominios críticos nuevos en legacy.
- 0 lógica de negocio crítica en controllers.
- DTOs para todas las APIs nuevas.
- tests de servicios críticos.
- rutas antiguas mantenidas mediante aliases hasta migración del frontend.

## 3.2 Identidad, autenticación y autorización

Además de refresh token, rate limiting, 2FA y permisos declarativos:

- RBAC: roles/perfiles.
- ABAC opcional: restricciones por empresa, sucursal, almacén, centro de costo, vendedor, departamento.
- permisos de:
  - ver,
  - crear,
  - editar,
  - anular,
  - aprobar,
  - exportar,
  - imprimir,
  - administrar.
- segregación de funciones.
- sesiones activas.
- revocación de sesiones.
- historial de accesos.
- política de contraseñas configurable.
- MFA para perfiles administrativos.
- recuperación segura de cuenta.
- bloqueo y desbloqueo administrable.

## 3.3 Gobierno de maestros

Crear `Master Data Management` transversal para:

- clientes,
- prospectos,
- proveedores,
- empleados,
- productos,
- servicios,
- cuentas contables,
- almacenes,
- sucursales,
- bancos,
- monedas,
- impuestos,
- centros de costo,
- proyectos,
- activos.

Capacidades:

- duplicados,
- merge,
- historial,
- estados activo/inactivo,
- validaciones,
- campos obligatorios configurables,
- códigos externos,
- datos fiscales,
- contactos múltiples,
- documentos adjuntos.

## 3.4 Numeración y documentos

`SequenceService` debe soportar:

- documentos fiscales,
- documentos internos,
- series,
- sucursal,
- caja,
- empresa,
- ejercicio,
- concurrencia,
- contingencia,
- anulaciones,
- reimpresiones.

Cada documento debe poseer:

- número,
- tipo,
- estado,
- fecha,
- usuario creador,
- fecha de creación,
- usuario modificador,
- versión,
- documento origen,
- documento destino,
- motivo de anulación.

## 3.5 Ciclo de vida documental

Estándar transversal:

`Draft → Pending Approval → Approved → Posted/Confirmed → Partially Fulfilled → Completed → Cancelled/Void`

No todos los documentos necesitan todos los estados, pero cada dominio debe declarar explícitamente su máquina de estados.

## 3.6 Periodos y cierres

Ampliar el control de periodos:

- periodo contable,
- periodo fiscal,
- periodo de inventario,
- periodo de nómina,
- cierre de caja,
- cierre de compras,
- cierre de ventas.

El sistema debe impedir modificaciones retroactivas sin permiso especial y registrar excepciones.

## 3.7 Gestión documental

Nuevo dominio `documents`:

- adjuntar archivos a cualquier entidad,
- versionado,
- metadata,
- permisos,
- categorías,
- búsqueda,
- preview,
- expiración,
- firma/validación,
- auditoría,
- almacenamiento configurable.

Ejemplos:

- contrato de empleado,
- factura proveedor,
- cotización,
- orden de compra,
- escritura/documento fiscal,
- contrato cliente,
- garantía,
- expediente de activo.

## 3.8 Auditoría empresarial

Además del `audit_log`:

- timeline de entidad,
- cambios de estado,
- aprobaciones,
- IP,
- dispositivo,
- usuario,
- antes/después,
- motivo,
- documento relacionado.

Crear pantalla de auditoría con filtros y exportación.

## 3.9 Calidad

Expandir CI:

- unit tests,
- integration tests,
- API tests,
- E2E browser tests,
- pruebas de permisos,
- pruebas de concurrencia,
- pruebas de migraciones,
- pruebas de PDF,
- pruebas de Excel,
- pruebas de cálculos fiscales,
- pruebas de nómina,
- pruebas de contabilidad,
- pruebas de inventario.

---

# 4. Fase 1 — ERP Intelligence: BI, KPI, alertas y planificación

La Fase 1 original se conserva, pero el modelo analítico debe crecer de “reportes” a **sistema de decisión**.

## 4.1 Modelo analítico empresarial

Además de las tablas originales:

### Hechos

- ventas,
- compras,
- inventario,
- movimientos,
- pagos,
- cobros,
- nómina,
- asistencia,
- producción,
- proyectos,
- tickets,
- oportunidades,
- actividades comerciales,
- activos,
- mantenimiento,
- presupuesto.

### Dimensiones

- tiempo,
- empresa,
- sucursal,
- cliente,
- proveedor,
- producto,
- categoría,
- vendedor,
- empleado,
- almacén,
- centro de costo,
- cuenta,
- proyecto,
- campaña,
- canal.

## 4.2 KPI empresariales

### Dirección

- ingresos,
- margen,
- EBITDA aproximado,
- caja,
- deuda,
- CxC,
- CxP,
- capital de trabajo,
- inventario,
- rentabilidad por cliente,
- rentabilidad por producto,
- rentabilidad por sucursal.

### Ventas

- pipeline,
- win rate,
- ciclo comercial,
- cuota,
- forecast,
- ticket,
- recurrencia,
- churn.

### Operaciones

- OTIF,
- rotación,
- stockout,
- fill rate,
- compras,
- lead time,
- costo logístico.

### RRHH

- headcount,
- rotación,
- ausentismo,
- costo laboral,
- productividad,
- overtime,
- vacaciones.

### Servicio

- tickets,
- SLA,
- tiempo de primera respuesta,
- tiempo de resolución,
- reincidencia,
- CSAT.

## 4.3 Presupuestos y planificación

Nuevo bloque obligatorio:

- presupuesto anual,
- presupuesto mensual,
- presupuesto por cuenta,
- presupuesto por centro de costo,
- presupuesto por proyecto,
- presupuesto de ventas,
- presupuesto de compras,
- presupuesto de nómina,
- escenarios:
  - base,
  - optimista,
  - pesimista.
- forecast rolling.
- real vs presupuesto.
- aprobación presupuestaria.
- control de disponibilidad presupuestaria.

## 4.4 Alertas inteligentes

Evolucionar de umbrales simples a:

`evento + regla + contexto + severidad + responsable + SLA + acción`

Ejemplo:

> CxC > 60 días + cliente estratégico + saldo > límite → crear tarea de cobranza + notificar cobrador + escalar gerente.

## 4.5 Drill-down

Todo KPI debe permitir:

`KPI → dimensión → transacciones → documento → detalle`

Esto evita dashboards decorativos.

---

# 5. Fase 2 — CRM 360 y Customer Lifecycle

La Fase 2 original es correcta y se amplía para cubrir CRM empresarial.

## 5.1 Lead Management

- captura manual,
- web,
- formularios,
- importación,
- campañas,
- referidos,
- scoring,
- deduplicación,
- asignación automática,
- SLA de atención,
- conversión.

## 5.2 Account Management

Cliente 360:

- datos,
- contactos,
- jerarquía empresarial,
- sucursales,
- contratos,
- oportunidades,
- cotizaciones,
- pedidos,
- facturas,
- pagos,
- tickets,
- campañas,
- comunicaciones,
- productos comprados,
- rentabilidad,
- riesgo crediticio.

## 5.3 Sales Pipeline

- múltiples pipelines,
- etapas configurables,
- probabilidad,
- forecast,
- actividades,
- competidores,
- productos,
- descuentos,
- aprobaciones,
- motivo de pérdida,
- next best action.

## 5.4 Pricing y CPQ

Nueva capacidad:

- listas de precios,
- vigencias,
- moneda,
- segmento,
- cliente,
- volumen,
- descuentos,
- promociones,
- bundles,
- reglas de aprobación,
- cotización configurable.

## 5.5 Contratos y recurrencia

Nuevo dominio `contracts`:

- contratos clientes,
- contratos proveedores,
- contratos de servicio,
- vigencia,
- renovación,
- SLA,
- precios,
- anexos,
- alertas,
- facturación recurrente.

## 5.6 Customer Service

Expandir tickets:

- omnicanal,
- categorías,
- SLA,
- prioridad,
- colas,
- asignación,
- escalamiento,
- base de conocimiento,
- macros,
- respuestas guardadas,
- satisfacción,
- garantías,
- devoluciones.

## 5.7 Customer Portal

Portal externo para:

- cotizaciones,
- pedidos,
- facturas,
- estados de cuenta,
- pagos,
- tickets,
- documentos,
- contratos,
- solicitudes.

## 5.8 Supplier Portal

Portal para:

- órdenes de compra,
- confirmación,
- entregas,
- facturas,
- documentos,
- estado de pago,
- incidencias,
- evaluación.

## 5.9 Marketing

- segmentos dinámicos,
- campañas,
- email,
- WhatsApp Business API,
- journeys,
- plantillas,
- consentimiento,
- unsubscribe,
- métricas,
- atribución.

---

# 6. Fase 3 — ERP Core: Finanzas, Compras, Inventario y Tesorería

La fase debe centrarse en cerrar los ciclos financieros completos.

## 6.1 Record-to-Report

Además de lo previsto:

- plan contable configurable,
- dimensiones contables,
- centros de costo,
- centros de beneficio,
- presupuestos,
- asientos recurrentes,
- asientos reversibles,
- accruals,
- provisiones,
- conciliaciones,
- cierre mensual,
- cierre anual,
- reapertura controlada,
- consolidación,
- eliminaciones intercompañía,
- múltiples libros/monedas cuando aplique.

## 6.2 Procure-to-Pay

Convertir Compras en un ciclo completo:

1. Solicitud de compra.
2. Presupuesto disponible.
3. Aprobación.
4. RFQ.
5. Cotizaciones proveedor.
6. Comparativo.
7. Selección.
8. Orden de compra.
9. Confirmación.
10. Recepción.
11. Inspección.
12. Factura.
13. Matching 2-way / 3-way.
14. Retenciones.
15. Aprobación de pago.
16. Pago.
17. Conciliación.
18. Evaluación proveedor.

## 6.3 Supplier Management

- ficha completa,
- riesgo,
- documentación,
- vencimientos,
- condiciones,
- SLA,
- performance,
- entregas,
- calidad,
- precios históricos,
- scorecard.

## 6.4 CxP

- aging,
- límites,
- vencimientos,
- descuentos por pronto pago,
- programación de pagos,
- pagos parciales,
- retenciones,
- anticipos,
- notas,
- compensaciones.

## 6.5 CxC

- crédito,
- límites,
- scoring,
- aging,
- promesas,
- cobranza,
- acuerdos de pago,
- pagos parciales,
- aplicación automática,
- notas,
- conciliación.

## 6.6 Tesorería

- posición de caja,
- cash forecast,
- conciliación bancaria,
- pagos,
- transferencias,
- inversiones si aplica,
- préstamos/financiamiento,
- comisiones bancarias,
- archivos bancarios,
- escenarios de liquidez.

---

# 7. Fase 4 — Supply Chain, Inventario y Producción

Aquí se incorpora lo que falta para pasar de inventario a gestión de cadena de suministro.

## 7.1 Inventario avanzado

- múltiples unidades de medida,
- conversiones,
- lotes,
- series,
- vencimientos,
- ubicaciones/bin,
- cuarentena,
- inventario comprometido,
- disponible para promesa,
- stock en tránsito,
- stock consignado,
- inventario reservado,
- conteos cíclicos,
- inventario ABC.

## 7.2 Reposición

- mínimos/máximos,
- reorder point,
- safety stock,
- lead time,
- demanda histórica,
- demanda prevista,
- sugerencias de compra,
- sugerencias de producción.

## 7.3 Demand Planning

- forecast,
- estacionalidad,
- tendencia,
- ajuste manual,
- escenarios,
- forecast vs real,
- precisión del forecast.

## 7.4 MRP

Capacidad objetivo:

`Demanda → MPS → BOM → MRP → requerimientos → compras/producción`

- BOM,
- versiones,
- sustitutos,
- rutas,
- tiempos,
- scrap,
- capacidad,
- órdenes planificadas.

## 7.5 Producción

- órdenes de producción,
- materiales,
- mano de obra,
- tiempos,
- etapas,
- subproductos,
- desperdicios,
- costos reales vs estándar,
- cierre de orden,
- trazabilidad por lote/serie.

## 7.6 Calidad

Nuevo dominio transversal:

- inspecciones,
- planes de calidad,
- no conformidades,
- cuarentena,
- CAPA,
- devoluciones,
- proveedores,
- productos,
- producción.

---

# 8. Fase 5 — Proyectos y servicios profesionales

Este dominio falta en el plan original y es importante para empresas que venden proyectos, instalaciones o servicios.

## 8.1 Project Management

- proyectos,
- fases,
- tareas,
- dependencias,
- responsables,
- calendario,
- hitos,
- recursos,
- presupuesto,
- costos,
- ingresos,
- riesgos,
- issues.

## 8.2 Project Accounting

- horas,
- gastos,
- compras,
- materiales,
- costos laborales,
- costo comprometido,
- costo real,
- revenue,
- margen,
- WIP,
- facturación por avance,
- retenciones,
- reconocimiento de ingresos cuando aplique.

## 8.3 Resource Management

- disponibilidad,
- skills,
- asignación,
- capacidad,
- utilización,
- costo/hora,
- tarifas por cliente/proyecto.

## 8.4 Time & Expense

Portal para:

- timesheets,
- gastos,
- comprobantes,
- aprobación,
- imputación a proyecto,
- integración con nómina y contabilidad.

---

# 9. Fase 6 — RRHH/HCM empresarial

El análisis demuestra que RRHH tiene mucha más funcionalidad real de la inicialmente asumida; por eso el objetivo es **modernizarlo y convertirlo en HCM**, no reconstruirlo.

## 9.1 Core HR

- expediente,
- contratos,
- documentos,
- dependientes,
- puestos,
- organigrama,
- historial salarial,
- historial laboral,
- beneficios.

## 9.2 Recruiting

- requisición,
- publicación,
- candidatos,
- pipeline,
- entrevistas,
- evaluaciones,
- oferta,
- contratación,
- onboarding.

## 9.3 Performance

- objetivos,
- OKR/KPI,
- evaluaciones,
- feedback,
- planes de desarrollo,
- sucesión.

## 9.4 Learning

- cursos,
- certificaciones,
- competencias,
- vencimientos,
- capacitaciones obligatorias.

## 9.5 Employee Self-Service

- boletas,
- vacaciones,
- permisos,
- constancias,
- documentos,
- datos personales,
- solicitudes.

## 9.6 Workforce Analytics

- headcount,
- costo,
- rotación,
- ausentismo,
- overtime,
- productividad,
- costo por centro de costo,
- costo por proyecto.

## 9.7 Nómina

Mantener y reforzar:

- paralelo legacy/nuevo,
- pruebas legales,
- snapshots,
- auditoría,
- reversión,
- recalculo,
- cierre de nómina.

---

# 10. Fase 7 — Activos, mantenimiento y verticales

## 10.1 Asset Management

Además de Fixed Assets:

- lifecycle,
- ubicación,
- responsable,
- garantía,
- mantenimiento,
- componentes,
- QR,
- historial,
- costo total de propiedad,
- depreciación,
- deterioro,
- disposición.

## 10.2 Maintenance / Field Service

Nuevo dominio:

- activos instalados,
- contratos de servicio,
- mantenimiento preventivo,
- mantenimiento correctivo,
- órdenes de trabajo,
- técnicos,
- repuestos,
- SLA,
- agenda,
- evidencias,
- firma del cliente,
- facturación.

## 10.3 Hospital

El módulo Hospital pasa de vertical aislado a integración ERP:

- paciente,
- agenda,
- admisión,
- expediente,
- servicios,
- farmacia,
- honorarios,
- facturación,
- inventario,
- cuentas,
- cobranza,
- documentos,
- auditoría,
- privilegios.

## 10.4 Hotel

Reactivar como vertical cuando se decida:

- PMS,
- reservas,
- habitaciones,
- housekeeping,
- restaurante,
- cargos,
- pagos,
- dashboard,
- calendario,
- clientes,
- facturación,
- inventario,
- contabilidad.

---

# 11. Fase 8 — Automatización y Workflow/BPM

El motor de aprobaciones de la Fase 3 debe evolucionar a un **Workflow Engine transversal**.

## 11.1 Características

- trigger,
- condiciones,
- acciones,
- aprobadores,
- SLA,
- escalamiento,
- delegación,
- paralelismo,
- secuencias,
- excepciones,
- reintentos,
- auditoría.

## 11.2 Ejemplos

- Factura > límite → aprobación.
- Descuento > política → gerente.
- Compra > presupuesto → Finanzas.
- Stock bajo → sugerir compra.
- Cliente vencido → tarea de cobranza.
- Contrato por vencer → alerta.
- CAI por vencer → tarea administrativa.
- Empleado con certificación vencida → bloquear asignación.
- Proyecto excede presupuesto → escalar PM.
- Cheque > límite → doble aprobación.

## 11.3 Rule Engine

Separar reglas de negocio configurables del código cuando sea seguro:

`IF condición THEN acción`

Con:

- versionado,
- vigencia,
- prioridad,
- simulación,
- auditoría.

---

# 12. Fase 9 — Integraciones, API y ecosistema

La Fase 4 original se convierte en plataforma de integración.

## 12.1 API

- OpenAPI.
- API versionada.
- OAuth2/API keys.
- scopes.
- rate limits.
- idempotency keys.
- pagination.
- filtros.
- webhooks.
- firma de webhooks.
- logs de integración.

## 12.2 Integraciones prioritarias

- bancos,
- SAR,
- facturación electrónica,
- pasarelas de pago,
- correo,
- WhatsApp Business API,
- e-commerce,
- POS,
- biométricos,
- marketplaces,
- almacenamiento documental,
- firma electrónica.

## 12.3 Import/Export Framework

No crear importadores aislados por módulo.

Crear framework común:

- plantilla,
- preview,
- validación,
- errores por fila,
- dry run,
- ejecución,
- rollback cuando sea viable,
- historial,
- usuario.

## 12.4 Webhooks

Eventos:

- customer.created,
- lead.created,
- opportunity.won,
- order.created,
- invoice.created,
- payment.received,
- purchase.received,
- stock.low,
- payroll.closed,
- ticket.created,
- asset.maintenance_due.

---

# 13. Fase 10 — Mobile y experiencia omnicanal

## 13.1 PWA primero

Prioridad:

1. vendedor,
2. cobrador,
3. aprobador,
4. técnico,
5. empleado,
6. cliente.

## 13.2 Capacidades

- dashboard,
- CRM,
- agenda,
- cotizaciones,
- pedidos,
- cobranza,
- tickets,
- aprobaciones,
- firmas,
- fotos,
- QR/barcode,
- geolocalización solo cuando sea necesaria y autorizada.

## 13.3 Offline

Para procesos de campo:

- cola local,
- sincronización,
- resolución de conflictos,
- indicador de sincronización.

---

# 14. Fase 11 — IA empresarial

La IA debe entrar después de tener datos, eventos, permisos y auditoría confiables.

## 14.1 Copilot Multiwork

Un asistente contextual capaz de responder:

- “¿Cómo están las ventas este mes?”
- “¿Qué clientes tienen mayor riesgo de mora?”
- “¿Qué productos están por quedarse sin inventario?”
- “¿Qué facturas requieren cobranza?”
- “¿Qué gastos excedieron presupuesto?”
- “Muéstrame las oportunidades que deberían atenderse hoy.”

Siempre debe respetar permisos.

## 14.2 IA predictiva

Prioridades:

- forecast de ventas,
- forecast de demanda,
- riesgo de mora,
- probabilidad de cierre,
- riesgo de churn,
- detección de anomalías,
- predicción de stockout,
- rotación de personal,
- forecast de caja.

## 14.3 Automatización inteligente

Casos futuros:

- conciliación bancaria asistida,
- clasificación de gastos,
- matching de facturas proveedor,
- extracción OCR,
- resumen de clientes,
- resumen de tickets,
- generación de comunicaciones,
- explicación de variaciones presupuestarias.

## 14.4 Guardrails

La IA nunca debe:

- modificar dinero automáticamente sin política/autorización,
- aprobar transacciones críticas sin autorización explícita,
- cambiar nómina sin trazabilidad,
- eliminar registros,
- saltarse permisos.

Toda acción asistida debe registrar:

- usuario,
- agente/modelo,
- input,
- output relevante,
- acción ejecutada,
- timestamp.

---

# 15. Fase 12 — Seguridad, compliance, continuidad y resiliencia

## 15.1 Seguridad

- MFA.
- RBAC/ABAC.
- segregación de funciones.
- cifrado en tránsito.
- cifrado de secretos.
- gestión de sesiones.
- rate limiting.
- protección de archivos.
- antivirus/validación de uploads.
- security headers.
- dependency scanning.
- secret scanning.

## 15.2 Backups

- backup automático,
- retención,
- backup off-site,
- cifrado,
- restore test periódico,
- RPO definido,
- RTO definido.

## 15.3 Disaster Recovery

Documentar:

- caída de DB,
- caída de aplicación,
- pérdida de servidor,
- corrupción,
- ransomware,
- caída de proveedor externo,
- recuperación de una marca.

## 15.4 Compliance

Para Honduras:

- SAR,
- CAI,
- ISV,
- ISR,
- retenciones,
- IHSS,
- RAP,
- obligaciones laborales,
- documentación fiscal.

La normativa debe modelarse como reglas/configuración versionadas, no como valores enterrados en controllers.

---

# 16. Fase 13 — Multiempresa / grupo empresarial / SaaS

No implementar multi-tenant runtime prematuramente.

Primero:

- schema versionado,
- configuración por empresa,
- catálogo de empresas,
- moneda,
- fiscalidad,
- numeración,
- branding,
- usuarios,
- permisos,
- parámetros.

Después evaluar:

### Modelo A
Instalaciones separadas por empresa.

### Modelo B
Base compartida con `company_id`.

### Modelo C
Base por tenant.

### Modelo D
Modelo híbrido.

La elección debe depender de:

- costo,
- aislamiento,
- escalabilidad,
- soporte,
- regulación,
- volumen,
- modelo comercial.

---

# 17. Fase 14 — Plataforma de extensibilidad

Para convertir Multiwork en producto:

## 17.1 Configuración sin código

- campos personalizados,
- formularios configurables,
- estados,
- workflows,
- reportes,
- dashboards,
- plantillas,
- numeraciones,
- reglas,
- notificaciones.

## 17.2 Marketplace interno/futuro

Posibilidad de agregar:

- módulos,
- conectores,
- verticales,
- reportes,
- plantillas,
- automatizaciones.

## 17.3 Developer platform

- API docs,
- sandbox,
- API keys,
- webhooks,
- eventos,
- SDK futuro,
- versionado.

---

# 18. Datos maestros y modelo empresarial común

Debe existir un **Business Object Model** documentado.

Relaciones principales:

```text
Empresa
 ├── Sucursales
 ├── Usuarios
 ├── Clientes
 │    ├── Contactos
 │    ├── Oportunidades
 │    ├── Cotizaciones
 │    ├── Pedidos
 │    ├── Facturas
 │    ├── Pagos
 │    ├── Tickets
 │    └── Contratos
 ├── Proveedores
 │    ├── Cotizaciones
 │    ├── Compras
 │    ├── Recepciones
 │    ├── Facturas
 │    └── Pagos
 ├── Productos
 │    ├── Inventario
 │    ├── Compras
 │    ├── Ventas
 │    └── Producción
 ├── Empleados
 │    ├── RRHH
 │    ├── Asistencia
 │    ├── Nómina
 │    └── Proyectos
 ├── Proyectos
 ├── Activos
 └── Centros de Costo
```

---

# 19. Matriz de integración de procesos

| Origen | Destino | Integración obligatoria |
|---|---|---|
| CRM | Billing | oportunidad → cotización → factura |
| CRM | CxC | cliente → crédito → cobranza |
| Billing | Inventory | venta → reserva → salida |
| Billing | Accounting | factura → partida |
| Billing | Tax | documento → impuesto |
| Inventory | Accounting | movimiento → costo |
| Inventory | Purchasing | stock → reorden → OC |
| Purchasing | Inventory | OC → recepción |
| Purchasing | Accounting | factura proveedor → CxP |
| Purchasing | Banks | CxP → pago |
| Banks | Accounting | pago → partida |
| Banks | CxC/CxP | aplicación y conciliación |
| RRHH | Accounting | nómina → costo |
| RRHH | Banks | nómina → pago |
| Production | Inventory | consumo/producción |
| Production | Accounting | costo de producción |
| Projects | RRHH | horas/costo |
| Projects | Billing | avance → factura |
| Projects | Accounting | costo/margen |
| Service | CRM | cliente 360 |
| Service | Inventory | repuestos |
| Service | Billing | servicio/facturación |
| Assets | Accounting | depreciación |
| Assets | Maintenance | mantenimiento |
| Tax | Accounting | impuestos |
| Analytics | Todos | KPIs y decisiones |

---

# 20. UX empresarial

El ERP no debe ser solamente un conjunto de CRUDs.

## 20.1 Workspaces

Cada rol debe tener un workspace:

- CEO/Gerencia,
- Finanzas,
- Contabilidad,
- Ventas,
- Cobranza,
- Compras,
- Bodega,
- Producción,
- RRHH,
- Servicio,
- Project Manager.

## 20.2 “Mi día”

Debe mostrar:

- tareas,
- aprobaciones,
- alertas,
- vencimientos,
- oportunidades,
- cobros,
- tickets,
- excepciones.

## 20.3 Búsqueda global

Buscar por:

- cliente,
- factura,
- producto,
- empleado,
- proveedor,
- ticket,
- oportunidad,
- proyecto,
- activo.

Mostrar resultados agrupados por entidad.

## 20.4 Command Center

Atajos:

- crear factura,
- crear cotización,
- registrar cobro,
- crear compra,
- solicitar aprobación,
- abrir ticket.

---

# 21. Reportería y BI de nivel empresarial

## 21.1 Reportes operativos

- filtros,
- columnas,
- agrupación,
- pivote,
- exportación,
- favoritos.

## 21.2 Reportes financieros

- P&L,
- balance,
- cash flow,
- trial balance,
- aging,
- presupuesto,
- variaciones.

## 21.3 Reportes gerenciales

- ventas,
- margen,
- caja,
- inventario,
- clientes,
- proveedores,
- RRHH,
- proyectos.

## 21.4 Reportes regulatorios

- SAR,
- impuestos,
- nómina,
- documentos fiscales.

## 21.5 Self-service BI

Usuarios autorizados pueden crear:

- vistas,
- filtros,
- widgets,
- dashboards,
- reportes.

Sin permitir SQL arbitrario desde el frontend.

---

# 22. Estrategia de implementación

El orden no debe ser únicamente “Fase 0 → 1 → 2...”.

Debe utilizar tres tracks paralelos controlados.

## Track A — Plataforma

- arquitectura,
- seguridad,
- eventos,
- auditoría,
- workflow,
- datos,
- API,
- observabilidad.

## Track B — ERP

- Finanzas,
- compras,
- inventario,
- producción,
- RRHH,
- activos,
- proyectos.

## Track C — CRM

- leads,
- oportunidades,
- ventas,
- marketing,
- servicio,
- customer portal.

Regla:

> Ningún track puede crear una integración ad hoc que contradiga la plataforma común.

---

# 23. Compuertas de salida

Una fase no se considera terminada por tener pantallas.

## Gate 1 — Arquitectura

- backend nuevo consistente,
- seguridad,
- auditoría,
- eventos,
- migraciones,
- tests.

## Gate 2 — Datos

- maestros confiables,
- modelo analítico reconciliado,
- KPIs reproducibles.

## Gate 3 — Proceso

Cada proceso crítico debe completar:

`crear → aprobar → ejecutar → contabilizar → auditar → reportar`

## Gate 4 — Integración

Cada documento crítico debe tener:

- origen,
- documento actual,
- documentos relacionados,
- impacto financiero,
- impacto inventario cuando aplique.

## Gate 5 — UX

- browser E2E,
- errores manejados,
- responsive donde corresponda,
- permisos comprobados.

## Gate 6 — Operación

- monitoreo,
- backup,
- restore test,
- logs,
- métricas,
- alertas.

---

# 24. Definition of Done universal

Una funcionalidad no se considera completa si solo existe su CRUD.

Debe cumplir:

- [ ] Backend en patrón nuevo.
- [ ] DTO.
- [ ] Validación backend.
- [ ] Permisos.
- [ ] Auditoría.
- [ ] Máquina de estados.
- [ ] Eventos.
- [ ] Manejo de errores.
- [ ] Transacción DB cuando aplique.
- [ ] Idempotencia cuando aplique.
- [ ] Integración con contabilidad cuando genere impacto financiero.
- [ ] Integración con inventario cuando corresponda.
- [ ] Integración con impuestos cuando corresponda.
- [ ] Reporte.
- [ ] Dashboard/KPI cuando tenga valor analítico.
- [ ] Notificación cuando exista vencimiento/excepción.
- [ ] Test unitario.
- [ ] Test integración.
- [ ] Test E2E para procesos críticos.
- [ ] Verificación con datos reales.
- [ ] Documentación.
- [ ] Migración de DB.
- [ ] Rollback documentado.

---

# 25. Matriz de criticidad

## Nivel A — Nunca romper

- nómina,
- facturación,
- contabilidad,
- impuestos,
- inventario,
- caja,
- bancos,
- CxC,
- CxP.

Requieren máxima cobertura de pruebas.

## Nivel B — Alta criticidad

- CRM,
- compras,
- producción,
- proyectos,
- activos,
- tickets.

## Nivel C — Soporte

- dashboards,
- reportes auxiliares,
- configuraciones,
- marketing.

---

# 26. KPIs para medir el éxito del producto

El proyecto debe medir resultados, no solo cantidad de features.

## Operación

- tiempo para emitir factura,
- tiempo para registrar compra,
- tiempo de cierre mensual,
- tiempo de conciliación,
- porcentaje de procesos automatizados.

## Finanzas

- DSO,
- DPO,
- precisión del cash forecast,
- días de cierre,
- % conciliado automáticamente.

## Inventario

- rotación,
- stockout,
- inventario obsoleto,
- exactitud de inventario,
- forecast accuracy.

## Ventas

- conversión,
- ciclo,
- win rate,
- ticket,
- revenue por vendedor.

## CRM

- tiempo de respuesta a lead,
- oportunidades activas,
- churn,
- NPS/CSAT,
- clientes recurrentes.

## RRHH

- rotación,
- ausentismo,
- costo laboral,
- tiempo de contratación.

## Plataforma

- uptime,
- error rate,
- p95 latency,
- tiempo de recuperación,
- cobertura de tests.

---

# 27. Quick wins recomendados

Mantener los quick wins originales y añadir:

1. Vista 360 de cliente.
2. Centro “Mi día”.
3. Búsqueda global.
4. Alertas de CxC.
5. Alertas de stock.
6. Dashboard ejecutivo.
7. Workflow de aprobación de compras.
8. Conciliación bancaria asistida.
9. Portal básico de cliente.
10. Portal básico de empleado.
11. Estado de cuenta con envío.
12. Vista de rentabilidad por cliente.
13. Forecast de caja 30/60/90.
14. Sugerencia de reorden.
15. Gestión documental transversal.

---

# 28. Riesgos ampliados

| Riesgo | Mitigación |
|---|---|
| Convertir el proyecto en una colección de CRUDs | Definition of Done universal |
| Fase 0 demasiado larga | Quick wins + tracks paralelos |
| Migración rompe nómina | Paralelo legacy/nuevo |
| Analytics diverge | Reconciliación automática |
| Reglas fiscales quedan obsoletas | Motor parametrizable + tests |
| Integraciones frágiles | API/webhooks + retries + idempotencia |
| Multiempresa genera deuda | No implementar runtime multi-tenant antes de justificarlo |
| IA toma decisiones incorrectas | Human-in-the-loop + permisos + auditoría |
| Datos duplicados | MDM + deduplicación |
| Workflow se vuelve spaghetti | Motor declarativo versionado |
| Reportes lentos | Capa analítica + índices + cache |
| Demasiadas features sin adopción | KPIs de uso y valor |
| Seguridad como tarea final | Security gates por fase |
| Falta de recuperación | Restore tests periódicos |
| Verticales contaminan core | Core ERP + módulos verticales desacoplados |

---

# 29. Roadmap consolidado

| Fase | Resultado empresarial |
|---|---|
| 0 | Plataforma confiable y segura |
| 1 | Información y decisión |
| 2 | CRM 360 |
| 3 | ERP financiero/compras/tesorería |
| 4 | Supply Chain + Producción |
| 5 | Proyectos + servicios |
| 6 | HCM empresarial |
| 7 | Activos + Field Service + verticales |
| 8 | Automatización/BPM |
| 9 | Integraciones/API/ecosistema |
| 10 | Mobile/omnichannel |
| 11 | IA empresarial |
| 12 | Seguridad/compliance/DR |
| 13 | Multiempresa/SaaS |
| 14 | Extensibilidad/product platform |

---

# 30. Arquitectura conceptual objetivo

```text
                           ┌─────────────────────────┐
                           │       USUARIOS          │
                           │ Web · PWA · Portales    │
                           └────────────┬────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │      EXPERIENCE LAYER       │
                         │ Dashboards · Workspaces     │
                         │ Search · Notifications      │
                         └──────────────┬──────────────┘
                                        │
        ┌───────────────────────────────▼──────────────────────────────┐
        │                    BUSINESS APPLICATIONS                     │
        │                                                              │
        │ CRM │ Sales │ Service │ Finance │ Purchasing │ Inventory     │
        │ HR  │ Payroll │ Projects │ Production │ Assets │ Tax        │
        │ Hospital │ Hotel │ Marketing │ Treasury │ Quality            │
        └───────────────────────────────┬──────────────────────────────┘
                                        │
             ┌──────────────────────────▼──────────────────────────┐
             │                  BUSINESS PLATFORM                  │
             │                                                      │
             │ Workflow │ Rules │ Events │ Audit │ Documents       │
             │ Notifications │ Sequences │ Approvals │ Search      │
             │ Master Data │ Permissions │ Scheduler               │
             └──────────────────────────┬──────────────────────────┘
                                        │
             ┌──────────────────────────▼──────────────────────────┐
             │                    DATA PLATFORM                    │
             │                                                      │
             │ MySQL Transactional │ Analytics │ Cache             │
             │ Event Store │ Logs │ Files │ Backups                │
             └──────────────────────────┬──────────────────────────┘
                                        │
             ┌──────────────────────────▼──────────────────────────┐
             │                  INTEGRATION LAYER                  │
             │                                                      │
             │ API │ Webhooks │ Banks │ SAR │ Payments             │
             │ WhatsApp │ Email │ E-commerce │ Biometrics          │
             └──────────────────────────┬──────────────────────────┘
                                        │
             ┌──────────────────────────▼──────────────────────────┐
             │                    INTELLIGENCE                    │
             │                                                      │
             │ BI │ Forecasting │ Anomaly Detection │ Copilot      │
             │ Recommendations │ AI Agents                         │
             └─────────────────────────────────────────────────────┘
```

---

# 31. Prioridad real de ejecución

La prioridad no debe ser “hacer más módulos”. Debe ser:

### P0 — Fundacional
- arquitectura,
- seguridad,
- auditoría,
- periodos,
- eventos,
- MDM,
- workflow,
- testing,
- migraciones.

### P1 — Valor empresarial inmediato
- dashboard ejecutivo,
- CRM 360,
- pipeline,
- cobranza,
- compras end-to-end,
- centros de costo,
- presupuesto,
- conciliación bancaria,
- cash forecast.

### P2 — Diferenciación ERP
- demand planning,
- MRP,
- producción integrada,
- proyectos,
- service,
- supplier/customer portals,
- mobile.

### P3 — Escala
- API,
- integraciones,
- observabilidad,
- multiempresa,
- performance,
- DR.

### P4 — Inteligencia
- Copilot,
- forecasting,
- anomalías,
- automatización inteligente,
- agentes.

---

# 32. Decisiones que deben cerrarse antes de construir

Estas decisiones evitan deuda futura:

1. ¿Multiwork será principalmente producto para una empresa/grupo o SaaS multi-tenant?
2. ¿Qué módulos son core y cuáles son verticales?
3. ¿Producción y Hotel regresan al roadmap central?
4. ¿Hospital es producto vertical o parte del ERP core?
5. ¿Se requiere facturación electrónica SAR y en qué horizonte?
6. ¿Qué bancos se integrarán primero?
7. ¿Qué pasarela de pagos se soportará?
8. ¿WhatsApp Business API será canal oficial?
9. ¿Cuál será el proveedor de almacenamiento documental?
10. ¿Cuál será la política de backups/RPO/RTO?
11. ¿Qué roles estándar tendrá el sistema?
12. ¿Qué procesos requieren doble aprobación?
13. ¿Qué empresas usarán centros de costo/proyectos?
14. ¿Se necesita consolidación de grupo?
15. ¿Qué nivel de configuración sin código se quiere ofrecer?
16. ¿Cuál será la estrategia comercial: instalación, licencia, SaaS o híbrida?

---

# 33. Criterio final de éxito

Multiwork 2.0 puede considerarse un **ERP/CRM empresarial completo** cuando una empresa pueda ejecutar dentro de la plataforma, sin depender de Excel como sistema paralelo:

- captar y convertir clientes,
- cotizar y vender,
- entregar,
- facturar,
- cobrar,
- atender clientes,
- comprar,
- recibir,
- almacenar,
- producir cuando aplique,
- pagar,
- conciliar bancos,
- contabilizar,
- declarar impuestos,
- presupuestar,
- controlar costos,
- administrar proyectos,
- administrar empleados y nómina,
- administrar activos,
- administrar mantenimiento,
- analizar resultados,
- aprobar operaciones,
- automatizar procesos,
- integrarse con terceros,
- trabajar desde móvil,
- consultar información desde portales,
- auditar operaciones,
- recuperarse ante fallos,
- y utilizar inteligencia artificial de forma controlada.

La prueba definitiva no será “tenemos X módulos”.

Será:

> **Una operación comercial puede comenzar en CRM, convertirse en una transacción, impactar inventario, contabilidad, impuestos y tesorería, generar cobranza, producir indicadores, disparar alertas/workflows y terminar en una decisión gerencial, manteniendo trazabilidad completa de principio a fin.**

Ese es el salto de Multiwork desde **sistema de registro** hacia **sistema operativo empresarial**.
