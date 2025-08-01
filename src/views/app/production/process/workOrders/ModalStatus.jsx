import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { SimpleSelect } from "@/components/simpleSelect";
import { InputField } from "@/components/inputFields";
import { useForm } from "@/hooks";
import SearchSelect from "@/components/SearchSelect/SearchSelect";

const ModalChangeStatus = (props) => {
  const { data, setOpen } = props;
  const { currentItem, listStatus, listCustomers, fnGetData, setLoading } = data;
  const [sendForm, setSendForm] = useState(false);

  const statusChangeValid = {
    status: [(val) => validInt(val) > 0, "msg.required.select.status"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    name: currentItem.name ? currentItem.name : '',
    customerId: currentItem.customerId ? currentItem.customerId : "0",
    status: currentItem.status ? currentItem.status : '1'
  }, statusChangeValid);

  const { name, customerId, status } = formState;

  const { statusValid } = formValidation;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      status
    }

    if (currentItem && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`prodProjects/${currentItem.id}`, newData, (resp) => {
        console.log(resp);
        setSendForm(false);
        fnGetData();
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={name}
              name="name"
              type="text"
              label="page.workOrders.modal.modalNew.input.name"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              name="customerId"
              label="page.workOrders.modal.modalNew.select.customer"
              inputValue={customerId}
              options={listCustomers}
              isDisabled
            />
          </Colxx>
          <Colxx xxs="12">
            <SimpleSelect
              value={status}
              name="status"
              onChange={onInputChange}
              label="page.workOrders.modal.modalNew.select.status"
              options={listStatus}
              invalid={sendForm && !!statusValid}
              feedbackText={sendForm && (statusValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save" />
          {IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalChangeStatus;