import { useState, useEffect } from 'react';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';
import ControlPanel from '@Components/controlPanel';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { RadioGroup } from '@Components/radioGroup';
import Confirmation from '@Containers/ui/confirmationMsg';

// Legacy inv_compras_import_comp.sc2: un solo formulario con los campos de captura arriba
// y el listado de facturas complementarias ya vinculadas (Grid_hw1) abajo.
const ModalComplementaryInvoices = (props) => {
  const { data, setOpen } = props;
  const {
    complementaryList, listDocumentsComplementary, listLedgerAccounts, listTaxStatNames, listProviders, listPaymentTypes,
    formStateComplementary, formValidationComplementary, onInputChangeComplementary,
    sendFormComplementary, fnNewComplementary, fnSelectComplementary, fnSaveComplementary,
    fnAccountComplementary, fnCancelComplementary, openMsgCancelComplementary,
    setOpenMsgCancelComplementary, fnOkCancelComplementary
  } = data;

  const propsToMsgCancelComplementary = {
    open: openMsgCancelComplementary,
    setOpen: setOpenMsgCancelComplementary,
    fnOnOk: fnOkCancelComplementary,
    title: "msg.question.cancel.document.title"
  }

  const { documentCode, typeTax, providerId, cai, numCai, date, dateOut, paymentTypeId, typeFp,
    description, noCtaExpense, subtotal, discount, exonera, exent, gravado, tax, freight, otherCharges, total,
    exemptedCertificate, exemptedNumber, exemptedRecord } = formStateComplementary;

  const { documentCodeValid, typeTaxValid, providerIdValid, caiValid, numCaiValid, dateValid, dateOutValid,
    paymentTypeIdValid, typeFpValid, descriptionValid, noCtaExpenseValid } = formValidationComplementary;

  const propsToControlPanelComplementary = {
    fnNew: fnNewComplementary,
    fnSave: fnSaveComplementary,
    fnCancel: fnCancelComplementary,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountComplementary
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const [table, setTable] = useState({
    title: '',
    columns: [
      { text: IntlMessages("page.purchases.modal.viewPurchases.table.date"), dataField: "dateIn", headerStyle: { width: "15%" } },
      { text: IntlMessages("page.purchases.modal.viewPurchases.table.numCai"), dataField: "numCai", headerStyle: { width: "15%" } },
      { text: IntlMessages("page.purchases.modal.viewPurchases.table.provider"), dataField: "provider", headerStyle: { width: "35%" } },
      { text: IntlMessages("page.purchases.modal.viewPurchases.table.total"), dataField: "valueTotal", headerStyle: { width: "15%" }, style: { textAlign: 'right' } },
      { text: IntlMessages("page.purchases.modal.complementary.table.accounted"), dataField: "accounted", headerStyle: { width: "15%" } }
    ],
    data: complementaryList,
    options: { columnActions: "options" },
    actions: [
      { color: "primary", icon: "eye", toolTip: IntlMessages("button.view"), onClick: fnSelectComplementary }
    ]
  });

  useEffect(() => {
    setTable((prev) => ({ ...prev, data: complementaryList }));
  }, [complementaryList]);

  return (
    <>
      <ModalBody>
        <ControlPanel {...propsToControlPanelComplementary} />
        <Separator className="mt-2 mb-3" />
        <Row>
          <Colxx xxs="12" md="6">
            <SearchSelect
              label='page.purchases.input.document'
              name='documentCode'
              inputValue={documentCode}
              options={listDocumentsComplementary}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!documentCodeValid}
              feedbackText={sendFormComplementary && (documentCodeValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <SearchSelect
              label='page.purchases.modal.complementary.select.typeTax'
              name='typeTax'
              inputValue={typeTax}
              options={listTaxStatNames}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!typeTaxValid}
              feedbackText={sendFormComplementary && (typeTaxValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="6">
            <SearchSelect
              label='page.purchases.input.providerId'
              name='providerId'
              inputValue={providerId}
              options={listProviders}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!providerIdValid}
              feedbackText={sendFormComplementary && (providerIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <SearchSelect
              label='page.purchases.select.paymentTypeId'
              name='paymentTypeId'
              inputValue={paymentTypeId}
              options={listPaymentTypes}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!paymentTypeIdValid}
              feedbackText={sendFormComplementary && (paymentTypeIdValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="4">
            <InputField
              name="cai"
              label='page.purchases.input.cai'
              value={cai}
              onChange={onInputChangeComplementary}
              type="text"
              mask="******-******-******-******-******-**"
              maskChar=" "
              invalid={sendFormComplementary && !!caiValid}
              feedbackText={sendFormComplementary && (caiValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField
              name="numCai"
              label='page.purchases.input.numCai'
              value={numCai}
              onChange={onInputChangeComplementary}
              type="text"
              mask="***-***-**-********"
              maskChar=" "
              invalid={sendFormComplementary && !!numCaiValid}
              feedbackText={sendFormComplementary && (numCaiValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="4">
            <RadioGroup
              label="page.purchases.radio.typePurchase"
              name="typeFp"
              value={typeFp}
              onChange={onInputChangeComplementary}
              options={[
                { id: 1, label: 'page.purchases.radio.cash' },
                { id: 2, label: 'page.purchases.radio.credit' }
              ]}
              display='flex'
              invalid={sendFormComplementary && !!typeFpValid}
              feedbackText={sendFormComplementary && (typeFpValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="6">
            <DateCalendar
              name="date"
              label="page.purchases.input.date"
              value={date}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!dateValid}
              feedbackText={sendFormComplementary && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <DateCalendar
              name="dateOut"
              label="page.purchases.input.dateOut"
              value={dateOut}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!dateOutValid}
              feedbackText={sendFormComplementary && (dateOutValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              label="page.purchases.input.description"
              name="description"
              value={description}
              onChange={onInputChangeComplementary}
              type="textarea"
              invalid={sendFormComplementary && !!descriptionValid}
              feedbackText={sendFormComplementary && (descriptionValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label="page.purchases.select.accountExpense"
              name="noCtaExpense"
              inputValue={noCtaExpense}
              options={listLedgerAccounts}
              onChange={onInputChangeComplementary}
              invalid={sendFormComplementary && !!noCtaExpenseValid}
              feedbackText={sendFormComplementary && (noCtaExpenseValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="4">
            <InputField label="page.purchases.input.exemptedNumber" name="exemptedNumber" value={exemptedNumber} onChange={onInputChangeComplementary} />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField label="page.purchases.input.exemptedCertificate" name="exemptedCertificate" value={exemptedCertificate} onChange={onInputChangeComplementary} />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField label="page.purchases.input.exemptedRecord" name="exemptedRecord" value={exemptedRecord} onChange={onInputChangeComplementary} />
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.subtotal" name="subtotal" value={subtotal} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.discount" name="discount" value={discount} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.exonerated" name="exonera" value={exonera} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.exempt" name="exent" value={exent} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.taxed" name="gravado" value={gravado} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.taxes" name="tax" value={tax} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.totalFreight" name="freight" value={freight} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.table.totalCharges" name="otherCharges" value={otherCharges} onChange={onInputChangeComplementary} type="number" />
          </Colxx>
          <Colxx xxs="12" xs="6" md="3">
            <InputField label="page.purchases.modal.complementary.input.total" name="total" value={total} disabled type="number" />
          </Colxx>
        </Row>
        <Separator className="mt-3 mb-3" />
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <Confirmation {...propsToMsgCancelComplementary} />
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalComplementaryInvoices;
