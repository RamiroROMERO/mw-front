import { validInt } from '@/helpers/Utils';
import { useState } from 'react';

export const useFormRequisition = ({ onBulkForm, listStores, listDestinations, requisitionDetail, noCtaAssign, idProd, onResetFormDeta }) => {
  const [openModalApplyAccount, setOpenModalApplyAccount] = useState(false);

  const onStoreChange = e => {
    const store = e.target.value;

    const filter = listStores.find(item => item.value === validInt(store));

    onBulkForm({ sourceStoreId: store, noCtaOrigin: filter ? filter.idCtaInventory : '' });
  }

  const onDestinationChange = e => {
    const destination = e.target.value;

    const filter = listDestinations.find(item => item.value === validInt(destination));

    onBulkForm({ assignStoreId: destination, noCtaAssign: filter ? filter.idCtaInventory : '' });
  }

  const fnApplyDestinyAccount = () => {
    if (noCtaAssign === "") {
      return
    }
    setOpenModalApplyAccount(true);
  }

  const fnApplyAll = () => {
    requisitionDetail.map(item => {
      item.noCtaAssign = noCtaAssign
      return item;
    });
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  const fnApplyCurrent = () => {
    requisitionDetail.map(item => {
      if (item.idProd === idProd) {
        item.noCtaAssign = noCtaAssign
      }
      return item;
    });
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  return (
    {
      fnApplyDestinyAccount,
      onStoreChange,
      onDestinationChange,
      openModalApplyAccount,
      setOpenModalApplyAccount,
      fnApplyAll,
      fnApplyCurrent
    }
  )
}
