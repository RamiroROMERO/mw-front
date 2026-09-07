import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { IntlMessages } from "@Helpers/Utils";
import { useForm } from "@Hooks";

const voidInvoiceValid = {
  reason: [(val) => val.trim() !== "", "msg.required.input.voidReason"]
}

const ModalVoidInvoice = (props) => {
  const { data, setOpen } = props;
  const { invoiceNumber, numcai, fnConfirm } = data;
  const [sendForm, setSendForm] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm } = useForm({
    reason: ""
  }, voidInvoiceValid);

  const { reason } = formState;
  const { reasonValid } = formValidation;

  const fnAccept = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    fnConfirm(reason.trim());
  }

  const fnClose = () => {
    onResetForm();
    setSendForm(false);
    setOpen(false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <p>{IntlMessages("msg.question.cancelInvoice.title")}</p>
            <p><strong>{IntlMessages("page.invoicing.input.internalNumber")}:</strong> {invoiceNumber}</p>
            {numcai ? <p><strong>{IntlMessages("page.invoicing.input.fiscalNumber")}:</strong> {numcai}</p> : null}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="reason"
              label="page.pointSales.modal.voidInvoice.input.reason"
              value={reason}
              onChange={onInputChange}
              type="textarea"
              invalid={sendForm && !!reasonValid}
              feedbackText={sendForm && (reasonValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" />{IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={fnClose}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalVoidInvoice;
