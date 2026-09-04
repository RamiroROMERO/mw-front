# SPEC 02 — Framework compartido para la migración VFP9 → web

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-09-03
> **Objetivo:** Sentar la base de componentes y decisiones compartidas — mapeo de controles_hw.vcx a @Components, catálogo nuevo de modales genéricos, y las decisiones sobre CRUD y Zod — sobre la que se apoyará cada spec de pantalla/módulo migrado.

## Scope

**In:**

- Tabla de mapeo de las 29 clases de `controles_hw.vcx` → su componente equivalente en `@Components` (o "resuelto por infraestructura, no aplica" para `crud_mw`/`functions_mw`).
- Crear en `@Components` los controles genéricos y reutilizables que falten (lista concreta en la sección Data model) — verificando primero si ya existe un equivalente parcial (ej. confirmar si `cards`/`cardTotals` ya cubre `dashcardvalues` antes de crear uno nuevo).
- Para `grid_hw`: sin tabla nueva — documentar el mapeo a `reactTable`/`XReactTable`/`reactTableEdit` y anotar los huecos puntuales detectados (el ajuste real se hace cuando se porte el formulario que lo necesita, no en esta spec).
- Catálogo de 5–8 modales genéricos **nuevos**, construidos sobre el shell ya existente `@Components/modal`, cubriendo los patrones más repetidos del catálogo `err_*`/`error_*` (buscar texto, seleccionar valor de lista, seleccionar fecha, confirmar acción, agregar descripción, mensaje/error).
- Documentar que el patrón CRUD legacy (`crud_mw`/`crudvfp`) no se replica — ya cubierto por `BaseService`/`ModelService`/`CustomModelService` de `mw-back` (sin cambios de código en esta spec).
- Decisión y contrato de integración Zod ↔ `useForm`: `useForm` (`src/hooks/useForms.js`) se extiende para aceptar un schema de Zod como alternativa a su formato actual de `formValidations` (tuplas `[fn, mensaje]` por campo), manteniendo compatibilidad hacia atrás para pantallas aún no migradas. Acá se documenta el contrato, no el código (ver "Out of scope").

**Out of scope (for future specs):**

- Escribir los schemas de Zod concretos de cada pantalla/módulo — van en cada spec de pantalla, a medida que se migra.
- Implementar la extensión de `useForm` para soportar Zod — la hace el primer módulo/pantalla que lo necesite.
- El espejo de esta spec en `mw-back` (reemplazo de `validations/*.js` por Zod, y el endpoint de reporte genérico) — spec propia en `mw-back/specs`.
- Migrar retroactivamente los módulos de backend que hoy usan `validations/*.js` — queda para el final del proyecto de migración.
- Portar los modales específicos de Hospital (`ModalDetail.jsx`, `ModalAddEditProvider.jsx`, `ModalEditService.jsx`) al catálogo genérico — quedan como están hasta retomar ese módulo.
- Crear controles ultra específicos de un solo formulario — se crean cuando se porte ese formulario puntual.
- Cualquier pantalla de negocio concreta (`fac_pos`, `cont_reportes`, etc.) — son specs futuras que dependen de esta.

## Data model

**Tabla de mapeo** (`specs/02-framework-compartido/mapping.md`, subcarpeta junto al spec, mismo patrón que usa `mw-back/specs/01-.../progress.md`):

Una fila por cada una de las 29 clases de `controles_hw.vcx` + las 2 de `calendarhw.vcx`:

| Clase VFP | Base VFP | Componente @Components | Estado | Notas |
|---|---|---|---|---|

`Estado` ∈ `Cubierto` / `Cubierto parcial` / `Crear nuevo` / `No aplica (infraestructura)`.

**Componentes nuevos a crear** (tras verificar en el paso 1 del plan que no existen ya):

```
@Components/spinner         // reemplaza spiner_hw
@Components/switchToggle    // reemplaza switch
@Components/currencyInput   // reemplaza currency_mw
@Components/progressBar     // reemplaza barra
```

`dashcardvalues` no entra en esta lista todavía — el paso 1 del plan verifica primero si `cards`/`cardTotals` ya lo cubre.

**Catálogo de modales genéricos** (`@Components/modals/`), todos sobre el shell `@Components/modal`, mismo contrato de props:

```js
{ isOpen: boolean, onClose: () => void, onConfirm: (value) => void, title: string }
```

Candidatos iniciales (nombre → equivalente legacy), a cerrar definitivamente en el paso 2 del plan tras revisar los 20 formularios `err_*`/`error_*`:

```
@Components/modals/SeekTextModal.jsx        // err_seek_text
@Components/modals/SelectValueModal.jsx     // err_select_value
@Components/modals/DatePickerModal.jsx      // err_selefecha
@Components/modals/ConfirmModal.jsx         // error_1 / confirmaciones
@Components/modals/AddDescriptionModal.jsx  // err_add_description
@Components/modals/MessageModal.jsx         // error_2 / mensajes de error
```

**Contrato de `useForm` extendido** (`src/hooks/useForms.js`, decisión documentada aquí, implementación diferida — ver Scope):

```js
// hoy: formValidations = { campo: [fn, mensaje] }
// se agrega soporte alternativo, detectando el tipo del segundo argumento:
useForm(initialForm, zodSchema) // zodSchema: z.object({...})
// zodSchema.safeParse(formState) reemplaza a createValidators() cuando
// formValidations es una instancia de z.ZodType; si es el objeto de tuplas
// de siempre, sigue el comportamiento actual sin cambios.
```

## Implementation plan

1. Crear `specs/02-framework-compartido/mapping.md` con la tabla de las 31 clases (29 de `controles_hw.vcx` + 2 de `calendarhw.vcx`), cruzando contra los componentes ya existentes en `@Components` (incluida la verificación puntual de si `cards`/`cardTotals` cubre `dashcardvalues`, y las notas de huecos de `reactTable` frente a `grid_hw`). No se crea código todavía — solo el diagnóstico.

2. Revisar los 20 formularios `err_*`/`error_*` del inventario legacy y cerrar en `mapping.md` (sección aparte) el listado final de 5–8 modales genéricos, con el nombre de archivo definitivo de cada uno.

3. Crear `@Components/spinner` (componente aislado, sin consumidores todavía). Verificación manual: se renderiza correctamente en modo claro y oscuro (`npm run dev`).

4. Crear `@Components/switchToggle`, mismo patrón que el paso 3.

5. Crear `@Components/currencyInput`, mismo patrón.

6. Crear `@Components/progressBar`, mismo patrón.

7. Construir el primer modal del catálogo cerrado en el paso 2 sobre el shell `@Components/modal` existente, estableciendo el contrato común de props (`isOpen`, `onClose`, `onConfirm`, `title`) que van a compartir los demás.

8. Construir el resto de modales del catálogo, en bloques de 2 por paso (dividir en pasos 8, 9, 10... según cuántos haya salido del paso 2), reusando el contrato del paso 7.

9. Correr `npm run lint` y `npx vite build` (el mismo comando que usa CI, no los scripts de brand) para confirmar que los componentes nuevos no rompen nada aunque todavía no tengan consumidores reales.

## Acceptance criteria

- [ ] `specs/02-framework-compartido/mapping.md` existe y cubre las 31 clases (29 de `controles_hw.vcx` + 2 de `calendarhw.vcx`), cada una con `Estado` asignado.
- [ ] El listado final de modales genéricos (5–8) queda cerrado en `mapping.md`, con nombre de archivo definido para cada uno.
- [ ] `@Components/spinner`, `@Components/switchToggle`, `@Components/currencyInput` y `@Components/progressBar` existen y renderizan sin errores de consola en modo claro y oscuro.
- [ ] Cada modal del catálogo cerrado en el paso 2 del plan existe en `@Components/modals/` y comparte el contrato de props (`isOpen`, `onClose`, `onConfirm`, `title`).
- [ ] `npm run lint` no reporta errores nuevos atribuibles a los archivos creados en esta spec (el backlog preexistente de ~7000 hallazgos no cuenta).
- [ ] `npx vite build` completa sin errores.
- [ ] El spec deja registrado en la sección Decisions que el patrón CRUD legacy no se replica (ya cubierto por `mw-back`) y que la integración Zod↔`useForm` queda documentada como contrato, no implementada en esta spec.

## Decisions

- **Sí:** un solo spec para las 3 áreas (controles, modales, CRUD/Zod) en vez de dividir en 3. Las 3 pertenecen a la misma Fase 1 del plan y se implementan juntas; dividir fragmentaría el seguimiento.
- **Sí:** crear los componentes React que falten para `controles_hw.vcx`, no solo documentar el mapeo. Son piezas genéricas reutilizables en decenas de pantallas futuras.
- **No:** crear una tabla nueva para `grid_hw`. Ya existe `reactTable`/`XReactTable`/`reactTableEdit` y cubre el caso; solo se documentan los huecos puntuales.
- **Sí:** construir el catálogo de modales genéricos desde cero, sobre el shell `@Components/modal` ya existente.
- **No:** reusar los modales de Hospital (`ModalDetail.jsx`, etc.) como base del catálogo genérico. Están enfocados en ese módulo y todavía les falta cubrir funciones que sí tiene el legacy — acoplarían el catálogo compartido a decisiones de un módulo sin terminar.
- **No:** migrar o replicar el patrón CRUD legacy (`crud_mw`/`crudvfp`). `mw-back` ya tiene una convención funcional (`BaseService`/`ModelService`/`CustomModelService`); no hay nada que portar.
- **Sí:** Zod reemplaza `validations/*.js` en `mw-back` hacia adelante, para módulos nuevos. El patrón actual no está bien implementado y no escala con lo que falta por migrar.
- **No:** migrar retroactivamente los módulos de backend viejos a Zod dentro de esta spec. Queda para el final del proyecto de migración.
- **Sí:** mantener `useForm` (hook propio, `src/hooks/useForms.js`) como base de formularios, en vez de expandir Formik. Formik solo se usa hoy en 2-3 pantallas; las pantallas funcionales reales del proyecto ya usan `useForm`.
- **No:** usar el paquete `zod-formik-adapter`. Formik es marginal en el proyecto real; no tiene sentido atar la integración de Zod a un adapter de una librería poco usada.
- **No:** implementar la extensión de `useForm` para Zod en esta spec. La hace el primer módulo/pantalla que realmente la necesite, para no construir infraestructura sin un caso de uso real que la valide.
- **Sí:** mantener compatibilidad hacia atrás en `useForm` (acepta tanto el formato de tuplas actual como un schema de Zod). La migración es incremental pantalla por pantalla; las que no se toquen todavía no pueden romperse.
- **Sí:** specs espejo en `mw-back` en vez de una sola spec cross-repo. `/spec-impl` crea rama git por repo; una sola spec no puede coordinar dos ramas de forma limpia.

## Risks

| Risk | Mitigation |
|---|---|
| Los componentes nuevos (spinner, switch, currencyInput, progressBar) se crean sin un consumidor real todavía — el diseño podría no encajar cuando se porte el primer formulario real. | Mantenerlos simples en esta spec; ajustar su API en el primer spec de pantalla que los use en vez de sobre-diseñarlos ahora. |
| El catálogo de modales cerrado en el paso 2 podría quedar incompleto si algún patrón de `err_*` no se identifica bien solo por nombre de archivo. | Revisar los 20 formularios uno por uno (contenido, no solo nombre) antes de cerrar la lista final en `mapping.md`. |
| La extensión futura de `useForm` para Zod, al no implementarse en esta spec, podría diseñarse distinto por el primer módulo que la necesite. | El contrato ya queda documentado en la sección Data model de esta spec — cualquier spec futura debe respetarlo, no reinventarlo. |

## What is **not** in this spec

- Schemas de Zod concretos por pantalla/módulo.
- Implementación de la extensión de `useForm` para Zod.
- Reemplazo de `validations/*.js` en `mw-back` (spec espejo aparte).
- Migración retroactiva de módulos backend viejos a Zod.
- Modales de Hospital portados al catálogo genérico.
- Cualquier pantalla de negocio concreta (`fac_pos`, `cont_reportes`, etc.).

Cada uno de estos, si aplica, va en su propia spec futura.
