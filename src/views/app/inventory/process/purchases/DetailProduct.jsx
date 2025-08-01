import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { Button, Row } from 'reactstrap'
import { formatNumber, IntlMessages } from '@/helpers/Utils'
import { Checkbox } from '@/components/checkbox'
import DateCalendar from '@/components/dateCalendar'
import { useDetailProduct } from './useDetailProduct'

const DetailProduct = ({idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, tax, total,
  lotCode, dateOutProd, isTaxFree, isBonus, previousCost, currentExistence, storeId, onInputChangeDeta, fnViewProducts,setBulkFormDeta, purchaseDetail, setPurchaseDetail, setBulkForm, formValidationDeta, isFormValidDeta, sendFormDeta,setSendFormDeta}) => {

  const {productCodeValid, qtyValid, priceValid} = formValidationDeta;

  const {onQtyChange, onPriceChange, onDiscountChange, onTaxChange, onIsTaxChange, onIsBonusChange, disabledIsTaxFree, disabledIsBonus, fnAddProduct} = useDetailProduct({idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, tax, total, lotCode, dateOutProd, isTaxFree, isBonus,setBulkFormDeta, purchaseDetail, setPurchaseDetail, setBulkForm, isFormValidDeta, setSendFormDeta});

  return (
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.purchaseOrders.title.addProducts">
          <Row>
            <Colxx xxs="12" md="8" lg="10">
              <Row>
                <Colxx xxs="12" xs="6" lg="4" xl="3">
                  <InputField
                    name="productCode"
                    label='page.purchaseOrders.input.productCode'
                    value={productCode}
                    onChange={onInputChangeDeta}
                    type="text"
                    readOnly
                    onClick={()=>fnViewProducts(storeId)}
                    invalid={sendFormDeta && !!productCodeValid}
                    feedbackText={sendFormDeta && (productCodeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="12" lg="8" xl="5">
                  <InputField
                    name="nameProduct"
                    label='page.purchaseOrders.input.nameProduct'
                    value={nameProduct}
                    onChange={onInputChangeDeta}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
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
                <Colxx xxs="12" xs="4" lg="3" xl="2">
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
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="subTotal"
                    label='page.purchaseOrders.input.subTotal'
                    value={subTotal}
                    onChange={onInputChangeDeta}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="discountPercent"
                    label='page.purchaseOrders.input.percentDiscount'
                    value={discountPercent}
                    onChange={onDiscountChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="discount"
                    label='page.purchaseOrders.input.discount'
                    value={formatNumber(discount)}
                    onChange={onInputChangeDeta}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="taxPercent"
                    label='page.purchaseOrders.input.percentTax'
                    value={taxPercent}
                    onChange={onTaxChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="tax"
                    label='page.purchaseOrders.input.tax'
                    value={formatNumber(tax)}
                    onChange={onInputChangeDeta}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="total"
                    label='page.purchaseOrders.input.total'
                    value={formatNumber(total)}
                    onChange={onInputChangeDeta}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="lotCode"
                    label='page.purchases.input.lotCode'
                    value={lotCode}
                    onChange={onInputChangeDeta}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="8" lg="5" xl="4">
                  <DateCalendar
                    name="dateOut"
                    label="page.purchases.input.dateOutProd"
                    value={dateOutProd}
                    onChange={onInputChangeDeta}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="4" xl="6" align="right">
                  <Button color="primary" onClick={() => {fnAddProduct()}}>
                    <i className='bi bi-plus' /> {IntlMessages("button.add")}
                  </Button>
                </Colxx>
              </Row>
            </Colxx>
            <Colxx xxs="12" md="4" lg="2">
              <Row>
                <Colxx xxs="12" xs="4" md="12">
                  <Row className='mb-2'>
                    <Colxx xxs="12">
                      <Checkbox
                        name="isTaxFree"
                        label='page.purchases.check.exonerated'
                        value={isTaxFree}
                        onChange={onIsTaxChange}
                        disabled={disabledIsTaxFree}
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <Checkbox
                        name="isBonus"
                        label='page.purchases.check.bonification'
                        value={isBonus}
                        onChange={onIsBonusChange}
                        disabled={disabledIsBonus}
                      />
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs="12" xs="8" md="12">
                  <Row>
                    <Colxx xxs="12" xs="6" md="12">
                      <InputField
                        name="previousCost"
                        label='page.purchases.input.previousCost'
                        value={formatNumber(previousCost)}
                        onChange={onInputChangeDeta}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs="12" xs="6" md="12">
                      <InputField
                        name="currentExistence"
                        label='page.purchases.input.currentExistence'
                        value={formatNumber(currentExistence)}
                        onChange={onInputChangeDeta}
                        type="text"
                        disabled
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
            </Colxx>
          </Row>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}

export default DetailProduct