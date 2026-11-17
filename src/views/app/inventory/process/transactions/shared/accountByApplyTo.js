// Mismo criterio en Traslados, Requisiciones y Reintegros: `applyTo` se guarda como el texto real
// ('Inventario'/'Costo'/'Gasto') tanto en el estado del formulario como en el back, sin capa de traducción numérica
// (SimpleSelect sí soporta valores string, a diferencia de RadioGroup/RadioButton que compara con validInt).
export const ACCOUNT_BY_APPLY_TO = {
  Inventario: 'invCtaCode',
  Costo: 'costCtaCode',
  Gasto: 'expenseCtaCode'
};
