import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useOtherPurchases } from './useOtherPurchases';
import DateCalendar from '@Components/dateCalendar';
import { RadioGroup } from '@Components/radioGroup';
import ControlPanel from '@Components/controlPanel';
import { Separator } from '@Components/common/CustomBootstrap';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalSearchOtherPurchases from './ModalSearchOtherPurchases';
import OtherPurchaseNotices from './OtherPurchaseNotices';
import { CASH, MAX, localToday } from './otherPurchaseRules';

const OtherPurchases = (props) => {
  const { setLoading } = props;
  const {
    listDocuments, listTaxStatNames, listProviders, listPaymentTypes, listLedgerAccounts, listWorkOrders,
    formState, formValidation, onInputChange, sendForm, propsToControlPanel, openSearch, setOpenSearch, fnLoadDocument,
    editLock, locked, paymentStatus, pendingAccounting,
    openMsgCancelDocument, setOpenMsgCancelDocument, fnOkCancelDocument,
    openMsgAccountDocument, setOpenMsgAccountDocument, fnOkAccountDocument
  } = useOtherPurchases({ setLoading });

  const { id, documentCode, documentId, typeTax, date, dateOut, typeFp, providerType, purchaseOrderId, workOrderId, providerId, paymentTypeId, cai, invoiceNumber, description, expenseCtaCode, exemptedCertificate, exemptedNumber, exemptedRecord, subtotal, discount, valueExonerated, valueExempt, valueTaxable, tax, freight, otherCharges, total, requestedBy } = formState;

  const { documentCodeValid, typeTaxValid, dateValid, dateOutValid, typeFpValid, providerIdValid, paymentTypeIdValid, invoiceNumberValid, expenseCtaCodeValid, descriptionValid, requestedByValid, totalValid } = formValidation;
  // Máximos de los textos (los del DTO del back) y errores por campo, solo tras intentar guardar.
  const showError = (valid) => sendForm && (valid || null);
  const maxOf = (field) => MAX[field];
  const caiValid = formValidation.caiValid;
  const amountValid = (field) => showError(formValidation[`${field}Valid`]);
  // Con Contado en un documento nuevo el vencimiento es la fecha del documento.
  const dueDateDisabled = locked('dateOut') || (Number(id) === 0 && Number(typeFp) === CASH);

  const propsToModalPurchases = {
    ModalContent: ModalSearchOtherPurchases,
    title: "page.purchases.modal.viewPurchases.title",
    open: openSearch,
    setOpen: setOpenSearch,
    maxWidth: 'lg',
    data: { fnLoadDocument }
  }

  const propsToMsgCancelDocument = {
    open: openMsgCancelDocument,
    setOpen: setOpenMsgCancelDocument,
    fnOnOk: fnOkCancelDocument,
    title: "msg.question.cancel.document.title"
  }

  const propsToMsgAccountDocument = {
    open: openMsgAccountDocument,
    setOpen: setOpenMsgAccountDocument,
    fnOnOk: fnOkAccountDocument,
    title: "msg.question.accountDocument.title"
  }

  const amountField = (name, label, value) => (
    <Colxx xxs={12} xs={6} md={4}>
      <InputField
        label={label}
        name={name}
        value={value}
        onChange={onInputChange}
        type="number"
        min="0"
        disabled={locked(name)}
        invalid={sendForm && !!formValidation[`${name}Valid`]}
        feedbackText={amountValid(name)}
      />
    </Colxx>
  );

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <OtherPurchaseNotices editLock={editLock} pendingAccounting={pendingAccounting} paymentStatus={paymentStatus} />
              <Row>
                <Colxx xxs={12} md={8} lg={9} className="order-xs-2 order-lg-1">
                  <Row>
                    <Colxx xxs={12} sm={6} >
                      <SearchSelect
                        label="page.purchases.modal.complementary.select.typeTax"
                        name="typeTax"
                        inputValue={typeTax}
                        options={listTaxStatNames}
                        onChange={onInputChange}
                        invalid={sendForm && !!typeTaxValid}
                        feedbackText={showError(typeTaxValid)}
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} >
                      <SearchSelect
                        label="pages.select.documentCode"
                        name="documentCode"
                        inputValue={documentCode}
                        options={listDocuments}
                        onChange={onInputChange}
                        isDisabled={Number(id) > 0}
                        invalid={sendForm && !!documentCodeValid}
                        feedbackText={showError(documentCodeValid)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} xl={5} >
                      <SearchSelect
                        label="page.purchases.input.providerId"
                        name="providerId"
                        inputValue={providerId}
                        options={listProviders}
                        onChange={onInputChange}
                        isDisabled={locked('providerId')}
                        invalid={sendForm && !!providerIdValid}
                        feedbackText={showError(providerIdValid)}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6} xl={5}>
                      <SearchSelect
                        label="page.purchases.select.paymentTypeId"
                        name="paymentTypeId"
                        inputValue={paymentTypeId}
                        options={listPaymentTypes}
                        onChange={onInputChange}
                        isDisabled={locked('paymentTypeId')}
                        invalid={sendForm && !!paymentTypeIdValid}
                        feedbackText={showError(paymentTypeIdValid)}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6} xl={2}>
                      <InputField
                        label="page.purchases.input.orderId"
                        name="purchaseOrderId"
                        value={purchaseOrderId}
                        disabled
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={6}>
                      <RadioGroup
                        label="page.otherPurchases.providerType"
                        name="providerType"
                        value={providerType}
                        onChange={onInputChange}
                        options={[
                          { id: 1, label: 'page.otherPurchases.providerType.supplier', disabled: locked('providerId') },
                          { id: 2, label: 'page.otherPurchases.providerType.creditor', disabled: locked('providerId') }
                        ]}
                        display='flex'
                      />
                    </Colxx>
                  </Row>
                  <hr />
                  <Row>
                    <Colxx xxs="12" xl="8">
                      <InputField
                        name="cai"
                        label='page.purchases.input.cai'
                        value={cai}
                        onChange={onInputChange}
                        type="text"
                        mask="******-******-******-******-******-**"
                        maskChar=" "
                        invalid={sendForm && !!caiValid}
                        feedbackText={showError(caiValid)}
                      />
                    </Colxx>
                    <Colxx xxs="12" xl="4">
                      <InputField
                        name="invoiceNumber"
                        label='page.purchases.input.numCai'
                        value={invoiceNumber}
                        onChange={onInputChange}
                        type="text"
                        maxLength={maxOf('invoiceNumber')}
                        disabled={locked('invoiceNumber')}
                        invalid={sendForm && !!invoiceNumberValid}
                        feedbackText={showError(invoiceNumberValid)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12}>
                      <InputField
                        label="page.purchases.input.description"
                        name="description"
                        value={description}
                        onChange={onInputChange}
                        type="textarea"
                        maxLength={maxOf('description')}
                        invalid={sendForm && !!descriptionValid}
                        feedbackText={showError(descriptionValid)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={6} >
                      <SearchSelect
                        label="page.purchases.select.accountExpense"
                        name="expenseCtaCode"
                        inputValue={expenseCtaCode}
                        options={listLedgerAccounts}
                        onChange={onInputChange}
                        invalid={sendForm && !!expenseCtaCodeValid}
                        feedbackText={showError(expenseCtaCodeValid)}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6} >
                      <SearchSelect
                        label="select.workOrderId"
                        name="workOrderId"
                        inputValue={workOrderId}
                        options={listWorkOrders}
                        onChange={onInputChange}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={4}>
                      <InputField
                        label="page.purchases.input.exemptedNumber"
                        name="exemptedNumber"
                        value={exemptedNumber}
                        onChange={onInputChange}
                        maxLength={maxOf('exemptedNumber')}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={4}>
                      <InputField
                        label="page.purchases.input.exemptedCertificate"
                        name="exemptedCertificate"
                        value={exemptedCertificate}
                        onChange={onInputChange}
                        maxLength={maxOf('exemptedCertificate')}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={4}>
                      <InputField
                        label="page.purchases.input.exemptedRecord"
                        name="exemptedRecord"
                        value={exemptedRecord}
                        onChange={onInputChange}
                        maxLength={maxOf('exemptedRecord')}
                      />
                    </Colxx>
                  </Row>
                  <hr />
                  <Row>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.subtotal"
                        name="subtotal"
                        value={subtotal}
                        type="number"
                        disabled
                      />
                    </Colxx>
                    {amountField('discount', 'input.discount', discount)}
                    {amountField('valueExonerated', 'input.valueExoneratedted', valueExonerated)}
                    {amountField('valueExempt', 'input.valueExempt', valueExempt)}
                    {amountField('valueTaxable', 'input.taxed', valueTaxable)}
                    {amountField('tax', 'input.tax', tax)}
                    {amountField('freight', 'input.flete', freight)}
                    {amountField('otherCharges', 'input.otherCharges', otherCharges)}
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.total"
                        name="total"
                        value={total}
                        type="number"
                        disabled
                        invalid={sendForm && !!totalValid}
                        feedbackText={showError(totalValid)}
                      />
                    </Colxx>
                  </Row>
                  <hr />
                  <Row>
                    <Colxx xxs={12}>
                      <InputField
                        label="page.purchases.input.nameRequire"
                        name="requestedBy"
                        value={requestedBy}
                        onChange={onInputChange}
                        maxLength={maxOf('requestedBy')}
                        invalid={sendForm && !!requestedByValid}
                        feedbackText={showError(requestedByValid)}
                      />
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs={12} lg={3} className="order-xs-1 order-lg-2">
                  <Row>
                    <Colxx xxs={12} sm={6} lg={12}>
                      <DateCalendar
                        name="date"
                        label="pages.input.date"
                        value={date}
                        onChange={onInputChange}
                        maxDate={new Date(`${localToday()}T12:00:00`)}
                        disabled={locked('date')}
                        invalid={sendForm && !!dateValid}
                        feedbackText={showError(dateValid)}
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12}>
                      <DateCalendar
                        name="dateOut"
                        label="pages.input.dateOut"
                        value={dateOut}
                        onChange={onInputChange}
                        disabled={dueDateDisabled}
                        invalid={sendForm && !!dateOutValid}
                        feedbackText={showError(dateOutValid)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm={6} lg={12}>
                      <RadioGroup
                        label="page.purchases.radio.typePurchase"
                        name="typeFp"
                        value={typeFp}
                        onChange={onInputChange}
                        options={[
                          { id: 1, label: 'page.purchases.radio.cash', disabled: locked('typeFp') },
                          { id: 2, label: 'page.purchases.radio.credit', disabled: locked('typeFp') }
                        ]}
                        display='flex'
                        invalid={sendForm && !!typeFpValid}
                        feedbackText={showError(typeFpValid)}
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12}>
                      <InputField
                        label="pages.input.documentId"
                        name="documentId"
                        value={documentId}
                        disabled
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPurchases} />
      <Confirmation {...propsToMsgCancelDocument} />
      <Confirmation {...propsToMsgAccountDocument} />
    </>
  );
}
export default OtherPurchases;
