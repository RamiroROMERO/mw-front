import { validInt } from '@/helpers/Utils';

export const useFormTransfers = ({ onBulkForm, listStores }) => {

  const onStoreChange = e => {
    const store = e.target.value;

    const filter = listStores.find(item => item.value === validInt(store));

    onBulkForm({ sourceStoreId: store, noCtaOrigin: filter ? filter.idCtaInventory : '' });
  }

  const onDestinationChange = e => {
    const destination = e.target.value;

    const filter = listStores.find(item => item.value === validInt(destination));

    onBulkForm({ assignStoreId: destination, noCtaAssign: filter ? filter.idCtaInventory : '' });
  }

  return (
    {
      onStoreChange,
      onDestinationChange
    }
  )
}
