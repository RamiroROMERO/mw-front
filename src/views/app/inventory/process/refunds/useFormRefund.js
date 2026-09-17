import { validInt } from '@Helpers/Utils';
import { useState } from 'react';
import { ACCOUNT_BY_APPLY_TO } from '../transferToStores/useFormTransfers';

export const useFormRefund = ({ onBulkForm, listStores, listDestinations, listProviders, refundDetail, setRefundDetail, noCtaAssign, idProd, onResetFormDeta, setShowType1, setShowType2 }) => {
  const [openModalApplyAccount, setOpenModalApplyAccount] = useState(false);

  // CTAOrigen: siempre la cuenta de Inventario del almacén origen (el combobox "Aplica" del
  // legacy que recalculaba esta cuenta usaba inv_bodegascd, tabla confirmada vacía en
  // producción — ver [[project_inventory_movements_family]]).
  const onStoreChange = e => {
    const store = e.target.value;

    const filter = listStores.find(item => item.value === validInt(store));

    onBulkForm({ sourceStoreId: store, noCtaOrigin: filter ? filter.idCtaInventory : '' });
  }

  // CTADestino (reintType=2/Reintegro): cuenta del Centro de Destino según "Aplica".
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

  // CTADestino (reintType=1/Compra): cuenta de Cuentas por Pagar del proveedor seleccionado.
  const onProviderChange = e => {
    const provider = e.target.value;

    const filter = listProviders.find(item => item.value === validInt(provider));

    onBulkForm({ providerId: provider, noCtaAssign: filter ? filter.idCtaCxp : '' });
  }

  const onTypeChange = e => {
    const type = e.target.value;

    if (validInt(type) === 2) {
      setShowType1("none");
      setShowType2("block");

      onBulkForm({ reintType: type, providerId: 0, expirationDate: '', noCtaAssign: '' });
    } else {
      setShowType1("block");
      setShowType2("none");
      onBulkForm({ reintType: type, assignStoreId: 0, applyTo: '', noCtaAssign: '' });
    }
  }

  const fnApplyDestinyAccount = () => {
    if (noCtaAssign === "") {
      return
    }
    setOpenModalApplyAccount(true);
  }

  const fnApplyAll = () => {
    const updated = refundDetail.map(item => ({ ...item, noCtaAssign }));
    setRefundDetail(updated);
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  const fnApplyCurrent = () => {
    const updated = refundDetail.map(item => item.idProd === idProd ? { ...item, noCtaAssign } : item);
    setRefundDetail(updated);
    onResetFormDeta();
    setOpenModalApplyAccount(false);
  }

  return (
    {
      onStoreChange,
      onDestinationChange,
      onApplyToChange,
      onProviderChange,
      onTypeChange,
      fnApplyDestinyAccount,
      openModalApplyAccount,
      setOpenModalApplyAccount,
      fnApplyAll,
      fnApplyCurrent
    }
  )
}
