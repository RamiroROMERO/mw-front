# Mapeo `controles_hw.vcx` / `calendarhw.vcx` → `@Components`

> Paso 1 del plan de implementación de `specs/02-framework-compartido.md`. Solo diagnóstico — no se crea código en este paso.
>
> Fuente verificada: `C:\Users\Admin\Desktop\forms-prgs\clases\controles_hw.vc2` y `calendarhw.vc2` (texto plano FoxBin2Prg, fiel al `.vcx` binario original — ver `MIGRATION_PLAN.md`).

## Nota sobre el conteo de clases

El spec (y el resumen de `MIGRATION_PLAN.md`) hablan de "29 clases" en `controles_hw.vcx`. Al extraer directamente los `DEFINE CLASS` del `.vc2` real aparecieron **33**, no 29 — `MIGRATION_PLAN.md` nunca las enumeró todas, solo dio una muestra de 17 + 3 de infraestructura.

Decisión (confirmada con el usuario durante la implementación): mantener el número **29** del spec, excluyendo del mapeo las 4 clases que no son controles genéricos reutilizables entre pantallas, sino piezas atadas a una sola pantalla o duplicados:

| Clase excluida | Motivo |
|---|---|
| `controlpanel2` | Variante/duplicado de `controlpanel` (mismo rol, contenedor en vez de pageframe) — `controlpanel` + `controlpanelbtn` ya cubren el patrón real (ver fila `controlpanel` abajo, cubierto por `@Components/controlPanel`). |
| `logon_usuarios` | Contenedor específico de la pantalla de login, no reutilizable en otras pantallas. |
| `mainmenuitem` | Ítem específico del menú principal, no un control genérico. |
| `niveles` | Widget específico de negocio ("Muestra los niveles de un tanque") — vertical industrial/agrícola puntual, no reutilizable. |

Con esa exclusión quedan exactamente 29 clases de `controles_hw.vcx` + 2 de `calendarhw.vcx` = **31 filas**, como pide el spec.

## Tabla de mapeo

| Clase VFP | Base VFP | Componente @Components | Estado | Notas |
|---|---|---|---|---|
| `barra` | container | `@Components/progressBar` | Crear nuevo | Barra progresiva de porcentaje. Confirmado en Data model del spec. |
| `checkbox_hw` | checkbox | `@Components/checkbox` | Cubierto | `Checkbox.jsx` ya envuelve el checkbox nativo con `IntlMessages`. |
| `combobox_hw` | combobox | `@Components/SearchSelect`, `@Components/simpleSelect` | Cubierto | Dos variantes ya existentes (react-select vs `<select>` nativo) según el caso. |
| `commandbutton_hw` | commandbutton | reactstrap `Button` (sin wrapper propio) | Cubierto parcial | No hay un `@Components/button` dedicado; el estilo se resuelve directo con `Button` de reactstrap + `IntlMessages` en cada pantalla (patrón visto en `controlPanel/index.jsx`). Evaluar si vale la pena un wrapper cuando se porten pantallas con botonera repetida. |
| `controlpanel` | pageframe | `@Components/controlPanel` | Cubierto | `controlPanel/index.jsx` ya replica el patrón (tabs Home/Options/Admin + botonera New/Search/Save/Print/Delete/Cancel). |
| `controlpanelbtn` | commandbutton | `@Components/controlPanel` | Cubierto | Los botones de `controlPanel/index.jsx` (`btn-control-panel`) ya cubren este rol, no como componente aparte. |
| `crud_mw` | custom | — | No aplica (infraestructura) | Patrón CRUD legacy, ya cubierto por `BaseService`/`ModelService`/`CustomModelService` en `mw-back` (ver Decisions del spec). |
| `crudvfp` | custom | — | No aplica (infraestructura) | Misma familia que `crud_mw` (posible variante/versión anterior), mismo reemplazo. |
| `currency_mw` | container | `@Components/currencyInput` | Crear nuevo | Confirmado en Data model del spec. |
| `dashcardvalues` | container | `@Components/cards` (`DashCard.jsx`), `@Components/cardTotals` | Cubierto | Verificación pedida por el spec: sí está cubierto. `DashCard.jsx` (icono+título+valor) y `CardTotals.jsx` (grid de tarjetas de valor) ya resuelven el rol de "mostrar valores tipo dashboard". No se agrega a la lista de componentes nuevos. |
| `editbox_hw` | editbox | `@Components/inputFields` | Cubierto | `InputField` envuelve `Input` de reactstrap; `type="textarea"` cubre el caso multilínea. |
| `functions_mw` | custom | — | No aplica (infraestructura) | Utilidades globales; ya evaluado en `MIGRATION_PLAN.md` como candidato a mapear contra `@Helpers/*` existente, no un componente. |
| `gradiente` | container | CSS (tema/`@Helpers/ThemeColors`) | Cubierto parcial | Es un contenedor puramente decorativo (fondo degradado); se resuelve con estilos/CSS del tema, no necesita componente React dedicado. Reevaluar si alguna pantalla porteada necesita el gradiente como pieza reutilizable. |
| `grid_hw` | grid | `@Components/reactTable`, `@Components/XReactTable` (`XReactTable.jsx`), `@Components/reactTableEdit` | Cubierto | Sin tabla nueva, según el scope del spec. `reactTable`/`XReactTable` cubren grilla de solo lectura con paginación/orden/filtro; `reactTableEdit` cubre edición inline de celdas. Huecos puntuales (columnas congeladas, totales de pie de grilla, etc.) quedan para detectarse cuando se porte el primer formulario que use `grid_hw` intensivamente — no se investigan a fondo en esta spec. |
| `image_hw` | image | `<img>` nativo | Cubierto parcial | No hay wrapper genérico; `@Components/profileImage` es específico de foto de perfil. Un `<img className="img-fluid" />` nativo resuelve el caso general. |
| `label_hw` | label | `@Components/inputLabel` | Cubierto | `InputLabel.jsx` + `IntlMessages` ya cubren el rol de etiqueta con estilo Multiwork. |
| `listbox_hw` | listbox | `@Components/SearchSelect` | Cubierto parcial | `SearchSelect` (react-select) cubre selección de lista con búsqueda; no hay un listbox de selección múltiple persistente en pantalla. Confirmar si algún formulario portado necesita ese modo antes de crear algo nuevo. |
| `mensage_hw` | timer | `@Components/common/react-notifications` | Cubierto | Timer que muestra/oculta un mensaje temporal — ya resuelto por el sistema de notificaciones (`NotificationManager`/`NotificationContainer`, con auto-dismiss). |
| `numbox_hw` | textbox | `@Components/inputFields` | Cubierto | `InputField` con `type="number"`. |
| `optionbutton_hw` | optionbutton | `@Components/radioCustom` | Cubierto | `RadioItem`/`RadioCustom` cubren el radio button individual con estilo Multiwork. |
| `optiongroup_hw` | optiongroup | `@Components/radioGroup` | Cubierto | `RadioGroup.jsx` arma el grupo completo a partir de `options`. |
| `page_hw` | page | reactstrap `TabPane` | Cubierto | Se usa en pareja con `pageframe_hw`; ya visto en uso dentro de `controlPanel/index.jsx`. |
| `pageframe_hw` | pageframe | reactstrap `Nav`/`TabContent` | Cubierto | Mismo patrón que `controlpanel`, sin componente propio adicional: se arma con `Nav`/`NavItem`/`TabContent` de reactstrap. |
| `paginatedcursor` | custom | `@Components/reactTable` (`PaginationBackend.jsx`) | No aplica (infraestructura) | Lógica de paginación de datos, no un control visual — el rol ya lo cumple `PaginationBackend.jsx` dentro del ecosistema de `reactTable`. |
| `shape_hw` | shape | `@Components/common` (`CustomBootstrap.jsx` → `Separator`/`SeparatorV`) | Cubierto | Separador/línea divisoria, mismo rol que `shape_hw` como elemento decorativo simple. |
| `spiner_hw` | spinner | `@Components/spinner` | Crear nuevo | Confirmado en Data model del spec. Distinto de `@Components/loading` (overlay de página completa) — `spiner_hw` es un indicador inline. |
| `switch` | container | `@Components/switchToggle` | Crear nuevo | Confirmado en Data model del spec. |
| `textbox_hw` | textbox | `@Components/inputFields` | Cubierto | `InputField` con `type="text"` (default). |
| `timer_hw` | timer | — | No aplica (infraestructura) | Timer genérico; se resuelve con `useEffect`/`setTimeout` estándar de React caso por caso, no amerita componente. |
| `calendar` (`calendarhw.vcx`) | container | `@Components/dateCalendar` | Cubierto | `react-datepicker`, ya es la única librería de calendario en uso (ver CLAUDE.md). |
| `calendarday` (`calendarhw.vcx`) | container | `@Components/dateCalendar`, `@Components/dateTimeCalendar` | Cubierto | Selección de día individual, cubierta por las mismas variantes de `react-datepicker`. |

## Resumen por Estado

| Estado | Cantidad |
|---|---|
| Cubierto | 18 |
| Cubierto parcial | 4 |
| Crear nuevo | 4 |
| No aplica (infraestructura) | 5 |
| **Total** | **31** |

Coincide con las 31 filas de la tabla principal (29 de `controles_hw.vcx` + 2 de `calendarhw.vcx`).

## Catálogo de modales genéricos (Paso 2)

Fuente: los 20 formularios `.sc2` en `C:\Users\Admin\Desktop\forms-prgs\formas\` cuyo nombre empieza con `err_`/`error_`. Revisados uno por uno (controles usados y lógica de cada `PROCEDURE`, no solo el nombre del archivo — varios nombres son engañosos, ver nota más abajo).

### Corrección de contenido vs. nombre

El candidato inicial del spec asumía `err_select_value.scx` → "seleccionar valor de lista". Al leer el formulario real, su único control de entrada es un `Numbox_hw` (numérico) con un título dinámico (`Lparameters cTitle`) — es un prompt numérico genérico ("Confirmar" + número + Aceptar/Cancelar), no una lista. El patrón real de "seleccionar un valor de una lista corta" lo cubre mejor `err_seleemp.scx` (combobox con opciones cargadas desde un cursor) y la familia `err_sele_*` (optiongroup de 2 opciones). Se corrige el mapeo según el contenido, como pide el Riesgo del spec.

### Listado final (7 modales)

| # | Componente | Archivo | Legacy que cubre | Patrón |
|---|---|---|---|---|
| 1 | `SeekTextModal` | `@Components/modals/SeekTextModal.jsx` | `err_seek_text` | Un campo de texto + Aceptar. Devuelve el texto ingresado. |
| 2 | `SelectValueModal` | `@Components/modals/SelectValueModal.jsx` | `err_seleemp`, `err_sele_output_print`, `err_sele_print_clinic`, `err_sele_type_print`, `err_sele_type_print2` | Elegir un valor entre un conjunto pequeño de opciones (`options: [{value,label}]`) — se renderiza como combobox o como grupo de radio según cantidad de opciones — + Aceptar/Cancelar. 5 formularios legacy casi idénticos (mismo layout, solo cambian las opciones y el título) colapsan en este único componente. |
| 3 | `DatePickerModal` | `@Components/modals/DatePickerModal.jsx` | `err_selefecha`, `err_selefecha2` | Selector de fecha; prop `mode: 'single' \| 'range'` cubre tanto fecha única (`err_selefecha`) como rango Desde/Hasta con validación `fechaInicio <= fechaFin` (`err_selefecha2`). |
| 4 | `ConfirmModal` | `@Components/modals/ConfirmModal.jsx` | `error_1`, `error_fpag` | Confirmación de 2 botones con etiquetas configurables (`labels: [string, string]`, default `Sí`/`No`) — cubre tanto el Sí/No genérico (`error_1`) como el caso de botones con texto/ícono propio (`error_fpag`: "Efectivo"/"Transferencia Bancaria"). |
| 5 | `AddDescriptionModal` | `@Components/modals/AddDescriptionModal.jsx` | `err_add_description`, `err_comment`, `err_select_value` | Un campo de entrada + Aceptar(/Cancelar), título y tipo de campo configurables (`type: 'text' \| 'textarea' \| 'number'`). Cubre descripción corta (`err_add_description`), comentario largo (`err_comment`) y el prompt numérico de `err_select_value` (ver corrección arriba). |
| 6 | `MessageModal` | `@Components/modals/MessageModal.jsx` | `error_2`, `error_3`, `error_4` | Mensaje de solo lectura + Aceptar, color/ícono de cabecera según severidad (`variant: 'warning' \| 'info' \| 'help'`). `error_4` agrega botones dinámicos en el legacy (`addbutton`/`fnclickbutton`) — se resuelve con una prop `buttons` opcional en vez de un componente aparte. |
| 7 | `PasswordPromptModal` | `@Components/modals/PasswordPromptModal.jsx` | `error_pass` | Campo de contraseña enmascarado + Aceptar/Cancelar, para confirmar una acción con contraseña de administrador. No estaba en la lista de candidatos original del spec — aparece al revisar el contenido de los 20 formularios. |

### Formularios fuera del catálogo genérico

No encajan en un patrón reutilizable — son composiciones o pantallas específicas de un solo caso; se resuelven cuando se porte esa pantalla puntual (ver Scope del spec: "Crear controles ultra específicos de un solo formulario — se crean cuando se porte ese formulario puntual"):

| Formulario | Motivo |
|---|---|
| `err_admin_options` | Composición de `SelectValueModal` (optiongroup: documento actual vs. rango) + `DatePickerModal` en modo rango — específico del filtro de un reporte, se arma componiendo los dos genéricos al portar esa pantalla, no amerita un tercer componente. |
| `err_date_out_lote` | Formulario de 2 campos (lote + fecha de vencimiento) atado a datos de inventario — específico de esa pantalla, no un diálogo genérico. |
| `err_updateexchange` | No es un modal de confirmación/entrada simple — es una mini-pantalla CRUD con `grid_hw` editable + `crudvfp` (actualización de tipos de cambio). Fuera del alcance de este catálogo. |
