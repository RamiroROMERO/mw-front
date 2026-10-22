import { useMemo, useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { request } from '@Helpers/core';
import { InputField } from "@Components/inputFields";
import { useForm } from "@Hooks";
// import InputMask from 'react-input-mask';
import DateCalendar from "@Components/dateCalendar";
import { validateBillingData, buildBillingPayload } from "./providerRules";

// 1900-01-01 es el "sin fecha" de la DB: se muestra vacío.
const cleanDate = (value) => (value && !String(value).startsWith("1900-01-01") ? String(value).slice(0, 10) : "");

const ModalBillingData = (props) => {
  const { data, setOpen } = props;
  const { currentItem, setLoading, onSaved } = data;
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange } = useForm({
    id: 0,
    cai: currentItem.cai ? currentItem.cai : "",
    rangeIn: Number(currentItem.rangeIn) > 0 ? currentItem.rangeIn : "",
    rangeOut: Number(currentItem.rangeOut) > 0 ? currentItem.rangeOut : "",
    dateLimit: cleanDate(currentItem.dateLimit)
  });

  // Mismas reglas que el back (providerRules.js, ProviderBillingDataDTO): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateBillingData(formState), [formState]);

  const { cai, rangeIn, rangeOut, dateLimit } = formState;

  const showError = (field) => (sendForm && errors[field]) || null;

  const fnSaveBillingData = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    const payload = buildBillingPayload(formState);
    request.PUT(`inventory/process/providers/${currentItem.id}/billingData`, payload, (resp) => {
      if (onSaved) onSaved(payload);
      setOpen(false);
      setLoading(false);
    }, (err) => {
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
              invalid={sendForm && !!errors.cai}
              feedbackText={showError('cai')}
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
              invalid={sendForm && !!errors.rangeIn}
              feedbackText={showError('rangeIn')}
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
              invalid={sendForm && !!errors.rangeOut}
              feedbackText={showError('rangeOut')}
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
              invalid={sendForm && !!errors.dateLimit}
              feedbackText={showError('dateLimit')}
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