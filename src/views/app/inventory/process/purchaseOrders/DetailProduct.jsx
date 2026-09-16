import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { Checkbox } from '@Components/checkbox'
import { formatNumber, IntlMessages, validFloat, validInt } from '@Helpers/Utils'
import { Button, Row } from 'reactstrap'

const DetailProduct = ({productCode, nameProduct, marca, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total,
  nameUM, undId, conversionFactor, unitOptions, isExonerated, onUnitChange, onExoneratedChange, onInputChangeDeta, fnViewProducts,
  setBulkFormDeta, orderDetail, setOrderDetail, fnRecalculateTotals, formValidationDeta, isFormValidDeta, sendFormDeta, setSendFormDeta}) => {

  const {productCodeValid, qtyValid, priceValid, undIdValid} = formValidationDeta;

  const onQtyChange = e =>{
    const subtotal = validFloat(price) * e.target.value;
    const discValue = (subtotal * validFloat(percentDiscount))/100;
    const taxValue = ((subtotal-discValue) * validFloat(percentTax))/100;
    const totalValue = subtotal - discValue + taxValue;

    const newQty = {
      qty: e.target.value,
      subTotal: subtotal,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newQty);
  }

  const onPriceChange = e =>{
    const subtotal = validFloat(qty) * e.target.value;
    const discValue = (subtotal * validFloat(percentDiscount))/100;
    const taxValue = ((subtotal-discValue) * validFloat(percentTax))/100;
    const totalValue = subtotal - discValue + taxValue;

    const newPrice = {
      price: e.target.value,
      subTotal: subtotal,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newPrice);
  }

  const onDiscountChange = e =>{
    const subtotal = validFloat(qty) * validFloat(price);
    const discValue = (subtotal * validFloat(e.target.value))/100;
    const taxValue = ((subtotal-discValue) * validFloat(percentTax))/100;
    const totalValue = subtotal - discValue + taxValue;

    const newDiscount = {
      percentDiscount: e.target.value,
      subTotal: subtotal,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newDiscount);
  }

  const onTaxChange = e =>{
    const subtotal = validFloat(qty) * validFloat(price);
    const discValue = (subtotal * validFloat(percentDiscount))/100;
    const taxValue = ((subtotal-discValue) * validFloat(e.target.value))/100;
    const totalValue = subtotal - discValue + taxValue;

    const newTax = {
      percentTax: e.target.value,
      subTotal: subtotal,
      discount: discValue,
      tax: taxValue,
      total: totalValue
    }
    setBulkFormDeta(newTax);
  }

  const fnAddProduct = ()=>{
    setSendFormDeta(true);
    if(!isFormValidDeta){
      return;
    }

    const detail = {
      id: new Date().getTime(),
      productCode,
      nameProduct,
      marca,
      qty: validFloat(qty),
      qtyReceibed: 0,
      qtyRec: 0,
      qtyMissing: validFloat(qty),
      price: validFloat(price),
      subTotal: validFloat(subTotal),
      percentDiscount: validFloat(percentDiscount),
      discount: validFloat(discount),
      percentTax: validFloat(percentTax),
      tax: validFloat(tax),
      total: validFloat(total),
      nameUM,
      undId: validInt(undId),
      conversionFactor: validFloat(conversionFactor) || 1,
      // Legacy (tax_type): 1 = Exonerado (checkbox), no un tramo de impuesto derivado.
      taxType: isExonerated ? 1 : 0
    }

    const newArray = [...orderDetail, detail];
    setOrderDetail(newArray);
    fnRecalculateTotals(newArray);

    // limpiar inputs para agregar otro producto
    const cleanProd = {
      productCode: "",
      nameProduct: "",
      marca: "",
      qty: 1,
      price: 0,
      subTotal: 0,
      percentDiscount: 0,
      discount: 0,
      percentTax: 0,
      tax: 0,
      total: 0,
      nameUM: "",
      undId: 0,
      conversionFactor: 1,
      unitOptions: [],
      isExonerated: false
    }
    setBulkFormDeta(cleanProd);
    setSendFormDeta(false);
  }

  return (
    <Row className='mt-3'>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.purchaseOrders.title.addProducts">
          <Row>
            <Colxx xxs="12" xs="5" md="3" lg="2">
              <InputField
                name="productCode"
                label='page.purchaseOrders.input.productCode'
                value={productCode}
                onChange={onInputChangeDeta}
                type="text"
                readOnly
                onClick={fnViewProducts}
                invalid={sendFormDeta && !!productCodeValid}
                feedbackText={sendFormDeta && (productCodeValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="7" md="4" lg="3">
              <InputField
                name="nameProduct"
                label='page.purchaseOrders.input.nameProduct'
                value={nameProduct}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="3" lg="2">
              <SimpleSelect
                name="undId"
                label='page.purchaseOrders.input.unit'
                value={undId}
                onChange={onUnitChange}
                options={unitOptions}
                invalid={sendFormDeta && !!undIdValid}
                feedbackText={sendFormDeta && (undIdValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="qty"
                label='page.purchaseOrders.input.qty'
                value={qty}
                onChange={onQtyChange}
                type="text"
                invalid={sendFormDeta && !!qtyValid}
                feedbackText={sendFormDeta && (qtyValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="price"
                label='page.purchaseOrders.input.price'
                value={price}
                onChange={onPriceChange}
                type="text"
                invalid={sendFormDeta && !!priceValid}
                feedbackText={sendFormDeta && (priceValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="subTotal"
                label='page.purchaseOrders.input.subTotal'
                value={subTotal}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="percentDiscount"
                label='page.purchaseOrders.input.percentDiscount'
                value={percentDiscount}
                onChange={onDiscountChange}
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="discount"
                label='page.purchaseOrders.input.discount'
                value={formatNumber(discount)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="percentTax"
                label='page.purchaseOrders.input.percentTax'
                value={percentTax}
                onChange={onTaxChange}
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="tax"
                label='page.purchaseOrders.input.tax'
                value={formatNumber(tax)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2" className="d-flex align-items-end">
              <Checkbox
                name="isExonerated"
                label="page.purchaseOrders.checkbox.exonerated"
                value={isExonerated}
                onChange={onExoneratedChange}
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2">
              <InputField
                name="total"
                label='page.purchaseOrders.input.total'
                value={formatNumber(total)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="4" md="3" lg="2" align="right">
              <Button color="primary" onClick={() => {fnAddProduct()}}>
                <i className='bi bi-plus' /> {IntlMessages("button.add")}
              </Button>
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}

export default DetailProduct