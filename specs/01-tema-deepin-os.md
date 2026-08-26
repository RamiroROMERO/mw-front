# SPEC 01 — Tema Deepin OS (claro/oscuro) como tema por defecto

> **Estado:** Implementada
> **Depende de:** —
> **Fecha:** 2026-08-26
> **Objetivo:** Crear un tema visual "Deepin" (claro y oscuro) para la marca demo, basado en la paleta de `deepin.css`, que reemplace al tema por defecto actual y aplique su estética (color, tipografía, bordes redondeados, sombras y efecto vidrio) a todos los componentes existentes sin alterar la estructura de Sidebar/Topnav.

## Scope

**In:**

- Dos archivos de tema nuevos: `src/assets/sass/themes/gogo.light.deepin.scss` y `src/assets/sass/themes/gogo.dark.deepin.scss`, siguiendo el patrón de los 18 temas `gogo.*.scss` existentes.
- Mapeo de la paleta de `deepin.css` (`--dp-primary`, `--dp-success`, `--dp-warning`, `--dp-danger`, fondos, bordes, texto) a las variables `$theme-color-1..6` y demás variables de tema (`$background-color`, `$foreground-color`, `$primary-color`, etc.).
- `deepin` como nuevo tema por defecto: `defaultColor` en `src/constants/defaultValues.js` pasa de `'light.blueyale'` a `'light.deepin'`.
- `deepin` agregado al array `colors` de `defaultValues.js` y como swatch seleccionable en `ColorSwitcher` (requiere agregar `$theme-color-deepin` en `src/assets/sass/_02_variables.scss` y la regla `.theme-color-deepin` en `src/assets/sass/plugins/theme-color.scss`, siguiendo el mismo patrón que los 10 colores actuales).
- Restyle visual completo (bordes redondeados generosos, sombras suaves, paneles tipo vidrio con `backdrop-filter: blur()`) aplicado a botones, cards, modales, forms, alerts, badges, navs/tabs, navbar, sidebar y footer — implementado como overrides propios dentro de los dos archivos de tema nuevos (después del `@import "../main.scss"`), sin tocar los partials compartidos (`core/*.scss`, `plugins/*.scss`) para no afectar a los otros 17 temas.
- Tipografía: stack `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` aplicado dentro del tema deepin (override local, sin tocar la fuente Nunito que usan los demás temas).
- Alternancia claro/oscuro reutilizando el mecanismo existente de `Topnav.DarkSwitch.jsx` (`getCurrentColor`/`setCurrentColor`), sin lógica nueva.
- Aplica solo a la marca `demo`.

**Out of scope (para specs futuras):**

- Las demás marcas (`provasa`, `hiper`, `muna`, `arkitek`, `cum`).
- Dock flotante inferior real reemplazando el Sidebar (cambio estructural de navegación).
- Detección automática de modo oscuro vía `prefers-color-scheme` (el `deepin.css` de referencia la usa; se descarta a favor del switch manual existente).
- Cambios de estructura/JSX en `AppLayout.jsx`, `Sidebar`, `Topnav`, `Footer` — solo restyle CSS.
- Fuentes web nuevas (Inter, Noto Sans, etc.) — se usa `system-ui`.
- Modificar o eliminar los 17 temas `gogo.*.scss` existentes.
- El archivo `deepin.css` en la raíz del proyecto es solo referencia de paleta/moodboard; sus clases literales (`.deepin-window`, `.deepin-btn`, `.deepin-dock`, `.dock-item`) no se usan tal cual — se reimplementan dentro del sistema de temas real. El archivo se elimina al finalizar (paso final del plan de implementación).

## Data model

Esta spec no introduce estructuras de datos de aplicación. Reutiliza el mecanismo de theming existente (`main.jsx` importa dinámicamente `gogo.<currentColor>.scss` según `getCurrentColor()`).

Lo que sí define es el mapeo concreto de paleta `deepin.css` → variables SCSS de tema, en `gogo.light.deepin.scss` y `gogo.dark.deepin.scss`:

```scss
// gogo.light.deepin.scss
$theme-color-1: #0081FF;  // --dp-primary
$theme-color-2: #3399FF;  // --dp-primary-hover
$theme-color-3: #0066CC;  // --dp-primary-active
$theme-color-4: #18C96E;  // --dp-success (acento secundario)
$theme-color-5: #6E6E6E;  // --dp-text-secondary (acento neutro)
$theme-color-6: #A1A1A1;  // --dp-text-disabled

$primary-color: #2C2C2C;      // --dp-text-primary
$secondary-color: #6E6E6E;    // --dp-text-secondary
$muted-color: #A1A1A1;        // --dp-text-disabled
$background-color: #F4F5F7;   // --dp-bg-desktop
$foreground-color: #FFFFFF;   // --dp-bg-window
$input-background: #FFFFFF;   // --dp-bg-window
$separator-color: rgba(0, 0, 0, 0.15);       // --dp-border-strong
$separator-color-light: rgba(0, 0, 0, 0.08); // --dp-border-light
$button-text-color: #FFFFFF;  // --dp-text-on-primary
$theme-color-danger: #FF4D4F; // --dp-danger

// Overrides propios (después de @import "../main.scss"): glass panels con
// backdrop-filter: blur(20px), border-radius: 16px en cards/modales,
// border-radius: 8px en botones/inputs, font-family: system-ui stack.
```

```scss
// gogo.dark.deepin.scss — mismos $theme-color-1..3 y $theme-color-danger,
// fondo y texto invertidos:
$background-color: #141518;   // --dp-bg-desktop (dark)
$foreground-color: #1E1F22;   // --dp-bg-window (dark)
$input-background: #1E1F22;
$separator-color: rgba(255, 255, 255, 0.15);
$separator-color-light: rgba(255, 255, 255, 0.08);
$primary-color: #E0E0E0;      // --dp-text-primary (dark)
$secondary-color: #909090;    // --dp-text-secondary (dark)
$muted-color: #5E5E5E;        // --dp-text-disabled (dark)
```

Cambios de configuración en `src/constants/defaultValues.js`:

```js
export const defaultColor = 'light.deepin'; // antes: 'light.blueyale'
export const colors = [
  'bluenavy', 'blueyale', 'blueolympic', 'greenmoss', 'greenlime',
  'purplemonster', 'orangecarrot', 'redruby', 'yellowgranola', 'greysteel',
  'deepin', // nuevo
];
```

Y en `src/assets/sass/_02_variables.scss` (compartido, usado por el swatch de `ColorSwitcher`):

```scss
$theme-color-deepin: #0081FF;
```

## Implementation plan

1. Crear `src/assets/sass/themes/gogo.light.deepin.scss` con las variables base de paleta (color, fondo, texto, separadores) del Data model, terminando en `@import "../main.scss"`. Prueba manual: `localStorage.setItem('__theme_selected_color','light.deepin')` en devtools, recargar `npm run dev`, confirmar que compila sin errores Sass y botones/badges/alerts ya usan la paleta Deepin.
2. Crear `src/assets/sass/themes/gogo.dark.deepin.scss` análogo con las variables oscuras del Data model. Prueba manual: mismo procedimiento con `'dark.deepin'`, confirmar fondo oscuro y texto claro sin errores.
3. Agregar overrides de cards, modales y botones (border-radius ampliado, box-shadow suave, `backdrop-filter: blur()` en paneles) al final de ambos archivos de tema. Prueba manual: revisar visualmente una card, un modal y un botón primario en ambos modos.
4. Agregar overrides de forms, alerts, badges y navs/tabs (mismo lenguaje visual: radius y shadow) al final de ambos archivos. Prueba manual: revisar un formulario y una tabla del módulo Hospital en ambos modos.
5. Restyle de Topnav, Sidebar y Footer dentro de los mismos dos archivos (panel de vidrio, blur, bordes redondeados), sin tocar el JSX de `AppLayout.jsx`/`Sidebar`/`Topnav`/`Footer`. Prueba manual: confirmar que colapsar el sidebar y abrir submenús sigue funcionando igual, solo cambia el estilo.
6. Aplicar tipografía `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` como override local de `font-family` en ambos archivos. Prueba manual: inspeccionar que el texto ya no usa Nunito con el tema deepin activo.
7. Agregar `$theme-color-deepin` en `src/assets/sass/_02_variables.scss`, la regla `.theme-color-deepin` en `src/assets/sass/plugins/theme-color.scss`, y `'deepin'` al array `colors` en `src/constants/defaultValues.js`. Prueba manual: con otro tema activo, abrir el `ColorSwitcher` y confirmar que aparece el swatch deepin (claro y oscuro) y cambia de tema al hacer clic.
8. Cambiar `defaultColor` a `'light.deepin'` en `src/constants/defaultValues.js`. Prueba manual: limpiar `__theme_selected_color` de `localStorage`, recargar sin tema previo guardado, confirmar que carga con Deepin por defecto.
9. Eliminar `deepin.css` de la raíz del proyecto (ya no se usa, era solo referencia de paleta). Confirmar con `grep -r "deepin.css"` que no hay ningún import roto.
10. Verificación final: `npx vite build` sin errores, recorrido visual en `npm run dev` (login, dashboard, un par de pantallas del módulo Hospital) en claro y oscuro con deepin activo, y confirmar que los otros 17 temas del `ColorSwitcher` siguen renderizando sin cambios.

## Acceptance criteria

- [ ] Sin `__theme_selected_color` en `localStorage`, la app carga por defecto con el tema `light.deepin`.
- [ ] `npx vite build` termina sin errores.
- [ ] El swatch "deepin" aparece en el `ColorSwitcher` (versión claro y oscuro) y al hacer clic cambia el tema activo correctamente.
- [ ] Con el tema deepin activo, botones primarios, badges y alerts usan `#0081FF` como color base.
- [ ] Con el tema deepin activo, cards y modales muestran bordes redondeados ampliados y sombra suave (visualmente distintos del resto de temas).
- [ ] Con el tema deepin activo, el Sidebar sigue colapsando/expandiendo y los submenús se abren igual que con cualquier otro tema.
- [ ] Con el tema deepin activo, el texto no usa la fuente Nunito (se ve la fuente nativa del sistema).
- [ ] Cambiar desde el ColorSwitcher a cualquiera de los otros 10 temas sigue funcionando sin errores en consola.
- [ ] El archivo `deepin.css` ya no existe en la raíz del proyecto.

## Decisiones

- **Sí:** implementar Deepin como dos archivos de tema nuevos (`gogo.light.deepin.scss` / `gogo.dark.deepin.scss`) que siguen el patrón existente de los 18 temas. Reutiliza toda la infraestructura de theming ya probada (import dinámico en `main.jsx`, ColorSwitcher, DarkSwitch) sin inventar un mecanismo paralelo.
- **No:** un sistema de theming basado en CSS custom properties (`--dp-*`) como en el `deepin.css` de referencia. El proyecto ya resuelve theming vía variables Sass compiladas por archivo; mezclar dos mecanismos habría sido inconsistente y más difícil de mantener.
- **Sí:** los overrides de "forma de componentes" (glass, radius, shadow) viven dentro de los dos archivos de tema nuevos, después del `@import "../main.scss"`, en vez de editar los partials compartidos (`core/*.scss`, `plugins/sidebar.scss`, etc.). Como solo se carga un bundle de tema a la vez, esto da estilización completa sin ningún riesgo de afectar a los otros 17 temas.
- **No:** dock flotante inferior real reemplazando el Sidebar. El Sidebar actual tiene un menú ERP completo con submenús anidados; un dock de escritorio está pensado para pocos accesos directos, no para eso. Se descarta por alto riesgo de romper la navegación existente.
- **No:** detección automática de modo oscuro vía `@media (prefers-color-scheme: dark)` (presente en el `deepin.css` de referencia). El proyecto ya tiene un mecanismo manual de claro/oscuro (`Topnav.DarkSwitch.jsx` + `getCurrentColor`/`setCurrentColor`); mezclar detección automática con el switch manual generaría inconsistencias (¿cuál gana?).
- **No:** cargar una fuente web nueva (Inter, Noto Sans). Se usa el stack `system-ui`, igual que la referencia `deepin.css`, evitando peso extra y gestión de licencias/archivos de fuente.
- **Sí:** aplica solo a la marca `demo`. Las demás marcas (`provasa`, `hiper`, `muna`, `arkitek`, `cum`) quedan fuera; si se quiere replicar, es otra spec con su propia validación por marca.
- **Sí:** eliminar `deepin.css` de la raíz al finalizar. Era un archivo de referencia/moodboard suelto (no importado desde ningún lado); una vez migrada su paleta a los archivos de tema reales, mantenerlo sin uso sería confuso.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Cada archivo de tema requiere definir todas las variables que consumen los partials compartidos (`$gradient-color-1..3`, `$lp-bg-color-1..4`, `$logo-path`, etc.) — omitir una rompe la compilación Sass de ese tema. | Usar `gogo.light.blueyale.scss` como checklist línea por línea al crear los dos archivos nuevos, no solo copiar el Data model. |
| `backdrop-filter` no tiene soporte parejo en todos los navegadores/versiones (necesita prefijo `-webkit-` en Safari). | Incluir siempre el par `backdrop-filter` + `-webkit-backdrop-filter`, igual que en `deepin.css`. Es un efecto decorativo — sin soporte, el panel cae a fondo sólido sin blur, no rompe funcionalidad. |
| Paneles translúcidos pueden bajar el contraste de texto según qué haya detrás (fondo del dashboard, imágenes, etc.). | Verificar contraste manualmente en el paso 3–4 del plan sobre pantallas reales del módulo Hospital, no solo sobre fondo liso. |

## Lo que **no** está en esta spec

- Aplicar el tema Deepin a otras marcas (`provasa`, `hiper`, `muna`, `arkitek`, `cum`).
- Dock flotante inferior real reemplazando el Sidebar.
- Detección automática de modo oscuro (`prefers-color-scheme`).
- Cambios de estructura/JSX en `AppLayout.jsx`, `Sidebar`, `Topnav`, `Footer`.
- Fuentes web nuevas (Inter, Noto Sans, etc.).
- Modificar o eliminar los 17 temas `gogo.*.scss` existentes.

Cada uno de estos, si se pide más adelante, va en su propia spec.
