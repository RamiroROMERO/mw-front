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
import { API_PATH, withSession, buildInfoBody, buildInfoPatch, regeneratesAccounting, validateInfoForm } from './postEditRules';

// El grupo de radios del tipo de venta se llama distinto al del formulario principal: con el mismo nombre los `id` (y el `for` de cada etiqueta) chocaban y el clic
// caía en el radio deshabilitado de la factura.
// Editar información de una factura fiscal (SPEC v2-72-sr; fac_pos_edit_info.sc2). Solo se manda lo que cambió y el servidor nunca borra lo omitido. Cambiar el
// tipo de venta o la exoneración regenera la partida (con el mismo número) y la CxC: pide motivo y la CxC no puede tener pagos aplicados.
const ModalEditInvoiceInfo = (props) => {
  const { data, setOpen } = props;
  const { id, hasSellerControl, listSellers, setLoading, fnSuccess, apiPath = API_PATH, sessionId } = data;

  const [readOnlyInfo, setReadOnlyInfo] = useState({ documentCode: '', documentId: 0, numcai: '', date: '', total: 0 });
  const [original, setOriginal] = useState({});
  const [reason, setReason] = useState('');
  const [send, setSend] = useState(false);

  const { formState, onInputChange, setBulkForm } = useForm({
    customerDNI: '', customerName: '', notes: '', documentType: 1, expirationDate: '', purchaseOrderNumber: '', isExonerated: false,
    exemptedCertificate: '', exemptedNumber: '', exemptedRecord: '', sellerId: 0
  });
  const { customerDNI, customerName, notes, documentType, expirationDate, purchaseOrderNumber, isExonerated, exemptedCertificate, exemptedNumber, exemptedRecord, sellerId } = formState;

  // IntlMessages es un hook: se piden los textos una vez aquí arriba, nunca dentro de una condición.
  const regenText = IntlMessages("page.invoicing.modal.postEdit.regenerates");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    request.GET(withSession(`${apiPath}/${id}/info`, sessionId), (resp) => {
      const info = resp.data;
      setReadOnlyInfo({ documentCode: info.documentCode, documentId: info.documentId, numcai: info.numcai, date: info.date, total: info.total });
      const loaded = {
        customerDNI: info.customerDNI, customerName: info.customerName, notes: info.notes, documentType: info.documentType, expirationDate: info.expirationDate,
        purchaseOrderNumber: info.purchaseOrderNumber, isExonerated: info.isExonerated, exemptedCertificate: info.exemptedCertificate, exemptedNumber: info.exemptedNumber,
        exemptedRecord: info.exemptedRecord, sellerId: info.sellerId
      };
      setOriginal(loaded);
      setBulkForm(loaded);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const patch = buildInfoPatch(original, formState);
  const errors = send ? validateInfoForm(formState, patch, reason) : {};

  const fnAccept = () => {
    setSend(true);
    const problems = validateInfoForm(formState, patch, reason);
    if (Object.keys(problems).length > 0) {
      if (problems.patch) notification('warning', problems.patch, 'alert.warning.title');
      return;
    }
    setLoading(true);
    // El mensaje real del back (período cerrado, pagos aplicados, etc.) lo muestra `request.PUT`: aquí solo se libera la pantalla.
    request.PUT(withSession(`${apiPath}/${id}/info`, sessionId), buildInfoBody(patch, reason), () => {
      notification('success', 'page.invoicing.modal.editInfo.msg.success', 'alert.success.title');
      setLoading(false);
      fnSuccess();
      setOpen(false);
    }, () => {
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
            <InputField value={customerDNI} name="customerDNI" onChange={onInputChange} type="text" maxLength={20} label="page.invoicing.modal.generateQuotation.input.rtn"
              invalid={!!errors.customerDNI} feedbackText={errors.customerDNI} />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField value={customerName} name="customerName" onChange={onInputChange} type="text" maxLength={100} label="page.invoicing.modal.deliveryDoc.input.name"
              invalid={!!errors.customerName} feedbackText={errors.customerName} />
          </Colxx>
          <Colxx xxs="12">
            <InputField value={notes} name="notes" onChange={onInputChange} type="text" label="page.invoicing.input.reference" />
          </Colxx>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.invoicing.title.salesType"
              name="postEditDocumentType"
              value={documentType}
              onChange={(e) => onInputChange({ target: { name: 'documentType', value: Number(e.target.value) } })}
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
            <InputField value={purchaseOrderNumber} name="purchaseOrderNumber" onChange={onInputChange} type="text" maxLength={50} label="page.invoicing.modal.editInfo.input.purchaseOrderNumber" />
          </Colxx>
          {hasSellerControl && (
            <Colxx xxs="12" md="6">
              <SearchSelect
                label="page.invoicing.select.sellerId"
                name="sellerId"
                inputValue={sellerId}
                onChange={onInputChange}
                options={listSellers}
              />
            </Colxx>
          )}
          <Colxx xxs="12">
            <Checkbox label="page.invoicing.check.exemptInvoice" name="isExonerated" value={isExonerated} onChange={(e) => onInputChange({ target: { name: 'isExonerated', value: e.target.checked } })} />
          </Colxx>
        </Row>
        {isExonerated && (
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.infoInvoice">
                <Row>
                  <Colxx xxs="12" lg="6">
                    <InputField value={exemptedCertificate} name="exemptedCertificate" onChange={onInputChange} type="text" maxLength={50} label="page.invoicing.modal.generateInvoice.input.orderNumber"
                      invalid={!!errors.exemptedCertificate} feedbackText={errors.exemptedCertificate} />
                  </Colxx>
                  <Colxx xxs="12" lg="6">
                    <InputField value={exemptedNumber} name="exemptedNumber" onChange={onInputChange} type="text" maxLength={50} label="page.invoicing.modal.generateInvoice.input.certificateNumber" />
                  </Colxx>
                  <Colxx xxs="12" lg="6">
                    <InputField value={exemptedRecord} name="exemptedRecord" onChange={onInputChange} type="text" maxLength={50} label="page.invoicing.modal.generateInvoice.input.identificationNumber" />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        )}
        {regeneratesAccounting(patch) && <p className="text-warning small mt-2">{regenText}</p>}
        <Row>
          <Colxx xxs="12">
            <InputField value={reason} name="reason" onChange={(e) => setReason(e.target.value)} type="text" maxLength={200} label="page.invoicing.modal.postEdit.reason"
              invalid={!!errors.reason} feedbackText={errors.reason} />
          </Colxx>
        </Row>
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
