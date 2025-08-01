import { validFloat } from '@/helpers/Utils';

export const useInvoiceDetail = ({ onBulkForm, valTax, valDiscount, valSubtotal }) => {

  const onSubtotalChange = e => {
    const newSubtotal = e.target.value;

    const newTotal = validFloat(newSubtotal) + validFloat(valTax) - validFloat(valDiscount);
    onBulkForm({ valSubtotal: newSubtotal, valTotal: newTotal });
  }

  const onTaxChange = e => {
    const newTax = e.target.value;

    const newTotal = validFloat(valSubtotal) + validFloat(newTax) - validFloat(valDiscount);
    onBulkForm({ valTax: newTax, valTotal: newTotal });
  }

  const onDiscountChange = e => {
    const newDiscount = e.target.value;

    const newTotal = validFloat(valSubtotal) + validFloat(valTax) - validFloat(newDiscount);
    onBulkForm({ valDiscount: newDiscount, valTotal: newTotal });
  }

  return (
    {
      onSubtotalChange,
      onTaxChange,
      onDiscountChange
    }
  )
}
