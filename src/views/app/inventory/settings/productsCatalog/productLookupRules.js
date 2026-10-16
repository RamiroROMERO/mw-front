import { validInt } from '@Helpers/Utils';

// Carga por código (SPEC v2-08-sr; LostFocus del código en inv_products.sc2): al salir del campo Código con un producto nuevo
// (id = 0) y un código no vacío se consulta `products/byCode/:code`. Con un producto ya cargado o el código vacío no se consulta.
export const shouldLookupByCode = ({ id, code }) => validInt(id) === 0 && String(code ?? '').trim() !== '';

// La respuesta solo se aplica si el formulario sigue igual que cuando se pidió (el usuario no cambió el código ni cargó otro
// producto mientras tanto): una respuesta tardía no debe pisar lo que se está escribiendo.
export const canApplyLookup = ({ requestedCode, currentCode, currentId }) =>
  String(currentCode ?? '').trim() === String(requestedCode ?? '').trim() && validInt(currentId) === 0;
