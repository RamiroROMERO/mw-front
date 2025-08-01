import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { InputField } from "@/components/inputFields";
import { useForm } from "@/hooks";
// import InputMask from 'react-input-mask';
import DateCalendar from "@/components/dateCalendar";

const ModalBillingData = (props) => {
  const { data, setOpen } = props;
  const { currentItem, setLoading } = data;
  const [sendForm, setSendForm] = useState(false);

  const billingDataValid = {
    cai: [(val) => val.length > 0 && val.length < 38, "msg.required.input.cai"],
    rangeIn: [(val) => val.length > 0 && val.length === 8, "msg.required.input.range"],
    rangeOut: [(val) => val.length > 0 && val.length === 8, "msg.required.input.range"],
    dateLimit: [(val) => val !== "", "msg.required.input.deadline"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    cai: currentItem.cai ? currentItem.cai : "",
    rangeIn: currentItem.rangeIn ? currentItem.rangeIn : 0,
    rangeOut: currentItem.rangeOut ? currentItem.rangeOut : 0,
    dateLimit: currentItem.dateLimit ? currentItem.dateLimit : ""
  }, billingDataValid);

  const { id, cai, rangeIn, rangeOut, dateLimit } = formState;

  const { caiValid, rangeInValid, rangeOutValid, dateLimitValid } = formValidation;

  const fnSaveBillingData = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      cai,
      rangeIn,
      rangeOut,
      dateLimit
    }
    setLoading(true);
    request.PUT(`inventory/process/providers/${currentItem.id}`, newData, (resp) => {
      console.log(resp);
      setOpen(false);
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
              value={cai}
              name="cai"
              mask="******-******-******-******-******-**"
              maskChar=" "
              onChange={onInputChange}
              // tag={InputMask}
              type="text"
              label="page.providers.modal.billingData.input.cai"
              invalid={sendForm && !!caiValid}
              feedbackText={sendForm && (caiValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="6">
            <InputField
              value={rangeIn}
              name="rangeIn"
              mask="99999999"
              maskChar=" "
              onChange={onInputChange}
              // tag={InputMask}
              type="text"
              label="page.providers.modal.billingData.input.initialRank"
              invalid={sendForm && !!rangeInValid}
              feedbackText={sendForm && (rangeInValid || null)}
            />
          </Colxx>
          <Colxx xxs="6">
            <InputField
              value={rangeOut}
              name="rangeOut"
              mask="99999999"
              maskChar=" "
              onChange={onInputChange}
              // tag={InputMask}
              type="text"
              label="page.providers.modal.billingData.input.finalRank"
              invalid={sendForm && !!rangeOutValid}
              feedbackText={sendForm && (rangeOutValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="6">
            <DateCalendar
              value={dateLimit}
              label="page.providers.modal.billingData.input.deadline"
              onChange={onInputChange}
              name="dateLimit"
              invalid={sendForm && !!dateLimitValid}
              feedbackText={sendForm && (dateLimitValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveBillingData}><i className="iconsminds-save" />
          {` ${IntlMessages("button.save")}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalBillingData;