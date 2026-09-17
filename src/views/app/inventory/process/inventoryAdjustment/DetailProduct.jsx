import { Button, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import DateCalendar from '@Components/dateCalendar'
import { useDetailProduct } from './useDetailProduct'

const DetailProduct = ({idProd, productCode, nameProduct, currentExistence, cost, qty, lotCode, dateOut, sourceStoreId, total, onInputChangeDeta, fnViewProducts, setBulkFormDeta, transferDetail, setTransferDetail, sendFormDeta, setSendFormDeta, isFormValidDeta, formValidationDeta, setSendForm, isFormValid, disabled}) => {

  const {onQtyChange, fnAddProduct} = useDetailProduct({idProd, productCode, nameProduct, qty, cost, total, lotCode, dateOut, sourceStoreId, setBulkFormDeta, transferDetail, setTransferDetail, isFormValidDeta, setSendFormDeta, setSendForm, isFormValid});

  const {productCodeValid, costValid} = formValidationDeta;

  if (disabled) return null;

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
            <Colxx xxs="12" xs="12" sm="8" lg="4" xl="4">
              <InputField
                name="nameProduct"
                label='input.name'
                value={nameProduct}
                onChange={onInputChangeDeta}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="4" lg="2" xl="2">
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
            <Colxx xxs="12" xs="6" sm="4" lg="2" xl="2">
              <InputField
                name="currentExistence"
                label='page.inventoryAdjustment.input.systemQty'
                value={formatNumber(currentExistence)}
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="4" lg="2" xl="2">
              <InputField
                name="qty"
                label='page.inventoryAdjustment.input.physicalQty'
                value={qty}
                onChange={onQtyChange}
                type="text"
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
            <Colxx xxs="12" xs="7" sm="5" lg="4" xl="4">
              <DateCalendar
                name="dateOut"
                label="input.dateOutProd"
                value={dateOut}
                onChange={onInputChangeDeta}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" sm="3" lg="12" xl="2" align="right">
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
