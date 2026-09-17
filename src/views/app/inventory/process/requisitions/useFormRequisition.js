import { validInt } from '@Helpers/Utils';
import { useState } from 'react';
import { ACCOUNT_BY_APPLY_TO } from '../transferToStores/useFormTransfers';

export const useFormRequisition = ({ onBulkForm, listStores, listDestinations, requisitionDetail, setRequisitionDetail, noCtaAssign, idProd, onResetFormDeta }) => {
  const [openModalApplyAccount, setOpenModalApplyAccount] = useState(false);

  const onStoreChange = e => {
    const store = e.target.value;

    const filter = listStores.find(item => item.value === validInt(store));

    onBulkForm({ sourceStoreId: store, noCtaOrigin: filter ? filter.idCtaInventory : '' });
  }

  const onDestinationChange = (e, applyTo) => {
    const destination = e.target.value;

    const filter = listDestinations.find(item => item.value === validInt(destination));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'idCtaInventory';

    onBulkForm({ assignStoreId: destination, noCtaAssign: filter ? filter[accountField] : '' });
  }

  const onApplyToChange = (e, assignStoreId) => {
    const applyTo = e.target.value;

    const filter = listDestinations.find(item => item.value === validInt(assignStoreId));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'idCtaInventory';

    onBulkForm({ applyTo, noCtaAssign: filter ? filter[accountField] : '' });
  }

  const fnApplyDestinyAccount = () => {
    if (noCtaAssign === "") {
      return
    }
    setOpenModalApplyAccount(true);
  }

  const fnApplyAll = () => {
    const updated = requisitionDetail.map(item => ({ ...item, noCtaAssign }));
    setRequisitionDetail(updated);
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  const fnApplyCurrent = () => {
    const updated = requisitionDetail.map(item => item.idProd === idProd ? { ...item, noCtaAssign } : item);
    setRequisitionDetail(updated);
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  return (
    {
      fnApplyDestinyAccount,
      onStoreChange,
      onDestinationChange,
      onApplyToChange,
      openModalApplyAccount,
      setOpenModalApplyAccount,
      fnApplyAll,
      fnApplyCurrent
    }
  )
}
