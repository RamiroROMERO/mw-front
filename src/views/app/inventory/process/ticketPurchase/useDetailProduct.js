import { applyAccountToAll, asNumber, calculateLineTotal, lineTotalOrZero, sumTotals } from './ticketPurchaseRules';

// Líneas del grid. Todo se arma con las reglas puras (total en centavos, sin ruido de coma flotante) y sin mutar el estado.
export const useDetailProduct = ({
  formStateDeta, onBulkFormDeta, onResetFormDeta, onBulkForm, ticketDetail, setTicketDetail, isFormValidDeta, setSendFormDeta, accountingActive
}) => {
  const { idProd, productCode, nameProduct, qty, price, expenseCtaCode, toInventory, storeId } = formStateDeta;

  // El almacén solo se pide con "Al Inventario" y Contabilidad activa.
  const showStores = accountingActive && toInventory ? 'block' : 'none';

  // El total en pantalla es round2(cantidad × precio): 0 mientras falte alguno de los dos.
  const onQtyChange = (e) => onBulkFormDeta({ qty: e.target.value, total: lineTotalOrZero(e.target.value, price) });

  const onPriceChange = (e) => onBulkFormDeta({ price: e.target.value, total: lineTotalOrZero(qty, e.target.value) });

  const onToInventoryChange = (e) => {
    const checked = e.target.checked;
    onBulkFormDeta({ toInventory: checked, ...(checked ? {} : { storeId: 0 }) });
  }

  // "Aplicar a todos los items": sobreescribe la cuenta contable seleccionada en TODAS las líneas ya agregadas al grid (en memoria, sin
  // tocar el backend hasta Guardar).
  const fnApplyAccount = () => {
    if (!String(expenseCtaCode ?? '').trim() || String(expenseCtaCode) === '0' || !ticketDetail || ticketDetail.length === 0) {
      return;
    }
    setTicketDetail(applyAccountToAll(ticketDetail, expenseCtaCode));
  }

  const fnAddProduct = () => {
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }

    const quantity = asNumber(qty);
    const unitPrice = asNumber(price);
    const line = {
      id: idProd > 0 ? idProd : new Date().getTime(),
      productCode: String(productCode ?? '').trim(),
      nameProduct: String(nameProduct ?? '').trim(),
      qty: quantity,
      price: unitPrice,
      total: calculateLineTotal(quantity, unitPrice),
      expenseCtaCode: String(expenseCtaCode ?? '').trim(),
      toInventory: !!toInventory,
      storeId: toInventory ? asNumber(storeId) || 0 : 0
    };

    const newLines = idProd > 0
      ? ticketDetail.map((item) => (item.id === idProd ? line : item))
      : [...ticketDetail, line];

    setTicketDetail(newLines);
    onBulkForm({ valueTotal: sumTotals(newLines) });

    // limpiar inputs para agregar otro producto
    onResetFormDeta();
    setSendFormDeta(false);
  }

  return (
    {
      showStores,
      onQtyChange,
      onPriceChange,
      onToInventoryChange,
      fnApplyAccount,
      fnAddProduct
    }
  )
}
