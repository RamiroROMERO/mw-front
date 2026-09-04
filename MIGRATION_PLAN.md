# Plan de migración VFP9 → Multiwork 2.0

> Análisis estructural del legacy Multiwork en Visual FoxPro 9 (`C:\Users\Admin\Desktop\forms-prgs`) y hoja de ruta para completar su migración a esta plataforma. Generado el 2026-09-03 a partir de un análisis estático automatizado — ver [Método](#método-del-análisis).
>
> Versión visual (con tabla, badges y barras): [artifact publicado](https://claude.ai/code/artifact/0974e08e-94ad-4485-9ae0-4505b61f0ece).

## Resumen ejecutivo

El paquete `forms-prgs` es la salida de un conversor **FoxBin2Prg** sobre los binarios reales del sistema Multiwork en VFP9: cada `.scx`/`.vcx`/`.frx` se generó como un `.sc2`/`.vc2`/`.fr2` en texto plano, con una gramática estable (`DEFINE CLASS` / `ADD OBJECT` / `PROCEDURE` para formularios y clases; XML de bandas para reportes). Es el mismo formato que usa la comunidad VFP para versionar binarios en Git, así que es fiel al original y no hubo pérdida de información en la conversión.

Multiwork 2.0 ya tiene bastante camino recorrido: Inventario, Bancos y RRHH están con cobertura fuerte en backend y frontend; Facturación, Contabilidad, Activos Fijos y Hospital están en curso; y dos módulos completos del negocio nuevo — **RRHH y Hotel** — se construyeron desde cero con reglas modernas, sin portar código VFP (el legacy casi no tiene formularios de RRHH y ninguno de Hotel). Del lado opuesto, **Préstamos, Fincas, CCH y CAF** no tienen ni una ruta de backend ni carpeta de frontend — pero ya no son huecos ambiguos: negocio confirmó (2026-09-04) que **Préstamos y CCH nunca se terminaron de implementar** en el legacy (descartados), **CAF** lo usa un solo cliente desactualizado (última prioridad), y **Fincas** tiene 2 clientes activos con contabilidad agrícola distinta al comercio tradicional — y un sistema paralelo (MWDesktop) ya dedicado a ese rubro, a evaluar antes de portar nada.

**Recomendación central:** no migrar formulario por formulario en el orden en que aparecen en la carpeta, sino primero consolidar el framework compartido (controles, diálogos genéricos, patrón CRUD) que reaparece en cientos de pantallas, y luego avanzar por módulo priorizando uso diario real (POS/Facturación, Inventario) sobre pantallas administrativas de baja frecuencia.

**Números del legacy:** 520 formularios (.scx) · 274 reportes (.frx) · 5 librerías de clases (.vcx) · ~372,000 líneas de pseudocódigo · 6 pantallas huérfanas confirmadas por grafo de navegación (una 7ma sospechosa, `inv_prod_copy`, resultó ser funcionalidad activa) · 4 módulos sin cobertura backend, ya resueltos por negocio (ver Fase 0).

## Método del análisis

Con 372,000 líneas repartidas en 799 archivos, la lectura manual archivo por archivo no es viable. Se construyó un extractor (Python, dos pasadas) que recorre cada `.sc2`/`.vc2` con expresiones regulares sobre la gramática FoxBin2Prg y cada `.fr2` sobre su XML de bandas, para obtener por archivo:

- **Definición de clases** — nombre y clase base de cada `DEFINE CLASS` (identifica formularios, contenedores y controles personalizados).
- **Clases externas usadas** — `ClassLib=`/`BaseClass=` de cada `ADD OBJECT` (qué tanto depende cada pantalla del framework `controles_hw.vcx`).
- **Eventos (`PROCEDURE`)** — conteo y nombres, proxy de complejidad de interacción más confiable que solo líneas de código.
- **Grafo de navegación** — `Do Form` / `Report Form` (qué pantallas abren a cuáles).
- **Dependencias de datos** — `SELECT … FROM` y `SQLExec` (tablas y cursores que cada pantalla necesita del backend).
- **Expresiones de reporte** — `<expr>` de cada banda en los `.frx` (qué campos imprime cada reporte).

Ese inventario estructurado se cruzó contra el estado real de `mw-front` (archivos por carpeta en `src/views/app/*`) y `mw-back` (archivos por prefijo en `controller/`, `services/`, `models/`) para medir avance por módulo, no solo tamaño del legacy.

> **Límite conocido del método:** el grafo de navegación captura `Do Form '<literal>'` pero no `Do Form &lcVariable` (destino resuelto en tiempo de ejecución) — esos casos quedan agrupados bajo la etiqueta genérica `ruta` en los datos crudos y necesitan una pasada manual o traza en caliente sobre el sistema real para resolverse.

## Arquitectura del sistema legacy

### Arranque (`multiwork.prg`, 610 líneas)

Es el `.prg` principal: configura la ventana global (`_Screen`), publica ~90 variables `PUBLIC` que actúan como estado global de toda la sesión (usuario, empresa activa, tipo de cambio, flags de módulos habilitados), resuelve la conexión MySQL vía ODBC (`SQLStringConnect`) y lanza `Do Form 'MenuP'` seguido de `Read Events` — el bucle de eventos clásico de VFP. La tabla `Config.dbf` local decide a qué servidor conectarse, y `mw_setting`/`sgh_empresas` en el servidor traen la configuración de la empresa (logo, moneda, flags `nIs_Coffee`, `nIs_Farms`, `nIs_Hospital`, etc. — **feature flags por cliente**, ya que Multiwork es white-label).

> ⚠️ **Detalle a no heredar:** hay una verificación explícita del nombre de PC (`InList(cNamePC,'RAMIROPC','RAMIRO','RAMIRO-PC')`) que habilita rutas de desarrollo/depuración distintas — es una puerta de desarrollador, no debe existir equivalente en la versión web.

### Framework de UI compartido — `controles_hw.vcx`

29 clases que envuelven cada control nativo de VFP con el look & feel de Multiwork (paleta, fuente Calibri, comportamiento estándar). Es el equivalente legacy de los componentes en `@Components/*`:

`commandbutton_hw` · `textbox_hw` · `combobox_hw` · `checkbox_hw` · `label_hw` · `editbox_hw` · `grid_hw` · `listbox_hw` · `optiongroup_hw` · `pageframe_hw` · `numbox_hw` · `image_hw` · `spiner_hw` · `switch` · `gradiente` · `dashcardvalues` · `currency_mw`

Tres clases del mismo archivo no son controles visuales sino **infraestructura funcional** y merecen estudio dedicado antes de tocar cualquier formulario que las use: `crud_mw`/`crudvfp` (el patrón CRUD genérico) y `functions_mw` (utilidades globales, candidato a mapear contra `@Helpers/*` existentes para no reimplementar lo que ya tiene equivalente).

### Otras librerías de clases

| Librería | Clases | Estado |
|---|---|---|
| `calendarhw.vcx` | 2 (`calendar`, `calendarday`) | Reemplazable 1:1 — ya cubierto por `react-datepicker` |
| `vfpscrollbar.vcx` / `vfpscrollbar2.vcx` | 16 c/u, duplicadas | Descartable — el navegador ya resuelve el scroll |
| `seguridad.vcx` | 8 (AES, Blowfish, MD5, RSA, SHA1, sustitución, Vernam, Vigenère) — 4,329 líneas | **Auditado (2026-09-04) — no migrar.** Ver detalle abajo. |

#### Auditoría de `seguridad.vcx` (2026-09-04) — no migrar

De las 8 clases, las 823 instancias de `ADD OBJECT ... ClassLib="seguridad.vcx"` repartidas en ~150 formularios son en su gran mayoría objetos "muertos": se agregan por una plantilla base heredada pero nunca se invoca ningún método (`Codificar`/`Decodificar`) sobre ellos — confirmado grepeando invocaciones reales de método, no solo la presencia del objeto. Solo **8 formularios** llaman código de cifrado de verdad:

- **7 formularios usan SHA1 exclusivamente para hashear contraseñas/PIN** antes de comparar contra la BD: `set_users.sc2` y `mw_login.sc2`/`mw_editpass.sc2`/`login.sc2` (contraseña de usuario), `Fac_SeleCaja.sc2`/`fac_pos_open_cash.sc2`/`fac_caja_open.sc2` (PIN de apertura de caja). Es autenticación, no cifrado de datos de negocio en reposo — ya cubierto por bcrypt/JWT en `mw-back`.
- **`criptfiles.sc2`** es el único que usa RSA para cifrar/descifrar archivos de texto arbitrarios — y es un formulario **huérfano**: no lo invoca ningún otro `.sc2` del sistema (ni el menú), es una utilidad de desarrollador aislada.

**Conclusión:** ninguna clase de `seguridad.vcx` necesita portarse. No cifra datos de negocio ni interopera con otro sistema.

### Diálogos genéricos compartidos (`err_*` / `error_*`)

20 formularios pequeños (194 líneas en promedio) que se repiten constantemente en el grafo de navegación: `err_seek_text` (buscar texto), `err_select_value`, `err_add_description`, `err_selefecha` (selector de fecha), etc. Son ventanas modales genéricas parametrizables — el mismo rol que hoy cumplen `ModalDetail.jsx` / `ModalAddEditProvider.jsx` en el módulo de Hospital que ya se está construyendo. Vale la pena consolidar un set pequeño (5–8) de modales genéricos reutilizables en `@Components` antes de portar módulos completos.

## Inventario por módulo

Formularios y reportes agrupados por prefijo de archivo (que corresponde 1:1 al dominio de negocio, ej. `fac_` = Facturación, `bco_` = Bancos), cruzados con el estado real de `mw-front`/`mw-back`. "Backend" cuenta archivos en `controller/` · `services/` · `models/` que empiezan con el prefijo equivalente (c = controllers, s = services, m = models).

| Módulo | Formularios (líneas) | Reportes | Backend (mw-back) | Frontend (archivos) | Estado |
|---|---|---|---|---|---|
| Inventario `inv_*` | 95 (114,413) | 54 | 39c · 20s · 19m | 180 | ✅ avanzado |
| Facturación / POS `fac_*` | 127 (112,287) | 116 | 20c · 10s · 10m | 98 | 🟡 en curso |
| Contabilidad `cont_*` | 99 (79,359) | 50 | 22c · 0s · 23m | 50 | 🟡 backend > frontend |
| Bancos `bco_*` | 40 (37,257) | 32 | 32c · 12s · 20m | 63 | ✅ avanzado |
| Hospital `hosp_/med_/lab_` | 28 (17,659) | 3 | 10c · 2s · 8m | 61 | 🟡 en curso activo |
| Impuestos `imp_*` | 17 (14,333) | 4 | 6c · 2s · 9m (naming `tax*`/`adminTax*`, no `imp_*`) | 37 | 🟡 en curso — mejor cubierto de lo que parecía |
| Activos Fijos `af_*` | 14 (12,009) | 2 | 6c · 0s · 6m | 25 | 🟡 en curso |
| Configuración `set_*` | 14 (11,153) | 0 | sin prefijo propio | — (dentro de settings) | ⚪ confirmar mapeo |
| Préstamos `loans_*` | 7 (6,286) | 3 | 0 | 0 | 🔴 vacío total |
| Fincas/Farms `fnc_*` | 8 (4,578) | 2 | 0 | 0 | 🔴 vacío · posible opcional |
| CCH `cch_*` | 5 (3,550) | 2 | 0 | 0 | 🔴 vacío + significado ambiguo |
| CAF `caf_*` | 5 (<3,000) | 0 | 0 | 0 | 🔴 vacío + significado ambiguo |
| Núcleo/compartido `mw_/err_/login/menu/admin` | ~62 (~21,000) | — | transversal | transversal | 🔵 framework, portar primero |
| RRHH `rrhh_*` | 1 (281) | 0 | 66c · 2s · 63m | 317 | 🔵 reconstruido desde cero |
| Hotel (sin prefijo legacy) | 0 | 0 | 19c · 20s | 82 | 🔵 reconstruido desde cero |

> Los conteos de backend son por prefijo de nombre de archivo; algunos módulos nuevos usan el patrón Controller+Routes+Service documentado en `mw-back/CLAUDE.md` y no siempre coinciden 1:1 con el prefijo legacy — tratar como estimación de cobertura, no como cifra exacta.

## Formularios más complejos y duplicados a descartar

El promedio de líneas por formulario en Inventario (1,204) casi duplica el del resto del sistema — son pantallas con mucha lógica de negocio embebida (costeo, kardex, órdenes de compra), no solo layout. Los 10 más complejos:

| Formulario | Líneas | Eventos | Módulo |
|---|---|---|---|
| `fac_pos.sc2` | 7,873 | 149 | Facturación · POS — pantalla núcleo del negocio |
| `cont_reportes.sc2` | 7,112 | 57 | Contabilidad |
| `fac_facturacion.sc2` | 5,895 | 107 | Facturación |
| `inv_compras.sc2` | 5,822 | 71 | Inventario |
| `fac_pos_hosp.sc2` | 5,226 | 117 | Facturación (variante Hospital) |
| `cont_flujoefect.sc2` | 4,501 | 45 | Contabilidad — flujo de efectivo |
| `fac_recibos2.sc2` | 4,236 | 76 | Facturación |
| `inv_oc3.sc2` | 3,940 | 55 | Inventario — órdenes de compra |
| `bco_cheques.sc2` | 3,930 | 74 | Bancos |
| `inv_proc_reintegros.sc2` | 3,754 | 71 | Inventario |

> ⚠️ **No migrar por triplicado — confirmado por grafo de navegación (2026-09-04):** se detectaron 7 formularios sospechosos de ser versiones obsoletas. Se verificó cuáles reciben algún `Do Form` desde **otro** archivo del sistema (no auto-referencias) para separar huérfanos reales de falsos positivos:
> - **Huérfanos confirmados, descartar sin más análisis:** `inv_compras_back.sc2`, `inv_compras_old.sc2`, `inv_compras_old2.sc2` (junto a `inv_compras.sc2` suman 21,027 líneas casi redundantes), `fac_pos_close_old.sc2`, `fac_pos_v2.sc2`, `menu_child_test.sc2` — ninguno es invocado desde ningún otro formulario del legacy. `inv_compras.sc2` es la única versión con navegación real hacia otras pantallas (aunque el propio dashboard `menup.sc2` abre el formulario de captura vía `Do Form &lcVariable`, no resuelto por este análisis estático — de todos modos, al ser la única sin sufijo de respaldo y la única con referencias entrantes, es la vigente).
> - **Falso positivo — reclasificado:** `inv_prod_copy.sc2` **no es un duplicado**, es la pantalla real de "Copiar Producto" (Caption confirmado), invocada activamente desde `inv_products.sc2` (`Do Form Ruta + '\Formas\inv_prod_copy'`). Debe tratarse como funcionalidad normal a portar junto con Inventario, no descartarse.

## Reportes (.frx) — layout atado a cursores efímeros

Los `.frx` no traen su propia consulta: cada banda referencia campos de un cursor (`cur_salida`, `cur_deta1`, `cont_pda2`…) que el formulario que **llama** al reporte arma justo antes con `SQLExec`. Eso significa que un reporte no se puede portar de forma aislada — su migración va empaquetada con la del formulario de origen, y el verdadero contrato a preservar es la consulta SQL detrás del cursor, no el archivo de reporte en sí.

116 de los 274 reportes (42%) pertenecen a Facturación — coherente con que sea el módulo con más impresión de documentos fiscales (facturas, recibos, notas). Los cursores más reutilizados entre formularios (`cur_salida` en 27 pantallas, `cont_pda2` en 17) son buenos candidatos a convertirse en un endpoint de reporte genérico y parametrizable en `mw-back`, en vez de un endpoint por pantalla.

El patrón `adapters/pdf.js` que ya existe en `mw-back` (fuente, logo, guardado unificado) es el lugar correcto para esta nueva generación de reportes.

## Módulos ya reconstruidos desde cero

RRHH y Hotel no son trabajo pendiente de migración: son módulos que Multiwork 2.0 ya construyó con reglas de negocio actuales, sin base VFP que portar.

- **RRHH** — el legacy solo tiene 1 formulario relacionado (`rrhh_employees_seek`, referenciado desde Inventario, no un módulo propio). mw-back ya tiene 66 controllers y 63 models `rrhh*`, y mw-front 317 archivos en `humanResources` — el módulo más grande de todo el frontend actual.
- **Hotel** — cero formularios con prefijo `hotel` en el legacy. Es probable que se haya inspirado conceptualmente en `hosp_rooms.sc2` (habitaciones de Hospital) pero no hay un formulario a portar 1:1 — ya tiene 19 controllers, 20 services y 82 archivos de frontend.

## Vacíos reales y ambigüedades a resolver antes de planificar esfuerzo

### Módulos sin ningún avance — decisiones cerradas (2026-09-04)

- **Préstamos** (7 formularios) — nunca se terminó de implementar en el legacy. **Descartado**, no migrar.
- **CCH** (5 formularios) — cajas chicas contabilizadas, tampoco se terminó de implementar. **Descartado**, no migrar.
- **CAF** (5 formularios; no confundir con `af_*` Activos Fijos, dominios distintos) — usado por un solo cliente, desactualizado hace mucho. **Fase 6, última prioridad.**
- **Fincas / Farms** (8 formularios) — **2 clientes activos**, contabilidad agrícola muy distinta al comercio tradicional en Honduras, y ya existe un producto separado (**MWDesktop**) para ese rubro. No es un módulo más a portar 1:1 — necesita su propio análisis de alcance antes de estimar (¿se integra con MWDesktop, se reemplaza, o se porta en paralelo?). **Fase 6, tratar como mini-proyecto propio.**

### Preguntas cerradas por investigación técnica (2026-09-04)

1. **Impuestos** — resuelto: sí existen bajo naming en inglés (`tax*`/`adminTax*`), no `imp_*`. Backend real: 6 controllers · 2 services · 9 models (`AdminTaxDocumentController`, `AdminTaxTypeController`, `taxSetWithholdingTypes`, `taxProcWithholdingReceipts`, `taxProcWithholdingReceiptDetail`, `taxCalendar`, `taxReportTypes`, `taxRepositoryData`, `taxStatNames`). Tabla de inventario ya actualizada arriba.
2. **7 formularios duplicados/obsoletos** — resuelto por grafo de navegación: 6 son huérfanos confirmados (ninguna otra pantalla los invoca) y se descartan sin más análisis; `inv_compras.sc2` es la versión vigente (única sin sufijo de respaldo, única con navegación entrante real); `inv_prod_copy.sc2` **no era un duplicado** — es la pantalla real de "Copiar Producto", activa y referenciada — se reclasificó como funcionalidad normal de Inventario. Detalle en la sección de formularios complejos, arriba.
3. **`seguridad.vcx`** — resuelto: no cifra datos de negocio, solo hashea contraseñas/PIN (ya cubierto por bcrypt/JWT) más una utilidad de desarrollador huérfana (`criptfiles.sc2`). No migrar. Detalle arriba.

### Preguntas de negocio — cerradas por el dueño de producto (2026-09-04)

Investigación técnica previa en la base de datos real del cliente **Centro de Urgencias Médicas** (`cum_clinic`) había mostrado las tablas legacy `cch_*`, `caf_*`, `fnc_*` y `loans_*` en 0 filas y flags apagados — consistente con que ese cliente (Hospital) nunca los usó. Las respuestas de negocio para el resto de la cartera de clientes:

1. **CCH** — módulo de cajas chicas contabilizadas, pensado como algo separado de Multiwork pero que implicaba contabilidad; **nunca se terminó de implementar** en el legacy. No hay cliente usándolo porque nunca estuvo completo. **Decisión: no migrar** — no hay funcionalidad completa que portar.
2. **CAF** — lo usa **un solo cliente**, y está desactualizado desde hace mucho tiempo. **Decisión: Fase 6, prioridad más baja de todas** (al final de todo).
3. **Préstamos** — no está terminado en el legacy, igual que CCH. **Decisión: descartar**, no migrar.
4. **Fincas** — **2 clientes activos** la usan hoy, pero con reglas contables completamente distintas al comercio tradicional en Honduras. Dato clave: **ya existe un "MWDesktop" separado** dedicado a ese rubro (empresas agrícolas) — Fincas no es solo un módulo más de Multiwork 2.0, es potencialmente una integración con (o migración de) ese sistema paralelo. **Decisión: no descartar** — replantear como su propio mini-proyecto en la Fase 6, empezando por entender el alcance de MWDesktop antes de estimar cualquier port.

## Plan de acción por fases

Orden pensado por dependencia (el framework compartido bloquea a todo lo demás) y por impacto de negocio (pantallas de uso diario antes que administrativas), no por el orden alfabético de los prefijos.

### Fase 0 — Cerrar preguntas abiertas y descartar duplicados
*Antes de estimar cualquier módulo — evita re-trabajo*
- ✅ Impuestos, duplicados/`inv_prod_copy` y `seguridad.vcx` cerrados por investigación técnica (2026-09-04) — ver detalle arriba.
- ⚪ Pendiente: negocio confirma CCH, CAF, Préstamos y Fincas — ¿algún cliente white-label activo (fuera de `cum_clinic`, que los tiene en 0) los usa hoy?

### Fase 1 — Framework compartido
*Base reutilizable — todo lo demás se apoya en esto*
- Mapear las 29 clases de `controles_hw.vcx` contra los componentes ya existentes en `@Components/*`; documentar equivalencias y huecos.
- Consolidar 5–8 modales genéricos a partir del catálogo `err_*`/`error_*` (búsqueda, selección de valor, selector de fecha, confirmación) — extender el patrón que ya se está usando en `ModalDetail.jsx`.
- Definir el reemplazo del patrón `crud_mw`/`crudvfp` contra el CRUD genérico ya existente en `services/` (`BaseService`, `ModelService`).
- Diseñar el endpoint de reporte genérico y parametrizable para reemplazar la dependencia formulario→cursor→.frx.

### Fase 2 — Núcleo operativo diario: Facturación/POS + Inventario
*239K líneas combinadas, los dos módulos más grandes y de uso diario*
- Empezar por `fac_pos.sc2` (7,873 líneas / 149 eventos) — es la pantalla más usada del sistema en producción; su lógica de precios/descuentos/impuestos es la más sensible a errores.
- Portar variantes especializadas de POS (`fac_pos_hosp`, `fac_pos_lab`) reusando la base ya portada, no desde cero.
- En Inventario, priorizar `inv_compras` (una vez descartadas sus 3 copias obsoletas), kardex y órdenes de compra.
- Backend ya es el más maduro de los dos (39 controllers en Inventario) — foco principal aquí es frontend + QA de reglas de negocio, no diseño de API desde cero.

### Fase 3 — Contabilidad y Bancos
*Cerrar el desbalance backend/frontend de Contabilidad*
- Contabilidad tiene backend fuerte (22 controllers, 23 models) pero solo 50 archivos de frontend contra 99 formularios legacy — foco en UI, el backend probablemente ya soporta más de lo que la interfaz expone hoy.
- `cont_reportes.sc2` (7,112 líneas) es el segundo formulario más grande del sistema — planificarlo como su propio hito.
- Bancos ya está avanzado; cerrar los formularios restantes y priorizar conciliación (`bco_cheques.sc2`, el más grande del módulo).

### Fase 4 — Impuestos, Activos Fijos, Configuración
*Módulos medianos, menor frecuencia de uso diario*
- Impuestos: primero reconciliar el mapeo backend real (pregunta 3) antes de estimar lo que falta.
- Activos Fijos: 14 formularios / 6 controllers ya activos — cerrar el resto siguiendo el mismo patrón.
- Configuración (`set_*`): confirmar si ya vive dentro de `settings` con otro naming, o si falta carpeta dedicada.

### Fase 5 — Hospital: continuar el trabajo en curso
*Ya activo; alinear con lo que ya se sabe de este módulo*
- Seguir el patrón ya validado (proveedores por servicio, modales de detalle) y usar el mapeo de campos ya documentado — verificar contra datos reales antes de asumir nombres de columna.
- Solo 3 reportes legacy — bajo riesgo relativo en esa parte.

### Fase 6 — CAF y Fincas (Préstamos y CCH descartados — nunca se terminaron en el legacy)
*Decisiones de negocio cerradas 2026-09-04*
- **Fincas primero, como mini-proyecto propio**: 2 clientes activos, contabilidad agrícola distinta al comercio tradicional en Honduras. Antes de estimar el port, entender el alcance de **MWDesktop** (el sistema separado que ya cubre este rubro) — decidir si Fincas en Multiwork 2.0 significa integrarse con MWDesktop, reemplazarlo, o convivir en paralelo.
- **CAF al final de todo**: un solo cliente, módulo desactualizado hace mucho tiempo. Menor costo relativo (5 formularios) pero también menor urgencia.

### Fase 7 — Corte y descontinuación del sistema VFP
*Cierre del proyecto*
- Plan de migración de datos final (el legacy corre contra MySQL vía ODBC — mismo motor que `mw-back`, lo que simplifica bastante el corte comparado con migrar de un motor distinto).
- Periodo de corrida en paralelo con los módulos de mayor riesgo (POS, Facturación) antes de apagar el cliente VFP para esos clientes.

## Riesgos a vigilar

- **Lógica financiera enterrada en eventos** — cálculos de precio, descuento, impuesto y correlativos de folio viven dentro de `PROCEDURE` de UI, no en una capa de servicio separada. Ya hubo un bug real de este tipo (`generateNextCode()` en `AdminDocumentService.js`) que duplicó números de factura — extraer esta lógica con cuidado.
- **Flags de feature por cliente** — `nIs_Farms`, `nIs_Coffee`, `nIs_Hospital`, etc. El sistema es white-label con módulos on/off por empresa. Cualquier decisión de "no migrar X" debe validarse contra qué clientes tienen ese flag activo hoy.
- **Cursores con nombre genérico reutilizado** — `cur_salida`, `curdeta`, `curdetail` aparecen en decenas de formularios con estructura distinta cada vez, mismo nombre, distinto significado según el formulario. No asumir un esquema único al diseñar el endpoint de reportes genérico de la Fase 1.
- **Nombres de campo no verificados** — igual que ya se documentó para Hospital, los nombres de columna/relación deducidos del código no sustituyen verificar contra datos reales antes de dar por cerrado un mapeo.

## Cómo medir avance

El mismo inventario estructurado generado para este análisis (JSON por formulario/reporte/clase, con líneas, eventos, tablas y navegación) puede re-ejecutarse en minutos y usarse como checklist vivo — igual que `TECH_DEBT.md` ya funciona como checklist para deuda técnica en `mw-front`. Sugerido: una tabla con las 520+274 pantallas, estado (🔴 pendiente / 🟡 en curso / ✅ migrado / 🔵 no aplica) y el módulo de la sección de inventario como agrupador, versionada junto al resto del proyecto.

---

*Generado a partir del análisis estático de `forms-prgs` (FoxBin2Prg v1.21) el 2026-09-03. Las cifras de cobertura backend/frontend son un proxy por convención de nombres, no una auditoría exhaustiva de rutas activas.*
