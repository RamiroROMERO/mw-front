import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { RadioGroup } from '@Components/radioGroup';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';

// Equivalente a fac_pos_edit_info.sc2: edita metadatos de cabecera de una factura ya
// guardada (RTN/Nombre, Notas, Tipo de Venta, Fecha de Vencimiento, No. de Orden de
// Compra, Exonerada + sus 3 números de constancia, y opcionalmente reasigna el vendedor
// en todas las líneas). Ninguno de estos campos afecta el valor del documento.
const ModalEditInvoiceInfo = (props) => {
  const { data, setOpen } = props;
  const { id, hasSellerControl, listSellers, setLoading, fnSuccess } = data;

  const [readOnlyInfo, setReadOnlyInfo] = useState({ documentCode: '', documentId: 0, numcai: '', date: '', total: 0 });

  const { formState, onInputChange, setBulkForm } = useForm({
    customerDNI: '',
    customerName: '',
    notes: '',
    documentType: 1,
    expirationDate: '',
    purchaseOrderNumber: '',
    documentExo: false,
    exemptedCertificate: '',
    exemptedNumber: '',
    exemptedRecord: '',
    sellerCode: ''
  });

  const { customerDNI, customerName, notes, documentType, expirationDate, purchaseOrderNumber, documentExo,
    exemptedCertificate, exemptedNumber, exemptedRecord, sellerCode } = formState;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    request.GET(`billing/process/invoices/editInfo/${id}`, (resp) => {
      setReadOnlyInfo({
        documentCode: resp.data.documentCode,
        documentId: resp.data.documentId,
        numcai: resp.data.numcai,
        date: resp.data.date,
        total: resp.data.total
      });
      setBulkForm({
        customerDNI: resp.data.customerDNI,
        customerName: resp.data.customerName,
        notes: resp.data.notes,
        documentType: resp.data.documentType,
        expirationDate: resp.data.expirationDate,
        purchaseOrderNumber: resp.data.purchaseOrderNumber,
        documentExo: resp.data.documentExo,
        exemptedCertificate: resp.data.exemptedCertificate,
        exemptedNumber: resp.data.exemptedNumber,
        exemptedRecord: resp.data.exemptedRecord,
        sellerCode: ''
      });
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleExoChange = (e) => {
    onInputChange({ target: { name: 'documentExo', value: e.target.checked } });
  }

  const fnAccept = () => {
    setLoading(true);
    request.PUT(`billing/process/invoices/editInfo/${id}`, {
      customerDNI, customerName, notes, documentType, expirationDate, purchaseOrderNumber,
      documentExo, exemptedCertificate, exemptedNumber, exemptedRecord, sellerCode
    }, () => {
      notification('success', 'page.invoicing.modal.editInfo.msg.success', 'alert.success.title');
      setLoading(false);
      fnSuccess({ customerDNI, customerName, notes, documentType, documentExo });
      setOpen(false);
    }, (err) => {
      notification('error', 'page.invoicing.modal.editInfo.msg.error', 'alert.error.title');
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="12" sm="3">
            <strong>{IntlMessages("page.invoicing.input.internalNumber")}:</strong> {readOnlyInfo.documentCode}-{readOnlyInfo.documentId}
          </Colxx>
          <Colxx xxs="12" sm="3">
            <strong>{IntlMessages("page.invoicing.input.fiscalNumber")}:</strong> {readOnlyInfo.numcai}
          </Colxx>
          <Colxx xxs="12" sm="3">
            <strong>{IntlMessages("page.invoicing.input.dateDocument")}:</strong> {readOnlyInfo.date}
          </Colxx>
          <Colxx xxs="12" sm="3">
            <strong>{IntlMessages("page.invoicing.input.total")}:</strong> {readOnlyInfo.total}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="6">
            <InputField value={customerDNI} name="customerDNI" onChange={onInputChange} type="text" label="page.invoicing.modal.generateQuotation.input.rtn" />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField value={customerName} name="customerName" onChange={onInputChange} type="text" label="page.invoicing.modal.deliveryDoc.input.name" />
          </Colxx>
          <Colxx xxs="12">
            <InputField value={notes} name="notes" onChange={onInputChange} type="text" label="page.invoicing.input.reference" />
          </Colxx>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.invoicing.title.salesType"
              name="documentType"
              value={documentType}
              onChange={onInputChange}
              options={[
                { id: 1, label: "page.invoicing.radio.cash" },
                { id: 2, label: "page.invoicing.radio.credit" }
              ]}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <DateCalendar value={expirationDate} name="expirationDate" label="page.invoicing.modal.editInfo.input.expirationDate" onChange={onInputChange} />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField value={purchaseOrderNumber} name="purchaseOrderNumber" onChange={onInputChange} type="text" label="page.invoicing.modal.editInfo.input.purchaseOrderNumber" />
          </Colxx>
          {hasSellerControl && (
            <Colxx xxs="12" md="6">
              <SearchSelect
                label="page.invoicing.select.sellerId"
                name="sellerCode"
                inputValue={sellerCode}
                onChange={onInputChange}
                options={listSellers}
                getOptionValue={(item) => item.code}
              />
            </Colxx>
          )}
          <Colxx xxs="12">
            <Checkbox label="page.invoicing.check.exemptInvoice" name="documentExo" value={documentExo} onChange={handleExoChange} />
          </Colxx>
        </Row>
        {documentExo && (
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.infoInvoice">
                <Row>
                  <Colxx xxs="12" lg="6">
                    <InputField value={exemptedCertificate} name="exemptedCertificate" onChange={onInputChange} type="text" label="page.invoicing.modal.generateInvoice.input.orderNumber" />
                  </Colxx>
                  <Colxx xxs="12" lg="6">
                    <InputField value={exemptedNumber} name="exemptedNumber" onChange={onInputChange} type="text" label="page.invoicing.modal.generateInvoice.input.certificateNumber" />
                  </Colxx>
                  <Colxx xxs="12" lg="6">
                    <InputField value={exemptedRecord} name="exemptedRecord" onChange={onInputChange} type="text" label="page.invoicing.modal.generateInvoice.input.identificationNumber" />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}><i className="bi bi-check-lg" /> {IntlMessages("button.accept")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalEditInvoiceInfo;
