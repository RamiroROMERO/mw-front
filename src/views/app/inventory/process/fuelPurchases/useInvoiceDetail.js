import { validFloat } from '@Helpers/Utils';

export const useInvoiceDetail = ({ onBulkForm, tax, discount, subtotal }) => {

  const onSubtotalChange = e => {
    const newSubtotal = e.target.value;

    const newTotal = validFloat(newSubtotal) + validFloat(tax) - validFloat(discount);
    onBulkForm({ subtotal: newSubtotal, total: newTotal });
  }

  const onTaxChange = e => {
    const newTax = e.target.value;

    const newTotal = validFloat(subtotal) + validFloat(newTax) - validFloat(discount);
    onBulkForm({ tax: newTax, total: newTotal });
  }

  const onDiscountChange = e => {
    const newDiscount = e.target.value;

    const newTotal = validFloat(subtotal) + validFloat(tax) - validFloat(newDiscount);
    onBulkForm({ discount: newDiscount, total: newTotal });
  }

  return (
    {
      onSubtotalChange,
      onTaxChange,
      onDiscountChange
    }
  )
}
