import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { InputField } from "@/components/inputFields";
import { useForm } from "@/hooks";
import moment from 'moment'

const ModalInvoice = (props) => {
  const { data, setOpen } = props;
  const { projectData, fnGetPayment, setLoading } = data;
  const date = moment(new Date()).format("YYYY/MM/DD");
  const [sendForm, setSendForm] = useState(false);

  const invoiceValid = {
    value: [(val) => validInt(val) > 0, "msg.required.input.valueInvoice"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    value: 0
  }, invoiceValid);

  const { value } = formState;

  const { valueValid } = formValidation;

  const fnGenInvoice = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      orderId: projectData.id,
      date,
      customerId: projectData.customerId,
      notes: projectData.description,
      value
    }

    setLoading(true);
    request.POST('prodOrderPayments', newData, (resp) => {
      console.log(resp);
      fnGetPayment();
      setOpen(false)
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={projectData.facCliente ? projectData.facCliente.nomcli : ""}
              name="customerName"
              disabled
              type="text"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={projectData.description}
              name="description"
              type="textarea"
              disabled
              label="page.workOrders.modal.modalNew.select.description"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6">
            <InputField
              value={value}
              name="value"
              onChange={onInputChange}
              type="text"
              label="page.workOrders.detail.modal.invoice.valueInvoice"
              invalid={sendForm && !!valueValid}
              feedbackText={sendForm && (valueValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnGenInvoice}><i className="iconsminds-save" />
          {` ${IntlMessages("button.generateInvoice")}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalInvoice;