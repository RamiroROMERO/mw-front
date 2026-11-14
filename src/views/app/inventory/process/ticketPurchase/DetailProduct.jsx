import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { Button, Input, InputGroup, Row } from 'reactstrap'
import { InputField } from '@Components/inputFields'
import { InputLabel } from '@Components/inputLabel'
import { IntlMessages } from '@Helpers/Utils'
import { Checkbox } from '@Components/checkbox'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { MAX } from './ticketPurchaseRules'
import { useDetailProduct } from './useDetailProduct'

// Formulario "agregar producto". Obligatorios (*): nombre, cantidad y precio (> 0, 2 decimales, máximo 999,999.99) y, con Contabilidad
// activa, la cuenta de costo/gasto. El producto es opcional (hay boletas de texto libre) salvo con "Al Inventario", que además pide el
// almacén. El producto se busca con la lupa (F1 del legacy) en el catálogo.
const DetailProduct = ({
  idProd, productCode, nameProduct, qty, price, total, expenseCtaCode, toInventory, storeId, listAccounts, listStores, onInputChangeDeta,
  fnViewProducts, fnClearProduct, onBulkFormDeta, onResetFormDeta, onBulkForm, ticketDetail, setTicketDetail, sendFormDeta, setSendFormDeta,
  formValidationDeta, isFormValidDeta, accountingActive, processed
}) => {

  const { showStores, onQtyChange, onPriceChange, onToInventoryChange, fnApplyAccount, fnAddProduct } = useDetailProduct({
    formStateDeta: { idProd, productCode, nameProduct, qty, price, expenseCtaCode, toInventory, storeId },
    onBulkFormDeta, onResetFormDeta, onBulkForm, ticketDetail, setTicketDetail, isFormValidDeta, setSendFormDeta, accountingActive
  });

  // IntlMessages es un hook: se llama aquí arriba, nunca dentro de una condición (cambiaría el orden de los hooks entre renders).
  const textSearchProduct = IntlMessages("input.productCode");
  const textClearProduct = IntlMessages("page.ticketPurchase.button.clearProduct");
  const textApplyAccount = IntlMessages("button.applyAccount");
  const textAdd = IntlMessages("button.add");

  const { productCodeValid, nameProductValid, qtyValid, priceValid, totalValid, expenseCtaCodeValid, storeIdValid } = formValidationDeta;
  const show = (message) => sendFormDeta && (message || null);

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="label.title.addProducts">
            <Row>
              <Colxx xxs="12" xs="5" md="3" lg="2">
                <InputLabel label="input.productCode" feedbackText={show(productCodeValid)}>
                  <InputGroup size="sm">
                    <Input
                      bsSize="sm"
                      value={productCode}
                      id="productCode"
                      name="productCode"
                      type="text"
                      readOnly
                      maxLength={MAX.productCode}
                      onClick={processed ? undefined : fnViewProducts}
                      invalid={sendFormDeta && !!productCodeValid}
                      style={{ cursor: 'pointer', resize: 'none', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Button color="secondary" outline disabled={processed} onClick={fnViewProducts} title={textSearchProduct}>
                      <i className="bi bi-search" />
                    </Button>
                    {productCode ? (
                      <Button color="secondary" outline disabled={processed} onClick={fnClearProduct} title={textClearProduct}>
                        <i className="bi bi-x-lg" />
                      </Button>
                    ) : null}
                  </InputGroup>
                </InputLabel>
              </Colxx>
              <Colxx xxs="12" xs="7" md="6" lg="4">
                <InputField
                  name="nameProduct"
                  label='page.ticketPurchase.label.nameRequired'
                  value={nameProduct}
                  onChange={onInputChangeDeta}
                  type="text"
                  maxLength={MAX.name}
                  disabled={processed}
                  invalid={sendFormDeta && !!nameProductValid}
                  feedbackText={show(nameProductValid)}
                />
              </Colxx>
              <Colxx xxs="12" xs="4" md="3" lg="2">
                <InputField
                  name="qty"
                  label='page.ticketPurchase.label.qtyRequired'
                  value={qty}
                  onChange={onQtyChange}
                  type="text"
                  inputMode="decimal"
                  maxLength={10}
                  disabled={processed}
                  invalid={sendFormDeta && !!qtyValid}
                  feedbackText={show(qtyValid)}
                />
              </Colxx>
              <Colxx xxs="12" xs="4" md="3" lg="2">
                <InputField
                  name="price"
                  label='page.ticketPurchase.label.priceRequired'
                  value={price}
                  onChange={onPriceChange}
                  type="text"
                  inputMode="decimal"
                  maxLength={10}
                  disabled={processed}
                  invalid={sendFormDeta && !!priceValid}
                  feedbackText={show(priceValid)}
                />
              </Colxx>
              <Colxx xxs="12" xs="4" md="3" lg="2">
                <InputField
                  name="total"
                  label='input.total'
                  value={total}
                  type="text"
                  disabled
                  invalid={sendFormDeta && !!totalValid}
                  feedbackText={show(totalValid)}
                />
              </Colxx>
              {accountingActive ? (
                <>
                  <Colxx xxs="12" sm="12" md="6" lg="5" xl="7">
                    <Row>
                      <Colxx xxs="12" sm="6" md="12" xl="7">
                        <SearchSelect
                          label='page.ticketPurchase.label.accountRequired'
                          name='expenseCtaCode'
                          inputValue={expenseCtaCode}
                          options={listAccounts}
                          onChange={onInputChangeDeta}
                          isDisabled={processed}
                          invalid={sendFormDeta && !!expenseCtaCodeValid}
                          feedbackText={show(expenseCtaCodeValid)}
                        />
                      </Colxx>
                      <Colxx xxs="12" sm="6" md="12" xl="5">
                        <Button color="secondary" className='mb-3' disabled={processed} onClick={() => fnApplyAccount()}>
                          <i className='bi bi-list-check' /> {textApplyAccount}
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
                      disabled={processed}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="8" md="6" lg="4" xl="3" style={{ display: showStores }}>
                    <SearchSelect
                      label='page.ticketPurchase.label.storeRequired'
                      name='storeId'
                      inputValue={storeId}
                      options={listStores}
                      onChange={onInputChangeDeta}
                      isDisabled={processed}
                      invalid={sendFormDeta && !!storeIdValid}
                      feedbackText={show(storeIdValid)}
                    />
                  </Colxx>
                </>
              ) : null}
              <Colxx xxs="12" align="right">
                <Button color="primary" disabled={processed} onClick={() => { fnAddProduct() }}>
                  <i className='bi bi-plus' /> {textAdd}
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
