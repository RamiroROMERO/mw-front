import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { Form, Row } from 'reactstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
// import ReactInputMask from 'react-input-mask';
import DateCalendar from '@Components/dateCalendar'
import { RadioGroup } from '@Components/radioGroup'
import { useIntl } from 'react-intl'
import { validInt } from '@Helpers/Utils'

const FormPurchase = ({ documentCode, storeId, providerId, paymentTypeId, cai, invoiceNumber, date, dateOut, requestedBy, purchaseOrderId,
  typeFp, listDocuments, listStores, listProviders, listPaymentTypes, onInputChange, setBulkForm, formValidation, sendForm }) => {

  const { documentCodeValid, providerIdValid, caiValid, invoiceNumberValid, storeIdValid, paymentTypeIdValid, dateValid, dateOutValid, typeFpValid } = formValidation;
  const intl = useIntl();
  const isCash = validInt(typeFp) === 1;

  const onProviderChange = e => {
    const filterProv = listProviders.find(item => item.value === validInt(e.target.value));

    const newProv = {
      providerType: filterProv ? filterProv.providerType : 0,
      providerId: e.target.value,
      cai: filterProv ? filterProv.cai : ''
    }
    setBulkForm(newProv);
  }

  return (
    <Form className='mt-3'>
      <Row>
        <Colxx className="order-xs-2 order-lg-1" xxs="12" lg="8" xl="9">
          <Row>
            <Colxx xxs="12" md="6">
              <SearchSelect
                label='page.purchases.input.documentRequired'
                name='documentCode'
                inputValue={documentCode}
                options={listDocuments}
                onChange={onInputChange}
                invalid={sendForm && !!documentCodeValid}
                feedbackText={sendForm && (documentCodeValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <SearchSelect
                label='page.purchases.input.providerIdRequired'
                name='providerId'
                inputValue={providerId}
                options={listProviders}
                onChange={onProviderChange}
                invalid={sendForm && !!providerIdValid}
                feedbackText={sendForm && (providerIdValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <InputField
                name="cai"
                label='page.purchases.input.cai'
                value={cai}
                onChange={onInputChange}
                type="text"
                mask="******-******-******-******-******-**"
                maskChar=" "
                maxLength={50}
                invalid={sendForm && !!caiValid}
                feedbackText={sendForm && (caiValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <InputField
                name="invoiceNumber"
                label='page.purchases.input.invoiceNumberRequired'
                value={invoiceNumber}
                onChange={onInputChange}
                type="text"
                mask="***-***-**-********"
                maskChar=" "
                maxLength={40}
                invalid={sendForm && !!invoiceNumberValid}
                feedbackText={sendForm && (invoiceNumberValid || null)}
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12" sm="6" xl="4">
              <SimpleSelect
                name="storeId"
                label="page.purchases.input.storeIdRequired"
                value={storeId}
                onChange={onInputChange}
                options={listStores}
                invalid={sendForm && !!storeIdValid}
                feedbackText={sendForm && (storeIdValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" sm="6" xl="4">
              <SearchSelect
                label='page.purchases.select.paymentTypeIdRequired'
                inputValue={paymentTypeId}
                name='paymentTypeId'
                options={listPaymentTypes}
                onChange={onInputChange}
                invalid={sendForm && !!paymentTypeIdValid}
                feedbackText={sendForm && (paymentTypeIdValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" sm="12" xl="4">
              <InputField
                name="requestedBy"
                label='page.purchases.input.nameRequire'
                value={requestedBy}
                onChange={onInputChange}
                type="text"
                maxLength={50}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx className="order-xs-1 order-lg-2" xxs="12" lg="4" xl="3">
          <Row>
            <Colxx xxs="12" xs="6" lg="12">
              <DateCalendar
                name="date"
                label="page.purchases.input.dateRequired"
                value={date}
                onChange={onInputChange}
                invalid={sendForm && !!dateValid}
                feedbackText={sendForm && (dateValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <DateCalendar
                name="dateOut"
                label="page.purchases.input.dateOut"
                value={dateOut}
                onChange={onInputChange}
                disabled={isCash}
                invalid={sendForm && !!dateOutValid}
                feedbackText={sendForm && (dateOutValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <RadioGroup
                label="page.purchases.radio.typePurchaseRequired"
                name="typeFp"
                value={typeFp}
                onChange={onInputChange}
                options={[
                  { id: 1, label: 'page.purchases.radio.cash' },
                  { id: 2, label: 'page.purchases.radio.credit' }
                ]}
                display='flex'
                invalid={sendForm && !!typeFpValid}
                feedbackText={sendForm && (typeFpValid || null)}
              />
              {/* RadioGroup no pinta su feedbackText */}
              {sendForm && typeFpValid && (<div className="invalid-feedback d-block mb-2">{intl.formatMessage({ id: typeFpValid })}</div>)}
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <InputField
                name="purchaseOrderId"
                label='page.purchases.input.orderId'
                value={purchaseOrderId}
                onChange={onInputChange}
                type="text"
                disabled
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </Form>
  )
}

export default FormPurchase