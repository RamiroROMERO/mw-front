import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { formatNumber, IntlMessages, validFloat, validInt } from '@/helpers/Utils'
import { Button, Row } from 'reactstrap'

const DetailProduct = ({productCode, nameProduct, qty, price, subTotal, percentDiscount, discount, percentTax, tax, total,
  nameUM, onInputChangeDeta, fnViewProducts, setBulkFormDeta, orderDetail, setOrderDetail, setBulkForm, formValidationDeta,
  isFormValidDeta, sendFormDeta, setSendFormDeta}) => {

  const {productCodeValid, qtyValid, priceValid} = formValidationDeta;

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

    const taxedValue = tax > 0 ? subTotal : 0;
    const exemptValue = tax === 0 ? subTotal : 0;

    const taxType = validInt(percentTax) === 15 ? 1 : validInt(percentTax) === 18 ? 2 : 0;

    const detail = {
      id: new Date().getTime(),
      productCode,
      nameProduct,
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
      taxType,
      subtotTaxValue: validFloat(taxedValue),
      subTotExeValue: validFloat(exemptValue)
    }

    const sumDiscount = orderDetail.map(item => validFloat(item.discount)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = orderDetail.map(item => validFloat(item.subTotExeValue)).reduce((prev, curr) => prev + curr, 0);
    
    const sumTaxes = orderDetail.map(item => validFloat(item.tax)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = orderDetail.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = orderDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
    
    const valueTaxed =  validFloat(taxedValue) + sumTaxed;
    const valueTaxes = validFloat(tax) + sumTaxes;
    const totalInvoice = validFloat(total) + sumTotal;

    const addProduct = {
      valueExcent: validFloat(exemptValue) + sumExempt,
      valueTaxed,
      valueTax: valueTaxes,
      valueDiscount: validFloat(discount) + sumDiscount,
      valueTotal: totalInvoice
    }
    setBulkForm(addProduct);

    setOrderDetail(current => [...current, detail]);
    // limpiar inputs para agregar otro producto
    const cleanProd = {
      productCode: "",
      nameProduct: "",
      qty: 1,
      price: 0,
      subTotal: 0,
      percentDiscount: 0,
      discount: 0,
      percentTax: 0,
      tax: 0,
      total: 0,
      nameUM: ""
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
            <Colxx xxs="12" xs="7" md="6" lg="4">
              <InputField
                name="nameProduct"
                label='page.purchaseOrders.input.nameProduct'
                value={nameProduct}
                onChange={onInputChangeDeta}
                type="text"
                disabled
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