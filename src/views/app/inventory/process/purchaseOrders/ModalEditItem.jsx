import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import { IntlMessages, formatNumber, validFloat } from '@Helpers/Utils'
import { useState } from 'react'
import { calculateLine, validateLine } from './purchaseOrderRules'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'

// Legacy Inv_OCModItem1.sc2 ("Editar Item"): permite ajustar Cantidad/Precio/%Descuento/
// %Impuesto/Exonerado de una línea ya agregada, recalculando Subtotal/Descuento/Impuesto/
// Total igual que Thisform.Refresh() del legacy.
const ModalEditItem = ({ data, setOpen }) => {
  const { item, orderDetail, setOrderDetail, fnRecalculateTotals } = data;

  const { formState, setBulkForm } = useForm({
    productCode: item.productCode,
    nameProduct: item.nameProduct,
    qty: item.qty,
    price: item.price,
    subTotal: item.subTotal,
    percentDiscount: item.percentDiscount,
    discount: item.discount,
    percentTax: item.percentTax,
    tax: item.tax,
    total: item.total,
    isExonerated: !!item.isExonerated
  });
  const [sendForm, setSendForm] = useState(false);

  const { productCode, nameProduct, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total, isExonerated } = formState;

  // Mismas reglas del back (purchaseOrderRules.js): el exonerado no paga impuesto.
  const fnRefresh = (values) => {
    const { subTotal: newSubTotal, discount: newDiscount, tax: newTax, total: newTotal } = calculateLine({ ...values, isExonerated });
    setBulkForm({
      ...values,
      subTotal: newSubTotal,
      discount: newDiscount,
      tax: newTax,
      total: newTotal
    });
  }

  const onQtyChange = (e) => fnRefresh({ qty: e.target.value, price, percentDiscount, percentTax });
  const onPriceChange = (e) => fnRefresh({ qty, price: e.target.value, percentDiscount, percentTax });
  const onDiscountChange = (e) => fnRefresh({ qty, price, percentDiscount: e.target.value, percentTax });
  const onTaxChange = (e) => fnRefresh({ qty, price, percentDiscount, percentTax: e.target.value });

  // Legacy (Checkbox_hw1, Inv_OCModItem1): no pone en cero % Impuesto al marcarlo (a diferencia del checkbox al agregar la
  // línea); el impuesto de una línea exonerada es cero al calcular y al guardar.
  const onExoneratedChange = (e) => {
    const checked = e.target.checked;
    const { subTotal: newSubTotal, discount: newDiscount, tax: newTax, total: newTotal } = calculateLine({ qty, price, percentDiscount, percentTax, isExonerated: checked });
    setBulkForm({ isExonerated: checked, subTotal: newSubTotal, discount: newDiscount, tax: newTax, total: newTotal });
  };

  const errors = sendForm ? validateLine({ productCode, undId: item.undId, qty, price, percentDiscount, percentTax }) : {};

  const fnAccept = () => {
    setSendForm(true);
    if (Object.keys(validateLine({ productCode, undId: item.undId, qty, price, percentDiscount, percentTax })).length > 0) return;

    const values = calculateLine({ qty, price, percentDiscount, percentTax, isExonerated });
    const newArray = orderDetail.map((row) => {
      if (row.id !== item.id) return row;
      return {
        ...row,
        qty: validFloat(qty),
        qtyMissing: validFloat(qty) - validFloat(row.qtyReceived),
        price: validFloat(price),
        percentDiscount: validFloat(percentDiscount),
        ...values,
        isExonerated: !!isExonerated
      };
    });

    setOrderDetail(newArray);
    fnRecalculateTotals(newArray);
    setOpen(false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" sm="6">
            <InputField name="productCode" label="page.purchaseOrders.input.productCode" value={productCode} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <InputField name="nameProduct" label="page.purchaseOrders.input.nameProduct" value={nameProduct} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="qty" label="page.purchaseOrders.input.qtyRequired" value={qty} onChange={onQtyChange} type="text" invalid={!!errors.qty} feedbackText={errors.qty || null} />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="price" label="page.purchaseOrders.input.priceRequired" value={price} onChange={onPriceChange} type="text" invalid={!!errors.price} feedbackText={errors.price || null} />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="subTotal" label="page.purchaseOrders.input.subTotal" value={formatNumber(subTotal)} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="percentDiscount" label="page.purchaseOrders.input.percentDiscount" value={percentDiscount} onChange={onDiscountChange} type="text" invalid={!!errors.percentDiscount} feedbackText={errors.percentDiscount || null} />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="discount" label="page.purchaseOrders.input.discount" value={formatNumber(discount)} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="percentTax" label="page.purchaseOrders.input.percentTax" value={percentTax} onChange={onTaxChange} type="text" invalid={!!errors.percentTax} feedbackText={errors.percentTax || null} />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="tax" label="page.purchaseOrders.input.tax" value={formatNumber(tax)} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" className="d-flex align-items-end">
            <Checkbox name="isExonerated" label="page.purchaseOrders.checkbox.exonerated" value={isExonerated} onChange={onExoneratedChange} />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="total" label="page.purchaseOrders.input.total" value={formatNumber(total)} type="text" disabled />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEditItem
