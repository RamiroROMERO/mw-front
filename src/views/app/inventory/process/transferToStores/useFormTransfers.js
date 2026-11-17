import { validInt } from '@Helpers/Utils';
import { ACCOUNT_BY_APPLY_TO } from '../transactions/shared/accountByApplyTo';

export const useFormTransfers = ({ onBulkForm, listStores }) => {

  const onStoreChange = e => {
    const store = e.target.value;

    const filter = listStores.find(item => item.value === validInt(store));

    onBulkForm({ sourceStoreId: store, originCtaCode: filter ? filter.invCtaCode : '' });
  }

  const onDestinationChange = (e, applyTo) => {
    const destination = e.target.value;

    const filter = listStores.find(item => item.value === validInt(destination));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'invCtaCode';

    onBulkForm({ assignStoreId: destination, assignCtaCode: filter ? filter[accountField] : '' });
  }

  const onApplyToChange = (e, assignStoreId) => {
    const applyTo = e.target.value;

    const filter = listStores.find(item => item.value === validInt(assignStoreId));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'invCtaCode';

    onBulkForm({ applyTo, assignCtaCode: filter ? filter[accountField] : '' });
  }

  return (
    {
      onStoreChange,
      onDestinationChange,
      onApplyToChange
    }
  )
}
