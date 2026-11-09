import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { Button, Row } from 'reactstrap'
import { formatNumber, IntlMessages } from '@Helpers/Utils'
import { Checkbox } from '@Components/checkbox'
import DateCalendar from '@Components/dateCalendar'
import { useDetailProduct } from './useDetailProduct'
import { packFactor, toBaseUnits } from './purchaseRules'

const DetailProduct = ({idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, taxValue, total,
  lotCode, dateOut, isExonerated, isBonus, packQty, previousCost, currentExistence, storeId, onInputChangeDeta, fnViewProducts,setBulkFormDeta, setPurchaseDetail, formValidationDeta, sendFormDeta,setSendFormDeta, isProcessed = false}) => {

  const {productCodeValid, qtyValid, priceValid, discountPercentValid, taxPercentValid, lotCodeValid} = formValidationDeta;

  const {onQtyChange, onPriceChange, onDiscountChange, onTaxChange, onIsExoneratedChange, onIsBonusChange, disabledIsExonerated, disabledIsBonus, fnAddProduct} = useDetailProduct({idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, taxValue, total, lotCode, dateOut, isExonerated, isBonus, packQty, setBulkFormDeta, setPurchaseDetail, setSendFormDeta});

  return (
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label="page.purchaseOrders.title.addProducts">
          {/* SPEC v2-29-sr: en una compra procesada no se agregan ni cambian líneas (el back lo rechaza). */}
          <fieldset disabled={isProcessed} className="border-0 p-0 m-0" style={{ minWidth: 0 }}>
          <Row>
            <Colxx xxs="12" md="8" lg="10">
              <Row>
                <Colxx xxs="12" xs="6" lg="4" xl="3">
                  <InputField
                    name="productCode"
                    label='page.purchases.input.productCodeRequired'
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
                    label='page.purchases.input.qtyRequired'
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
                    label='page.purchases.input.priceRequired'
                    value={price}
                    onChange={onPriceChange}
                    type="text"
                    invalid={sendFormDeta && !!priceValid}
                    feedbackText={sendFormDeta && (priceValid || null)}
                  />
                </Colxx>
                {packFactor({ packQty }) > 1 && (
                  <Colxx xxs="12" xs="4" lg="3" xl="2">
                    <InputField
                      name="qtyBase"
                      label='page.purchases.input.qtyBase'
                      value={formatNumber(toBaseUnits({ qty, price, packQty }).qty)}
                      onChange={onInputChangeDeta}
                      type="text"
                      disabled
                    />
                  </Colxx>
                )}
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
                    invalid={sendFormDeta && !!discountPercentValid}
                    feedbackText={sendFormDeta && (discountPercentValid || null)}
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
                    disabled={isExonerated === true || isExonerated === 1}
                    invalid={sendFormDeta && !!taxPercentValid}
                    feedbackText={sendFormDeta && (taxPercentValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" lg="3" xl="2">
                  <InputField
                    name="taxValue"
                    label='page.purchaseOrders.input.tax'
                    value={formatNumber(taxValue)}
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
                    maxLength={20}
                    invalid={sendFormDeta && !!lotCodeValid}
                    feedbackText={sendFormDeta && (lotCodeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8" lg="5" xl="4">
                  <DateCalendar
                    name="dateOut"
                    label="page.purchases.input.dateOutProd"
                    value={dateOut}
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
                        name="isExonerated"
                        label='page.purchases.check.exonerated'
                        value={isExonerated}
                        onChange={onIsExoneratedChange}
                        disabled={disabledIsExonerated}
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
          </fieldset>
        </ContainerWithLabel>
      </Colxx>
    </Row>
  )
}

export default DetailProduct