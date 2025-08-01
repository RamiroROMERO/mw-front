import { validInt } from '@/helpers/Utils';
import { useState } from 'react';

export const useFormRefund = ({ onBulkForm, listStores, listDestinations, refundDetail, noCtaAssign, idProd, onResetFormDeta, setShowType1, setShowType2 }) => {
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

  const onTypeChange = e => {
    const type = e.target.value;

    if (validInt(type) === 2) {
      setShowType1("none");
      setShowType2("block");

      onBulkForm({ reintType: type, providerId: 0, expirationDate: '' });
    } else {
      setShowType1("block");
      setShowType2("none");
      onBulkForm({ reintType: type, assignStoreId: 0, noCtaAssign: '', applyId: 0 });
    }
  }

  const fnApplyDestinyAccount = () => {
    if (noCtaAssign === "") {
      return
    }
    setOpenModalApplyAccount(true);
  }

  const fnApplyAll = () => {
    refundDetail.map(item => {
      item.noCtaAssign = noCtaAssign
      return item;
    });
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  const fnApplyCurrent = () => {
    refundDetail.map(item => {
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
      onStoreChange,
      onDestinationChange,
      onTypeChange,
      fnApplyDestinyAccount,
      openModalApplyAccount,
      setOpenModalApplyAccount,
      fnApplyAll,
      fnApplyCurrent
    }
  )
}
