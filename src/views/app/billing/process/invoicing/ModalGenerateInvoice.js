import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { RadioGroup } from "@/components/radioGroup";
import { ContainerWithLabel } from "@/components/containerWithLabel";
import { InputField } from "@/components/inputFields";
import moment from 'moment';
import DateCalendar from '@/components/dateCalendar';
import ViewPdf from "@/components/ViewPDF/ViewPdf";
import Modal from "@/components/modal";

const ModalGenerateInvoice = (props) => {
  const { data, setOpen } = props;
  const { id, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, currency,
    typeDocument, setLoading, setOpenModalPrint, userData, onInputChangeIndex } = data;

  //print invoice
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    documentId: 0,
    date: "",
    cai: "",
    numcai: "",
    range: "",
    dateOut: "",
    typeChange: "1.0000",
    exemptedCertificate: "",
    exemptedNumber: "",
    exemptedRecord: ""
  });

  const { documentId, date, cai, numcai, range, dateOut, typeChange, exemptedCertificate, exemptedNumber,
    exemptedRecord } = formState;

  const fnGenerateInvoice = () => {
    request.POST('admin/documents/getCurrentNumber', { code: typeDocument }, (resp2) => {
      const newDocument = {
        documentId: resp2.data.codeInt,
        cai: resp2.data.cai,
        numcai: resp2.data.numCai,
        dateOut: resp2?.data?.limitDate || "1900-01-01",
        range: resp2.data.noRange
      }
      setBulkForm(newDocument);
      console.log(resp2.data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveInvoice = () => {

    const newData = {
      documentId,
      date: date === '' ? moment(new Date()).format("YYYY-MM-DD") : date,
      cai,
      numcai,
      range,
      dateOut,
      typeChange,
      exemptedCertificate,
      exemptedNumber,
      exemptedRecord
    }

    setLoading(true);
    request.PUT(`billing/process/invoices/${id}`, newData, (resp) => {
      onInputChangeIndex({ target: { name: 'documentId', value: documentId } });
      request.GETPdfUrl('billing/process/invoices/exportPDF', { id, userName: userData.name }, (resp) => {
        setDocumentPath(resp);
        setOpenViewFile(true);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "page.invoicing.modal.printInvoice.title",
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" lg="10">
            <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.taxDocument">
              <Row className="mb-2">
                <Colxx xxs="12" align="right">
                  <Button color="info" onClick={fnGenerateInvoice}>
                    <i className="bi bi-arrow-clockwise" /> {IntlMessages("button.generate")}
                  </Button>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" md="6">
                  <DateCalendar
                    value={date}
                    name="date"
                    label="page.invoicing.input.dateDocument"
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={cai}
                    name="cai"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.cai"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={typeChange}
                    name="typeChange"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.exchangeRate"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={numcai}
                    name="numcai"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.number"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={range}
                    name="range"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.range"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <DateCalendar
                    value={dateOut}
                    name="dateOut"
                    disabled
                    label="page.invoicing.modal.generateInvoice.input.dateExpiration"
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" lg="6">
                  <RadioGroup
                    label="page.invoicing.title.currency"
                    name="currency"
                    value={currency}
                    onChange={onInputChange}
                    options={
                      [
                        { id: 1, label: "page.invoicing.radio.lempira" },
                        { id: 2, label: "page.invoicing.radio.dollar" }
                      ]
                    }
                    disabled
                    display="flex"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12" lg="2">
            <Row>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subTotalValue}
                  name="subTotalValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.input.subtotal"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={discount}
                  name="discount"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.input.discValue"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subTotExoValue}
                  name="subTotExoValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.exonerated"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subTotExeValue}
                  name="subTotExeValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.exempt"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subtotTaxValue}
                  name="subtotTaxValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.taxed"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={taxValueInvoice}
                  name="taxValueInvoice"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.taxes"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={total}
                  name="total"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.total"
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.infoInvoice">
              <Row>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedCertificate}
                    name="exemptedCertificate"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.orderNumber"
                  />
                </Colxx>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedNumber}
                    name="exemptedNumber"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.certificateNumber"
                  />
                </Colxx>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedRecord}
                    id="exemptedRecord"
                    name="exemptedRecord"
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.identificationNumber"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveInvoice}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToViewPDF} />
    </>
  )
}

export default ModalGenerateInvoice;