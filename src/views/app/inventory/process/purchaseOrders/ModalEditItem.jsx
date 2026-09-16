import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import { IntlMessages, formatNumber, validFloat } from '@Helpers/Utils'
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
    isExonerated: !!item.taxType
  });

  const { productCode, nameProduct, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total, isExonerated } = formState;

  const fnRefresh = (values) => {
    const newQty = validFloat(values.qty);
    const newPrice = validFloat(values.price);
    const newPercentDiscount = validFloat(values.percentDiscount);
    const newPercentTax = validFloat(values.percentTax);

    const newSubTotal = newQty * newPrice;
    const newDiscount = (newSubTotal * newPercentDiscount) / 100;
    const newTax = ((newSubTotal - newDiscount) * newPercentTax) / 100;
    const newTotal = Math.round((newSubTotal - newDiscount + newTax) * 100000) / 100000;

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

  // Legacy (Checkbox_hw1, Inv_OCModItem1): no pone en cero % Impuesto al marcarlo (a
  // diferencia del checkbox al agregar la línea) — solo cambia tax_type al Aceptar.
  const onExoneratedChange = (e) => setBulkForm({ isExonerated: e.target.checked });

  const fnAccept = () => {
    if (validFloat(subTotal) === 0) return;

    const newArray = orderDetail.map((row) => {
      if (row.id !== item.id) return row;
      return {
        ...row,
        qty: validFloat(qty),
        qtyMissing: validFloat(qty),
        price: validFloat(price),
        subTotal: validFloat(subTotal),
        percentDiscount: validFloat(percentDiscount),
        discount: validFloat(discount),
        percentTax: validFloat(percentTax),
        tax: validFloat(tax),
        total: validFloat(total),
        taxType: isExonerated ? 1 : 0
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
            <InputField name="qty" label="page.purchaseOrders.input.qty" value={qty} onChange={onQtyChange} type="text" />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="price" label="page.purchaseOrders.input.price" value={price} onChange={onPriceChange} type="text" />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="subTotal" label="page.purchaseOrders.input.subTotal" value={formatNumber(subTotal)} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="percentDiscount" label="page.purchaseOrders.input.percentDiscount" value={percentDiscount} onChange={onDiscountChange} type="text" />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="discount" label="page.purchaseOrders.input.discount" value={formatNumber(discount)} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4">
            <InputField name="percentTax" label="page.purchaseOrders.input.percentTax" value={percentTax} onChange={onTaxChange} type="text" />
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
