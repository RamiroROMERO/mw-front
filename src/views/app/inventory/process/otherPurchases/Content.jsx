import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { useOtherPurchases } from './useOtherPurchases';
import DateCalendar from '@/components/dateCalendar';
import { RadioGroup } from '@/components/radioGroup';
// import ReactInputMask from 'react-input-mask';
import ControlPanel from '@/components/controlPanel';
import { Separator } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import ModalViewPurchases from '../purchases/ModalViewPurchases';

const OtherPurchases = (props) => {
  const { setLoading } = props;
  const { listDocuments, listProviders, listPaymentTypes, listLedgerAccounts, formState, formValidation, isFormValid, onInputChange, sendForm, propsToControlPanel, openSearch, setOpenSearch, dataPurchases, setBulkForm } = useOtherPurchases({ setLoading });

  const { documentCode, documentId, date, dateOut, typeDocto, providerType, orderId, providerId, paymentTypeId, cai, numCai, description, noCtaExpense, exemptedCertificate, exemptedNumber, exemptedRecord, subtotal, discount, exonera, exent, gravado, tax, freight, otherCharges, total, nameRequire } = formState;

  const { documentCodeValid, dateValid, dateOutValid, typeDoctoValid, providerTypeValid, providerIdValid, paymentTypeIdValid, caiValid, numCaiValid, noCtaExpenseValid } = formValidation;


  const propsToModalPurchases = {
    ModalContent: ModalViewPurchases,
    title: "page.purchases.modal.viewPurchases.title",
    open: openSearch,
    setOpen: setOpenSearch,
    maxWidth: 'lg',
    data: {
      dataPurchases,
      setBulkForm,
      fnGetDataDetail: () => { }
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <Row>
                <Colxx xxs={12} md={8} lg={9} className="order-xs-2 order-lg-1">
                  <Row>
                    <Colxx xxs={12} sm={8} >
                      <SearchSelect
                        label="pages.select.documentCode"
                        name="documentCode"
                        inputValue={documentCode}
                        options={listDocuments}
                        onChange={onInputChange}
                        invalid={sendForm && !!documentCodeValid}
                        feedbackText={sendForm && (documentCodeValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={4} >
                      <InputField
                        label="pages.input.documentId"
                        name="documentId"
                        value={documentId}
                        disabled
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
                        invalid={sendForm && !!providerIdValid}
                        feedbackText={sendForm && (providerIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6} xl={5}>
                      <SearchSelect
                        label="page.purchases.select.paymentTypeId"
                        name="paymentTypeId"
                        inputValue={paymentTypeId}
                        options={listPaymentTypes}
                        onChange={onInputChange}
                        invalid={sendForm && !!paymentTypeIdValid}
                        feedbackText={sendForm && (paymentTypeIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6} xl={2}>
                      <InputField
                        label="page.purchases.input.orderId"
                        name="orderId"
                        value={orderId}
                        onChange={onInputChange}
                        disabled
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
                        // tag={ReactInputMask}
                        invalid={sendForm && !!caiValid}
                        feedbackText={sendForm && (caiValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" xl="4">
                      <InputField
                        name="numCai"
                        label='page.purchases.input.numCai'
                        value={numCai}
                        onChange={onInputChange}
                        type="text"
                        mask="***-***-**-********"
                        maskChar=" "
                        // tag={ReactInputMask}
                        invalid={sendForm && !!numCaiValid}
                        feedbackText={sendForm && (numCaiValid || null)}
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
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} >
                      <SearchSelect
                        label="page.purchases.select.accountExpense"
                        name="noCtaExpense"
                        inputValue={noCtaExpense}
                        options={listLedgerAccounts}
                        onChange={onInputChange}
                        invalid={sendForm && !!noCtaExpenseValid}
                        feedbackText={sendForm && (noCtaExpenseValid || null)}
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
                      />
                    </Colxx>
                    <Colxx xxs={12} md={4}>
                      <InputField
                        label="page.purchases.input.exemptedCertificate"
                        name="exemptedCertificate"
                        value={exemptedCertificate}
                        onChange={onInputChange}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={4}>
                      <InputField
                        label="page.purchases.input.exemptedRecord"
                        name="exemptedRecord"
                        value={exemptedRecord}
                        onChange={onInputChange}
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
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.discount"
                        name="discount"
                        value={discount}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.exonerated"
                        name="exonera"
                        value={exonera}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.exent"
                        name="exent"
                        value={exent}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.taxed"
                        name="gravado"
                        value={gravado}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.tax"
                        name="tax"
                        value={tax}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.flete"
                        name="freight"
                        value={freight}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.otherCharges"
                        name="otherCharges"
                        value={otherCharges}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                    <Colxx xxs={12} xs={6} md={4}>
                      <InputField
                        label="input.total"
                        name="total"
                        value={total}
                        onChange={onInputChange}
                        type="number"
                      />
                    </Colxx>
                  </Row>
                  <hr />
                  <Row>
                    <Colxx xxs={12}>
                      <InputField
                        label="page.purchases.input.nameRequire"
                        name="nameRequire"
                        value={nameRequire}
                        onChange={onInputChange}
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
                        invalid={sendForm && !!dateValid}
                        feedbackText={sendForm && (dateValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12}>
                      <DateCalendar
                        name="dateOut"
                        label="pages.input.dateOut"
                        value={dateOut}
                        onChange={onInputChange}
                        invalid={sendForm && !!dateOutValid}
                        feedbackText={sendForm && (dateOutValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm={6} lg={12}>
                      <RadioGroup
                        label="page.purchases.radio.typePurchase"
                        name="typeDocto"
                        value={typeDocto}
                        onChange={onInputChange}
                        options={[
                          { id: 1, label: 'page.purchases.radio.cash' },
                          { id: 2, label: 'page.purchases.radio.credit' }
                        ]}
                        display='flex'
                        invalid={sendForm && !!typeDoctoValid}
                        feedbackText={sendForm && (typeDoctoValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm={6} lg={12}>
                      <RadioGroup
                        label="page.providers.select.typeProvider"
                        name="providerType"
                        value={providerType}
                        onChange={onInputChange}
                        options={[
                          { id: 1, label: 'page.purchases.radio.provider' },
                          { id: 2, label: 'page.purchases.radio.vendor' }
                        ]}
                        display='flex'
                        invalid={sendForm && !!providerTypeValid}
                        feedbackText={sendForm && (providerTypeValid || null)}
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
    </>
  );
}
export default OtherPurchases;