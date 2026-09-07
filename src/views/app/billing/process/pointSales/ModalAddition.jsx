import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { IntlMessages, validFloat } from "@Helpers/Utils";
import { useForm } from "@Hooks";

const additionValid = {
  percent: [(val) => validFloat(val) > 0 && validFloat(val) <= 100, "msg.required.input.percentAddition"]
}

const ModalAddition = (props) => {
  const { data, setOpen } = props;
  const { fnConfirm } = data;
  const [sendForm, setSendForm] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange } = useForm({
    percent: 0
  }, additionValid);

  const { percent } = formState;
  const { percentValid } = formValidation;

  const fnAccept = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    fnConfirm(validFloat(percent));
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <p>{IntlMessages("msg.question.applyAddition.title")}</p>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="percent"
              label="page.pointSales.modal.addition.input.percent"
              value={percent}
              onChange={onInputChange}
              type="number"
              invalid={sendForm && !!percentValid}
              feedbackText={sendForm && (percentValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" />{IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalAddition;
