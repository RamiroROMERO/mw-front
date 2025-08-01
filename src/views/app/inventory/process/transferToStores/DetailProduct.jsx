import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { IntlMessages, formatNumber } from '@/helpers/Utils'
import DateCalendar from '@/components/dateCalendar'
import { useDetailProduct } from './useDetailProduct'

const DetailProduct = ({idProd, productCode, nameProduct, currentExistence, cost, qty, lotCode, dateOut, sourceStoreId, assignStoreId, total, onInputChangeDeta, fnViewProducts, setBulkFormDeta, transferDetail, setTransferDetail, sendFormDeta,setSendFormDeta, isFormValidDeta, formValidationDeta, setSendForm, isFormValid, noCtaOrigin, noCtaAssign}) => {

  const {onQtyChange, fnAddProduct} = useDetailProduct({idProd, productCode, nameProduct, currentExistence, cost, qty, lotCode, dateOut, sourceStoreId, assignStoreId, total, setBulkFormDeta, transferDetail, setTransferDetail, isFormValidDeta, setSendFormDeta, setSendForm, isFormValid, noCtaOrigin, noCtaAssign});

  const {productCodeValid, qtyValid, costValid} = formValidationDeta;

  return (
    <Row>
      <Colxx xxs="12">
        <ContainerWithLabel label="label.title.addProducts">
          <Row>
            <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
              <InputField
                name="productCode"
                label='input.productCode'
                value={productCode}
                onChange={onInputChangeDeta}
                type="text"
                readOnly
                onClick={()=>fnViewProducts(sourceStoreId)}
                invalid={sendFormDeta && !!productCodeValid}
                feedbackText={sendFormDeta && (productCodeValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="12" sm="8" lg="6" xl="6">
              <InputField
                name="nameProduct"
                label='input.name'
                value={nameProduct}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
              <InputField
                name="currentExistence"
                label='input.currentExistence'
                value={formatNumber(currentExistence)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
              <InputField
                name="cost"
                label='input.cost'
                value={formatNumber(cost)}
                onChange={onInputChangeDeta}
                type="text"
                disabled
                invalid={sendFormDeta && !!costValid}
                feedbackText={sendFormDeta && (costValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
              <InputField
                name="qty"
                label='input.qty'
                value={qty}
                onChange={onQtyChange}
                type="text"
                invalid={sendFormDeta && !!qtyValid}
                feedbackText={sendFormDeta && (qtyValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
              <InputField
                name="lotCode"
                label='input.lotCode'
                value={lotCode}
                onChange={onInputChangeDeta}
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" xs="7" sm="5" lg="3" xl="4">
              <DateCalendar
                name="dateOut"
                label="input.dateOutProd"
                value={dateOut}
                onChange={onInputChangeDeta}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" sm="3" lg="12" xl="4" align="right">
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