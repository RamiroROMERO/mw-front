import { validInt } from '@Helpers/Utils';

// Mismo criterio que Requisiciones (useRequisitions.js) — `applyTo` se guarda como el
// texto real ('Inventario'/'Costo'/'Gasto') tanto en el estado del formulario como en el
// backend, sin capa de traducción numérica (SimpleSelect sí soporta valores string, a
// diferencia de RadioGroup/RadioButton que compara con validInt).
export const ACCOUNT_BY_APPLY_TO = {
  Inventario: 'idCtaInventory',
  Costo: 'idCtaCost',
  Gasto: 'idCtaExpense'
}

export const useFormTransfers = ({ onBulkForm, listStores }) => {

  const onStoreChange = e => {
    const store = e.target.value;

    const filter = listStores.find(item => item.value === validInt(store));

    onBulkForm({ sourceStoreId: store, noCtaOrigin: filter ? filter.idCtaInventory : '' });
  }

  const onDestinationChange = (e, applyTo) => {
    const destination = e.target.value;

    const filter = listStores.find(item => item.value === validInt(destination));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'idCtaInventory';

    onBulkForm({ assignStoreId: destination, noCtaAssign: filter ? filter[accountField] : '' });
  }

  const onApplyToChange = (e, assignStoreId) => {
    const applyTo = e.target.value;

    const filter = listStores.find(item => item.value === validInt(assignStoreId));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'idCtaInventory';

    onBulkForm({ applyTo, noCtaAssign: filter ? filter[accountField] : '' });
  }

  return (
    {
      onStoreChange,
      onDestinationChange,
      onApplyToChange
    }
  )
}
