import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { Button, Row } from 'reactstrap'
import { InputField } from '@/components/inputFields'
import { IntlMessages } from '@/helpers/Utils'
import { Checkbox } from '@/components/checkbox'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { useDetailProduct } from './useDetailProduct'

const DetailProduct = ({idProd, productCode, nameProduct, qty, price, total, accountId, toInventory, storeId, listAccounts, onInputChangeDeta, listStores, fnViewProducts, onBulkFormDeta, onBulkForm, ticketDetail, setTicketDetail, sendFormDeta, setSendFormDeta, formValidationDeta, isFormValidDeta}) => {

  const {showStores, onQtyChange, onPriceChange, onToInventoryChange, fnApplyAccount, fnAddProduct} = useDetailProduct({onBulkFormDeta, idProd, productCode, nameProduct, price, qty, total, accountId, toInventory, storeId, ticketDetail, setTicketDetail, onBulkForm, setSendFormDeta, isFormValidDeta});

  const {productCodeValid, qtyValid, priceValid, accountIdValid} = formValidationDeta;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="label.title.addProducts">
            <Row>
              <Colxx xxs="12" xs="5" md="3" lg="2">
                <InputField
                  name="productCode"
                  label='input.productCode'
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
                  label='input.name'
                  value={nameProduct}
                  onChange={onInputChangeDeta}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="4" md="3" lg="2">
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
              <Colxx xxs="12" xs="4" md="3" lg="2">
                <InputField
                  name="price"
                  label='input.price'
                  value={price}
                  onChange={onPriceChange}
                  type="text"
                  invalid={sendFormDeta && !!priceValid}
                  feedbackText={sendFormDeta && (priceValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xs="4" md="3" lg="2">
                <InputField
                  name="total"
                  label='input.total'
                  value={total}
                  onChange={onInputChangeDeta}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" sm="12" md="6" lg="5" xl="7">
                <Row>
                  <Colxx xxs="12" sm="6" md="12" xl="7">
                    <SearchSelect
                      label='select.accountId'
                      name='accountId'
                      inputValue={accountId}
                      options={listAccounts}
                      onChange={onInputChangeDeta}
                      invalid={sendFormDeta && !!accountIdValid}
                      feedbackText={sendFormDeta && (accountIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" md="12" xl="5">
                    <Button color="secondary" className='mb-3' onClick={() => fnApplyAccount()}>
                      <i className='bi bi-list-check' /> {IntlMessages("button.applyAccount")}
                    </Button>
                  </Colxx>
                </Row>
              </Colxx>
              <Colxx xxs="12" sm="4" md="3" lg="3" xl="2">
                <Checkbox
                  name="toInventory"
                  label='page.ticketPurchase.check.toInventory'
                  value={toInventory}
                  onChange={onToInventoryChange}
                />
              </Colxx>
              <Colxx xxs="12" sm="8" md="6" lg="4" xl="3" style={{display: showStores}}>
                <SearchSelect
                  label='select.storeId'
                  name='storeId'
                  inputValue={storeId}
                  options={listStores}
                  onChange={onInputChangeDeta}
                />
              </Colxx>
              <Colxx xxs="12" align="right">
                <Button color="primary" onClick={() => {fnAddProduct()}}>
                  <i className='bi bi-plus' /> {IntlMessages("button.add")}
                </Button>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </>
  )
}

export default DetailProduct