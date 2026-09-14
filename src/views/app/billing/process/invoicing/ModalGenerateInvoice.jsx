import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Alert } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import { RadioGroup } from "@Components/radioGroup";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import { InputField } from "@Components/inputFields";
import DateCalendar from '@Components/dateCalendar';
import ViewPdf from "@Components/ViewPDF/ViewPdf";
import Modal from "@Components/modal";
import notification from '@Containers/ui/Notifications';

const ModalGenerateInvoice = (props) => {
  const { data, setOpen } = props;
  const { id, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, currency,
    setLoading, userData, onInputChangeIndex } = data;

  //print invoice
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [stockShortages, setStockShortages] = useState([]);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    cai: "",
    numcai: "",
    range: "",
    dateOut: "",
    typeChange: "1.0000",
    exemptedCertificate: "",
    exemptedNumber: "",
    exemptedRecord: ""
  });

  const { cai, numcai, range, dateOut, typeChange, exemptedCertificate, exemptedNumber, exemptedRecord } = formState;

  // Genera el documento fiscal (CAI) y, en la misma transacción atómica del backend,
  // el kardex de salida, la partida contable y la CxC del cliente — reemplaza el flujo
  // anterior de "previsualizar número" + PUT suelto, que nunca contabilizaba nada.
  const fnGenerateInvoice = () => {
    setLoading(true);
    setStockShortages([]);
    request.POST(`billing/process/invoices/generateFiscalDocument/${id}`, { typeChange, exemptedCertificate, exemptedNumber, exemptedRecord }, (resp) => {
      const newDocument = {
        cai: resp.data.cai,
        numcai: resp.data.numcai,
        range: resp.data.range,
        dateOut: resp.data.dateOut
      }
      setBulkForm(newDocument);
      setDocumentGenerated(true);
      onInputChangeIndex({ target: { name: 'documentId', value: resp.data.documentId } });
      onInputChangeIndex({ target: { name: 'numcai', value: resp.data.numcai } });
      request.GETPdfUrl('billing/process/invoices/exportPDF', { id, userName: userData.name }, (resp2) => {
        setDocumentPath(resp2);
        setOpenViewFile(true);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }, (err) => {
      // Misma validación de existencias que ya corre GenerateFiscalDocumentService
      // (fnValidExist del legacy) — antes fallaba en silencio, ahora se muestra el
      // listado de faltantes (equivalente a fac_pos_no_exist.scx).
      const errorInfo = err?.messages?.[0]?.description;
      if (errorInfo?.name === 'stock.insufficient') {
        try {
          setStockShortages(JSON.parse(errorInfo.description) || []);
        } catch (parseErr) {
          setStockShortages([]);
        }
        notification('error', 'msg.error.generateFiscalDocument.stockInsufficient', 'alert.error.title');
      } else {
        notification('error', 'msg.error.generateFiscalDocument.generic', 'alert.error.title');
      }
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
              <Row>
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
                    disabled={documentGenerated}
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
                    disabled={documentGenerated}
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.orderNumber"
                  />
                </Colxx>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedNumber}
                    name="exemptedNumber"
                    disabled={documentGenerated}
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
                    disabled={documentGenerated}
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.identificationNumber"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        {stockShortages.length > 0 && (
          <Row>
            <Colxx xxs="12">
              <Alert color="danger">
                <strong>{IntlMessages("page.invoicing.modal.generateInvoice.stockShortages.title")}</strong>
                <ul className="mb-0">
                  {stockShortages.map((item, idx) => (
                    <li key={`shortage-${idx}`}>
                      {item.productCode} — {IntlMessages("page.invoicing.modal.generateInvoice.stockShortages.requested")}: {formatNumber(item.requested)}, {IntlMessages("page.invoicing.modal.generateInvoice.stockShortages.available")}: {formatNumber(item.available)}
                    </li>
                  ))}
                </ul>
              </Alert>
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={documentGenerated} onClick={fnGenerateInvoice}>
          <i className="bi bi-arrow-clockwise" /> {IntlMessages("button.generate")}
        </Button>
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